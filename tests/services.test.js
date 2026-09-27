import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { getCategories, getMedia } from '../src/services/nekoApi.js'
import { favoriteKey, readFavorites, saveFavorites } from '../src/services/favorites.js'

const originalFetch = globalThis.fetch
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage)
  else delete globalThis.localStorage
})

test('categorias são obtidas do JSON e separadas pelo formato da API', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ hug: { format: 'gif' }, waifu: { format: 'png' }, neko: { format: 'png' } }))
  assert.deepEqual(await getCategories(), { images: ['neko', 'waifu'], gifs: ['hug'] })
})

test('imagens e GIFs preservam os metadados recebidos', async () => {
  const media = { url: 'https://nekos.best/api/v2/hug/demo.gif', anime_name: 'Anime de exemplo', dimensions: { width: 400, height: 300 } }
  let requestedUrl
  globalThis.fetch = async (url) => {
    requestedUrl = url
    return new Response(JSON.stringify({ results: [media] }))
  }
  assert.deepEqual(await getMedia({ category: 'hug', amount: 2 }), [{ ...media, category: 'hug' }])
  assert.equal(requestedUrl, 'https://nekos.best/api/v2/hug?amount=2')
})

test('busca por texto envia o termo completo e o tipo de GIF sem restringir categorias', async () => {
  let requestedUrl
  globalThis.fetch = async (url) => {
    requestedUrl = new URL(url)
    return new Response(JSON.stringify({ results: [{ url: 'https://nekos.best/api/v2/hug/demo.gif', anime_name: 'Naruto & Sasuke' }] }))
  }
  const results = await getMedia({ query: '  Naruto & Sasuke  ', mediaType: 'gifs', amount: 3 })
  assert.equal(requestedUrl.pathname, '/api/v2/search')
  assert.equal(requestedUrl.searchParams.get('query'), 'Naruto & Sasuke')
  assert.equal(requestedUrl.searchParams.get('type'), '2')
  assert.equal(requestedUrl.searchParams.get('amount'), '20')
  assert.equal(requestedUrl.searchParams.has('category'), false)
  assert.equal(results[0].category, 'hug')
})

test('busca de artista permite filtrar a categoria de imagens', async () => {
  let requestedUrl
  globalThis.fetch = async (url) => {
    requestedUrl = new URL(url)
    return new Response(JSON.stringify({ results: [] }))
  }
  await getMedia({ query: 'maruma', mediaType: 'images', category: 'neko', amount: 6 })
  assert.equal(requestedUrl.searchParams.get('type'), '1')
  assert.equal(requestedUrl.searchParams.get('category'), 'neko')
})

test('busca sem correspondências retorna uma galeria vazia válida', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ results: [] }))
  assert.deepEqual(await getMedia({ query: 'sem correspondências', mediaType: 'gifs', amount: 6 }), [])
})

test('GIFs aproximados de outros animes e categorias não entram na busca Frieren + hug', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ results: [
    { url: 'https://nekos.best/api/v2/hug/1.gif', anime_name: 'Sousou no Frieren' },
    { url: 'https://nekos.best/api/v2/hug/2.gif', anime_name: 'Free' },
    { url: 'https://nekos.best/api/v2/sleep/3.gif', anime_name: 'Sousou no Frieren' },
    { url: 'https://nekos.best/api/v2/hug/4.gif', anime_name: 'Sousou no Frieren' },
  ] }))
  const results = await getMedia({ query: '  FRIEREN ', category: 'hug', mediaType: 'gifs', amount: 1 })
  assert.equal(results.length, 1)
  assert.equal(results[0].url, 'https://nekos.best/api/v2/hug/1.gif')
})

test('texto com apenas espaços mantém a busca aleatória por categoria', async () => {
  let requestedUrl
  globalThis.fetch = async (url) => {
    requestedUrl = url
    return new Response(JSON.stringify({ results: [] }))
  }
  await getMedia({ category: 'neko', amount: 6, query: '   ' })
  assert.equal(requestedUrl, 'https://nekos.best/api/v2/neko?amount=6')
})

test('quantidades inválidas não enviam pedidos à API', async () => {
  globalThis.fetch = () => assert.fail('Não deve realizar fetch')
  for (const amount of [0, 21, 1.5, NaN]) await assert.rejects(() => getMedia({ category: 'neko', amount }), /inteira entre 1 e 20/)
})

test('limite de requisições e respostas inesperadas geram mensagens compreensíveis', async () => {
  globalThis.fetch = async () => new Response('', { status: 429 })
  await assert.rejects(() => getMedia({ category: 'neko', amount: 1 }), /Aguarde um momento/)
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'formato diferente' }))
  await assert.rejects(() => getMedia({ category: 'neko', amount: 1 }), /dados inesperados/)
})

test('cancelamento de uma requisição é preservado para o componente ignorá-la', async () => {
  globalThis.fetch = async () => { throw new DOMException('Cancelado', 'AbortError') }
  await assert.rejects(() => getMedia({ category: 'neko', amount: 1 }), { name: 'AbortError' })
})

test('falhas de rede e JSON inválido são explicados em português', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(() => getMedia({ category: 'neko', amount: 1 }), /Verifique sua conexão/)
  globalThis.fetch = async () => new Response('<html>Serviço indisponível</html>')
  await assert.rejects(() => getMedia({ category: 'neko', amount: 1 }), /resposta inválida/)
})

test('favoritos podem ser gravados e lidos em uma nova visita', () => {
  const memory = new Map()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  } })
  const items = [{ url: 'https://nekos.best/api/v2/neko/demo.png', artist_name: 'Artista', category: 'neko' }]
  assert.equal(saveFavorites(items), true)
  assert.deepEqual(readFavorites(), items)
})

test('armazenamento inválido ou bloqueado não interrompe a aplicação', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => '{corrompido' } })
  assert.deepEqual(readFavorites(), [])
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: () => { throw new Error('Bloqueado') } })
  assert.deepEqual(readFavorites(), [])
  assert.equal(saveFavorites([]), false)
})

test('a mesma coleção preserva favoritos de anime e GIF com identificadores distintos', () => {
  let stored = '[]'
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => stored, setItem: (_key, value) => { stored = value } } })
  const anime = { kind: 'anime', id: 154587, title: 'Sousou no Frieren', tags: [], genres: [], url: 'https://s4.anilist.co/frieren.jpg' }
  const gif = { anime_name: 'Sousou no Frieren', url: 'https://nekos.best/api/v2/hug/frieren.gif' }
  saveFavorites([anime, gif])
  assert.deepEqual(readFavorites(), [anime, gif])
  assert.notEqual(favoriteKey(anime), favoriteKey(gif))
})

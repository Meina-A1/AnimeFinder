import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { getAnimeFilters, getAnimes, resolveAnimeSearch } from '../src/services/animeApi.js'

const originalFetch = globalThis.fetch
const filters = { tags: ['Yandere', 'Isekai', 'School'], genres: ['Action', 'Romance', 'Comedy'] }
afterEach(() => { globalThis.fetch = originalFetch })

test('yandere usa a tag do catálogo, mesmo sem a palavra no título do anime', () => {
  assert.deepEqual(resolveAnimeSearch('  YANDERE  ', 'auto', filters), { tag: 'Yandere', genre: null, search: null, label: 'Yandere', kind: 'tag' })
  assert.equal(resolveAnimeSearch('Frieren', 'auto', filters).search, 'Frieren')
})

test('gêneros em português são reconhecidos e o modo nome permite forçar uma busca de título', () => {
  assert.equal(resolveAnimeSearch('ação', 'auto', filters).genre, 'Action')
  assert.equal(resolveAnimeSearch('Romance', 'title', filters).search, 'Romance')
  assert.throws(() => resolveAnimeSearch('termo inexistente', 'keyword', filters), /Palavra-chave não encontrada/)
  assert.throws(() => resolveAnimeSearch('  ', 'auto', filters), /Digite o nome/)
})

test('sugestões vêm dos gêneros e das tags públicas da API', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ data: { GenreCollection: ['Romance'], MediaTagCollection: [{ name: 'Yandere', isAdult: false }, { name: 'Adulto', isAdult: true }] } }))
  assert.deepEqual(await getAnimeFilters(), { genres: ['Romance'], tags: ['Yandere'] })
})

test('consulta por característica usa tag, mantém paginação e remove marcações da sinopse', async () => {
  let variables
  globalThis.fetch = async (_url, options) => {
    variables = JSON.parse(options.body).variables
    return new Response(JSON.stringify({ data: { Page: { pageInfo: { currentPage: 2, hasNextPage: true }, media: [{
      id: 16498, title: { romaji: 'Anime de exemplo' }, coverImage: { large: 'https://s4.anilist.co/cover.jpg' },
      description: '<b>Uma história</b> &amp; seus personagens.',
      tags: [{ name: 'Yandere', rank: 80, isMediaSpoiler: false }, { name: 'Final', isMediaSpoiler: true }],
    }] } } }))
  }
  const results = await getAnimes(resolveAnimeSearch('yandere', 'auto', filters), 2)
  assert.equal(variables.tag, 'Yandere')
  assert.equal(variables.search, null)
  assert.equal(variables.page, 2)
  assert.equal(results.hasNextPage, true)
  assert.equal(results.items[0].matchedKeyword, 'Yandere')
  assert.equal(results.items[0].description, 'Uma história & seus personagens.')
  assert.deepEqual(results.items[0].tags.map((tag) => tag.name), ['Yandere'])
})

test('erros HTTP e GraphQL não viram uma falsa lista vazia', async () => {
  globalThis.fetch = async () => new Response('', { status: 429 })
  await assert.rejects(() => getAnimes({}), /Aguarde um minuto/)
  globalThis.fetch = async () => new Response(JSON.stringify({ data: null, errors: [{ message: 'Falha' }] }))
  await assert.rejects(() => getAnimes({}), /Não foi possível consultar/)
})

test('cancelamento de busca do catálogo é preservado', async () => {
  globalThis.fetch = async () => { throw new DOMException('Cancelado', 'AbortError') }
  await assert.rejects(() => getAnimes({}), { name: 'AbortError' })
})

const API_URL = 'https://nekos.best/api/v2'

function normalizeName(value = '') {
  return (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replaceAll('×', 'x').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

async function getJson(path, signal) {
  // O navegador envia seu próprio User-Agent. Não é necessário token ou chave.
  let response
  try {
    response = await fetch(`${API_URL}/${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Não foi possível conectar à API. Verifique sua conexão e tente novamente.')
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Muitas buscas em pouco tempo. Aguarde um momento e tente novamente.')
    }
    throw new Error('A API não respondeu. Verifique sua conexão e tente novamente.')
  }

  try {
    return await response.json()
  } catch {
    throw new Error('A API retornou uma resposta inválida. Tente novamente.')
  }
}

export async function getCategories(signal) {
  const data = await getJson('endpoints', signal)
  const categories = { images: [], gifs: [] }

  for (const [name, details] of Object.entries(data)) {
    if (details.format === 'png') categories.images.push(name)
    if (details.format === 'gif') categories.gifs.push(name)
  }

  categories.images.sort()
  categories.gifs.sort()

  if (!categories.images.length && !categories.gifs.length) {
    throw new Error('A API não retornou categorias disponíveis. Tente novamente.')
  }
  return categories
}

export async function getMedia({ category = '', amount, query = '', mediaType = 'images' }, signal) {
  const text = query.trim()
  if ((!text && !category) || (category && !/^[a-z]+$/.test(category)) || !Number.isInteger(amount) || amount < 1 || amount > 20 || !['images', 'gifs'].includes(mediaType)) {
    throw new Error('Escolha uma categoria e uma quantidade inteira entre 1 e 20.')
  }

  // A busca da API é aproximada: buscamos um lote e mostramos apenas os nomes compatíveis.
  const params = new URLSearchParams({ amount: String(text ? 20 : amount) })
  if (text) {
    params.set('query', text)
    params.set('type', mediaType === 'images' ? '1' : '2')
    if (category) params.set('category', category)
  }
  const endpoint = text ? 'search' : encodeURIComponent(category)
  const data = await getJson(`${endpoint}?${params}`, signal)
  if (!Array.isArray(data.results) || data.results.some((item) => !item.url)) {
    throw new Error('A API retornou dados inesperados. Tente novamente.')
  }

  // A categoria fica junto da mídia para aparecer também nos favoritos.
  const media = [...new Map(data.results.map((item) => [item.url, {
    ...item,
    category: new URL(item.url).pathname.split('/')[3] || category || 'anime',
  }])).values()]
  return media.filter((item) => (!category || item.category === category) && (!text || normalizeName(mediaType === 'gifs' ? item.anime_name : item.artist_name).includes(normalizeName(text)))).slice(0, amount)
}

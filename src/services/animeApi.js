const API_URL = 'https://graphql.anilist.co'

const FILTERS_QUERY = `query {
  GenreCollection
  MediaTagCollection { name isAdult }
}`

const ANIME_QUERY = `query ($page: Int, $search: String, $tag: String, $genre: String, $sort: [MediaSort]) {
  Page(page: $page, perPage: 12) {
    pageInfo { currentPage hasNextPage }
    media(type: ANIME, isAdult: false, search: $search, tag: $tag, genre: $genre, sort: $sort) {
      id siteUrl format episodes seasonYear averageScore
      title { romaji english }
      coverImage { large }
      description(asHtml: false)
      genres
      tags { name rank isMediaSpoiler isAdult }
    }
  }
}`

async function request(query, variables, signal) {
  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Não foi possível conectar ao catálogo. Verifique sua conexão e tente novamente.')
  }
  if (response.status === 429) throw new Error('O catálogo recebeu muitas buscas. Aguarde um minuto e tente novamente.')
  if (!response.ok) throw new Error('O catálogo está indisponível. Tente novamente em alguns instantes.')

  let payload
  try { payload = await response.json() } catch { throw new Error('O catálogo retornou uma resposta inválida.') }
  if (payload.errors?.length || !payload.data) throw new Error('Não foi possível consultar o catálogo. Tente novamente.')
  return payload.data
}

export async function getAnimeFilters(signal) {
  const data = await request(FILTERS_QUERY, {}, signal)
  if (!Array.isArray(data.MediaTagCollection) || !Array.isArray(data.GenreCollection)) {
    throw new Error('Não foi possível carregar as palavras-chave do catálogo.')
  }
  return {
    tags: data.MediaTagCollection.filter((tag) => !tag.isAdult).map((tag) => tag.name).sort(),
    genres: data.GenreCollection.sort(),
  }
}

export function normalizeTerm(value) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const translations = {
  acao: 'Action', aventura: 'Adventure', comedia: 'Comedy', fantasia: 'Fantasy',
  terror: 'Horror', misterio: 'Mystery', romance: 'Romance', sobrenatural: 'Supernatural',
  esportes: 'Sports', 'ficcao cientifica': 'Sci-Fi', escola: 'School',
  reencarnacao: 'Reincarnation', 'viagem no tempo': 'Time Manipulation',
}

// "yandere" vira um filtro de tag; "Naruto" vira uma busca pelo título.
export function resolveAnimeSearch(query, mode, filters) {
  const term = query.trim()
  if (!term) throw new Error('Digite o nome de um anime ou uma palavra-chave.')
  const normalized = normalizeTerm(term)
  const keyword = normalizeTerm(translations[normalized] || term)
  const tag = filters.tags.find((name) => normalizeTerm(name) === keyword)
  const genre = filters.genres.find((name) => normalizeTerm(name) === keyword)

  if (mode !== 'title' && (tag || genre)) {
    return { tag: tag || null, genre: tag ? null : genre, search: null, label: tag || genre, kind: tag ? 'tag' : 'genre' }
  }
  if (mode === 'keyword') throw new Error('Palavra-chave não encontrada. Escolha uma sugestão ou use a busca por nome.')
  return { search: term, tag: null, genre: null, label: term, kind: 'title' }
}

function plainDescription(value = '') {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim()
}

export async function getAnimes(criteria, page = 1, signal) {
  const data = await request(ANIME_QUERY, {
    page, search: criteria.search, tag: criteria.tag, genre: criteria.genre,
    sort: criteria.kind === 'title' ? ['SEARCH_MATCH'] : ['POPULARITY_DESC'],
  }, signal)
  if (!Array.isArray(data.Page?.media) || !data.Page?.pageInfo) throw new Error('O catálogo retornou dados inesperados.')
  return {
    hasNextPage: data.Page.pageInfo.hasNextPage,
    items: data.Page.media.map((anime) => ({
      kind: 'anime', id: anime.id,
      title: anime.title.romaji || anime.title.english || 'Anime sem título',
      englishTitle: anime.title.english,
      url: anime.coverImage?.large || null, siteUrl: anime.siteUrl,
      year: anime.seasonYear, format: anime.format, episodes: anime.episodes,
      score: anime.averageScore, description: plainDescription(anime.description),
      genres: anime.genres || [],
      tags: (anime.tags || []).filter((tag) => !tag.isMediaSpoiler && !tag.isAdult),
      matchedKeyword: criteria.tag || criteria.genre || null,
    })),
  }
}

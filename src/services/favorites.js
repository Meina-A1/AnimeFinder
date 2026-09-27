const STORAGE_KEY = 'neko-gallery:favorites'

export function favoriteKey(item) {
  return item.kind === 'anime' ? `anime:${item.id}` : item.url
}

export function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((item) => item && (item.kind === 'anime'
      ? Number.isInteger(item.id) && typeof item.title === 'string' && Array.isArray(item.tags) && Array.isArray(item.genres)
      : typeof item.url === 'string' && item.url.startsWith('https://nekos.best/')))
  } catch {
    // Um armazenamento vazio, bloqueado ou inválido não impede o uso da galeria.
    return []
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    return true
  } catch {
    return false
  }
}

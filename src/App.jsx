import { useEffect, useRef, useState } from 'react'
import SearchForm from './components/SearchForm.jsx'
import Gallery from './components/Gallery.jsx'
import Icon from './components/Icon.jsx'
import AnimeExplorer from './components/AnimeExplorer.jsx'
import { getCategories, getMedia } from './services/nekoApi.js'
import { favoriteKey, readFavorites, saveFavorites } from './services/favorites.js'

export default function App() {
  const [categories, setCategories] = useState({ images: [], gifs: [] })
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [categoryAttempt, setCategoryAttempt] = useState(0)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [lastSearch, setLastSearch] = useState(null)
  const [favorites, setFavorites] = useState(readFavorites)
  const [storageError, setStorageError] = useState('')
  const [view, setView] = useState('animes')
  const [galleryPreset, setGalleryPreset] = useState(null)
  const searchController = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    getCategories(controller.signal)
      .then(setCategories)
      .catch((error) => {
        if (error.name !== 'AbortError') setCategoryError('Não foi possível carregar as categorias. Verifique sua conexão e tente novamente.')
      })
      .finally(() => { if (!controller.signal.aborted) setCategoriesLoading(false) })
    return () => controller.abort()
  }, [categoryAttempt])

  useEffect(() => () => searchController.current?.abort(), [])

  async function search(filters) {
    searchController.current?.abort()
    const controller = new AbortController()
    searchController.current = controller
    setLoading(true)
    setSearchError('')
    setView('explore')
    try {
      const media = await getMedia(filters, controller.signal)
      if (!controller.signal.aborted) {
        setResults(media)
        setLastSearch(filters)
      }
    } catch (error) {
      if (error.name !== 'AbortError') setSearchError(error.message || 'Não foi possível buscar mídias. Tente novamente.')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  function retryCategories() {
    setCategoryError('')
    setCategoriesLoading(true)
    setCategoryAttempt((attempt) => attempt + 1)
  }

  function openAnimeGifs(anime) {
    const preset = { query: anime.title, mediaType: 'gifs', category: '', amount: 6, searchMode: 'text' }
    setGalleryPreset(preset)
    search(preset)
  }

  function toggleFavorite(item) {
    const updated = favorites.some((saved) => favoriteKey(saved) === favoriteKey(item))
      ? favorites.filter((saved) => favoriteKey(saved) !== favoriteKey(item))
      : [...favorites, item]
    setFavorites(updated)
    setStorageError(saveFavorites(updated) ? '' : 'Seu navegador não permitiu salvar os favoritos. Eles serão mantidos apenas nesta sessão.')
  }

  const displayed = view === 'favorites' ? favorites : results

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" type="button" onClick={() => setView('animes')} aria-label="Neko Gallery, descobrir animes"><span className="brand-mark"><Icon name="cat" size={26} /></span><span>neko<span className="brand-light">finder</span><span className="brand-dot">.</span></span></button>
          <nav aria-label="Navegação principal">
            <button className={`nav-button ${view === 'animes' ? 'active' : ''}`} type="button" onClick={() => setView('animes')} aria-current={view === 'animes' ? 'page' : undefined}><Icon name="search" size={17} /> Animes</button>
            <button className={`nav-button ${view === 'explore' ? 'active' : ''}`} type="button" onClick={() => setView('explore')} aria-current={view === 'explore' ? 'page' : undefined}><Icon name="grid" size={17} /> GIFs & imagens</button>
            <button className={`nav-button ${view === 'favorites' ? 'active' : ''}`} type="button" onClick={() => setView('favorites')} aria-current={view === 'favorites' ? 'page' : undefined}><Icon name="heart" size={17} /> Favoritos <span className="count-badge">{favorites.length}</span></button>
          </nav>
        </div>
      </header>

      <main className="main-container">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy"><span className="eyebrow"><Icon name="sparkles" size={15} /> PEQUENAS DESCOBERTAS, GRANDES FAVORITOS</span><h1 id="hero-title">Seu cantinho<br />de <span>anime.</span></h1><p>Histórias, imagens e um universo de possibilidades.<br className="desktop-break" /> Descubra animes pelo nome ou pelo que faz você gostar deles.</p><div className="hero-tags"><span><Icon name="search" size={14} /> Nomes & palavras-chave</span><span><Icon name="heart" size={14} /> Sua própria coleção</span></div></div>
          <div className="hero-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span><div className="art-card back-card"><Icon name="heart" size={56} /></div><div className="art-card front-card"><div className="cat-illustration"><Icon name="cat" size={94} /></div><div className="art-card-label"><span>um novo favorito</span><Icon name="heart" size={15} filled /></div></div><span className="art-sticker"><Icon name="sparkles" size={14} /> descubra algo novo</span></div>
        </section>

        <div hidden={view !== 'animes'}><AnimeExplorer active={view === 'animes'} favorites={favorites} onToggleFavorite={toggleFavorite} onOpenGifs={openAnimeGifs} /></div>
        <div hidden={view !== 'explore'}><SearchForm active={view === 'explore'} preset={galleryPreset} categories={categories} loading={loading} categoriesLoading={categoriesLoading} onSearch={search} /></div>
        {categoryError && view === 'explore' && <div className="alert" role="alert"><span>{categoryError}</span><button type="button" className="button secondary" onClick={retryCategories}>Tentar novamente</button></div>}
        {searchError && view === 'explore' && <div className="alert" role="alert">{searchError}</div>}
        {storageError && <div className="alert" role="alert">{storageError}</div>}

        {view !== 'animes' && <section className="gallery-section" aria-labelledby="gallery-title">
          <div className="gallery-heading"><div><span className="section-kicker">{view === 'favorites' ? 'FEITO POR VOCÊ' : 'UM UNIVERSO PARA EXPLORAR'}</span><h2 id="gallery-title">{view === 'favorites' ? 'Meus favoritos' : 'Suas descobertas'}<span className="results-count">{displayed.length}</span></h2></div><span className="gallery-caption">{view === 'favorites' ? 'Salvos neste navegador' : lastSearch?.query ? `Busca: “${lastSearch.query}”${lastSearch.category ? ` · ${lastSearch.category}` : ''}` : lastSearch ? `Categoria: ${lastSearch.category}` : 'Encontre seu próximo favorito'}</span></div>
          <p className="sr-only" role="status">{loading && view === 'explore' ? 'Buscando mídias...' : `${displayed.length} ${view === 'favorites' ? 'favoritos' : 'resultados'} na galeria.`}</p>
          <Gallery items={displayed} loading={loading && view === 'explore'} favorites={favorites} onToggleFavorite={toggleFavorite} onOpenGifs={openAnimeGifs} view={view} query={lastSearch?.query} onExplore={() => setView('animes')} />
        </section>}
        <div className="credit-note"><Icon name="heart" size={15} /><p>Lembre-se de apoiar os mangakas.</p></div>
      </main>

      <footer className="site-footer"><div><span className="footer-brand">nekofinder.</span><span>Projeto 1 · Programação Web Fullstack</span></div><span>Feito para ajudar os fans de anime :D <Icon name="sparkles" size={14} /></span></footer>
    </>
  )
}

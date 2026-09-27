import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { getAnimeFilters, getAnimes, normalizeTerm, resolveAnimeSearch } from '../services/animeApi.js'
import Gallery from './Gallery.jsx'
import Icon from './Icon.jsx'

export default function AnimeExplorer({ favorites, onToggleFavorite, onOpenGifs, active }) {
  const [filters, setFilters] = useState(null)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [filtersError, setFiltersError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastSearch, setLastSearch] = useState(null)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const requestRef = useRef(null)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({ defaultValues: { query: '', mode: 'auto' } })
  const query = useWatch({ control, name: 'query' })
  const queryField = register('query', { validate: (value) => !!value.trim() || 'Digite um nome ou uma palavra-chave.' })
  const suggestions = filters && query.trim() ? [...new Set([...filters.tags, ...filters.genres])].filter((name) => normalizeTerm(name).includes(normalizeTerm(query))).slice(0, 8) : []

  useEffect(() => {
    const controller = new AbortController()
    getAnimeFilters(controller.signal)
      .then(setFilters)
      .catch((err) => { if (err.name !== 'AbortError') setFiltersError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setFiltersLoading(false) })
    return () => controller.abort()
  }, [attempt])

  useEffect(() => {
    if (active && filters) inputRef.current?.focus({ preventScroll: true })
  }, [active, filters])

  useEffect(() => () => requestRef.current?.abort(), [])

  async function search(criteria, nextPage = 1, scrollToResults = false) {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError('')
    try {
      const data = await getAnimes(criteria, nextPage, controller.signal)
      if (!controller.signal.aborted) {
        setItems(data.items)
        setHasNextPage(data.hasNextPage)
        setPage(nextPage)
        setLastSearch(criteria)
        if (scrollToResults) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  function submit({ query: text, mode }) {
    try { search(resolveAnimeSearch(text, mode, filters)) } catch (err) { setError(err.message) }
  }

  function quickSearch(term) {
    setValue('query', term)
    setValue('mode', 'auto')
    handleSubmit(submit)()
  }

  function retry() {
    setFiltersError('')
    setFiltersLoading(true)
    setAttempt((value) => value + 1)
  }

  return (
    <>
      <section className="search-panel" aria-labelledby="anime-search-title">
        <div className="panel-heading"><span className="panel-icon"><Icon name="search" /></span><div><h2 id="anime-search-title">Encontre seu próximo anime</h2><p>Pesquise um título ou descubra animes por características.</p></div></div>
        <form onSubmit={(event) => handleSubmit(submit)(event)} noValidate>
          <div className="anime-search-fields">
            <div className="field"><label htmlFor="anime-query">Nome ou palavra-chave</label><div className="text-search-input"><Icon name="search" size={18} /><input id="anime-query" type="search" placeholder="Ex.: Naruto, yandere, isekai..." list="anime-keywords" disabled={loading} {...queryField} ref={(element) => { queryField.ref(element); inputRef.current = element }} aria-invalid={!!errors.query} aria-describedby={errors.query ? 'anime-query-error' : 'anime-query-hint'} /></div>{errors.query && <span className="field-error" id="anime-query-error" role="alert">{errors.query.message}</span>}<datalist id="anime-keywords">{suggestions.map((name) => <option key={name} value={name} />)}</datalist></div>
            <div className="field"><label htmlFor="anime-mode">Pesquisar por</label><select id="anime-mode" {...register('mode')} disabled={loading}><option value="auto">Detectar automaticamente</option><option value="title">Nome do anime</option><option value="keyword">Palavra-chave</option></select></div>
            <button className="button primary search-button" type="submit" disabled={loading || filtersLoading || !filters}><Icon name={loading ? 'refresh' : 'search'} className={loading ? 'spinning' : ''} />{loading ? 'Buscando...' : filtersLoading ? 'Carregando...' : 'Buscar animes'}</button>
          </div>
          <p className="field-hint anime-search-hint" id="anime-query-hint">Digite “yandere” para encontrar animes com essa tag, ou um título como “Naruto”. As palavras-chave seguem as tags e os gêneros do catálogo.</p>
          <div className="quick-searches"><span>Experimente:</span>{['Yandere', 'Isekai', 'Tsundere', 'Romance'].map((term) => <button key={term} type="button" disabled={loading || !filters} onClick={() => quickSearch(term)}>{term}</button>)}</div>
        </form>
      </section>
      {filtersError && <div className="alert" role="alert"><span>{filtersError}</span><button type="button" className="button secondary" onClick={retry}>Tentar novamente</button></div>}
      {error && <div className="alert" role="alert">{error}</div>}
      <section className="gallery-section" aria-labelledby="anime-results-title" ref={resultsRef}>
        <div className="gallery-heading"><div><span className="section-kicker">DESCUBRA NOVAS HISTÓRIAS</span><h2 id="anime-results-title">{lastSearch ? 'Animes encontrados' : 'Seu próximo anime'}<span className="results-count">{items.length}</span></h2></div><span className="gallery-caption">{lastSearch ? `${lastSearch.kind === 'title' ? 'Nome' : lastSearch.kind === 'tag' ? 'Tag' : 'Gênero'}: ${lastSearch.label}` : 'Busque pelo nome ou por uma característica'}</span></div>
        <p className="sr-only" role="status">{loading ? 'Buscando animes...' : `${items.length} animes encontrados.`}</p>
        <Gallery items={items} loading={loading} favorites={favorites} onToggleFavorite={onToggleFavorite} onOpenGifs={onOpenGifs} view="animes" query={lastSearch?.label} />
        {lastSearch && items.length > 0 && <div className="pagination"><button type="button" className="button secondary" disabled={loading || page === 1} onClick={() => search(lastSearch, page - 1, true)}>Anterior</button><span>Página {page}</span><button type="button" className="button secondary" disabled={loading || !hasNextPage} onClick={() => search(lastSearch, page + 1, true)}>Próxima</button></div>}
        <p className="catalog-credit">Dados e classificações do <a href="https://anilist.co" target="_blank" rel="noopener noreferrer">AniList</a>. As tags indicam características da obra; sinopses e termos podem estar em inglês.</p>
      </section>
    </>
  )
}

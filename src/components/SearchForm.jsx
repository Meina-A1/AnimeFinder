import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Icon from './Icon.jsx'

export default function SearchForm({ categories, loading, categoriesLoading, onSearch, preset, active }) {
  const { register, handleSubmit, control, setValue, reset, clearErrors, formState: { errors } } = useForm({
    defaultValues: { mediaType: 'gifs', category: '', amount: 6, query: '', searchMode: 'text' },
  })
  const mediaType = useWatch({ control, name: 'mediaType' })
  const searchMode = useWatch({ control, name: 'searchMode' })
  const isTextSearch = searchMode === 'text'
  const availableCategories = categories[mediaType]
  const categoryRef = useRef(null)
  const categoryField = register('category', {
    validate: (value) => isTextSearch || !!value || 'Selecione uma categoria para explorar sem texto.',
  })
  const queryField = register('query', { validate: (value) => !isTextSearch || !!value.trim() || 'Digite um nome para pesquisar.' })
  const disabled = loading || categoriesLoading

  useEffect(() => {
    const preferred = mediaType === 'images' ? 'neko' : 'hug'
    setValue('category', isTextSearch ? '' : availableCategories.includes(preferred) ? preferred : availableCategories[0] || '', { shouldValidate: false })
    clearErrors()
  }, [mediaType, availableCategories, isTextSearch, setValue, clearErrors])

  useEffect(() => {
    if (preset) reset(preset)
  }, [preset, reset])

  // Hook escolhido para a disciplina: acesso ao select sem provocar renderizações.
  useEffect(() => {
    if (active && !categoriesLoading && categories.images.length + categories.gifs.length > 0) {
      categoryRef.current?.focus({ preventScroll: true })
    }
  }, [active, categoriesLoading, categories])

  return (
    <section className="search-panel" aria-labelledby="search-title">
      <div className="panel-heading">
        <span className="panel-icon"><Icon name="sparkles" /></span>
        <div><h2 id="search-title">GIFs, imagens e reações</h2><p>Busque o anime que você gosta ou deixe o acaso escolher.</p></div>
      </div>
      <form onSubmit={handleSubmit((data) => onSearch({ ...data, query: isTextSearch ? data.query.trim() : '' }))} noValidate>
        <fieldset className="gallery-modes"><legend className="sr-only">Modo da galeria</legend><label className={isTextSearch ? 'selected' : ''}><input type="radio" value="text" {...register('searchMode')} disabled={disabled} /><Icon name="search" size={16} /> Pesquisar</label><label className={!isTextSearch ? 'selected' : ''}><input type="radio" value="random" {...register('searchMode')} disabled={disabled} /><Icon name="shuffle" size={16} /> Aleatório</label></fieldset>
        {isTextSearch && <div className="field text-search-field">
          <label htmlFor="query">{mediaType === 'images' ? 'Nome do artista' : 'Nome do anime'}</label>
          <div className="text-search-input"><Icon name="search" size={18} /><input id="query" type="search" placeholder={mediaType === 'images' ? 'Ex.: maruma' : 'Ex.: Frieren, Naruto, One Piece...'} disabled={loading} {...queryField} aria-invalid={!!errors.query} aria-describedby={errors.query ? 'query-error' : 'query-hint'} /></div>
          {errors.query && <span className="field-error" id="query-error" role="alert">{errors.query.message}</span>}
          <span id="query-hint" className="field-hint">{mediaType === 'images' ? 'As imagens da API são pesquisadas pelo artista.' : 'Busque os GIFs do anime e filtre uma reação, como hug. A disponibilidade depende da galeria.'}</span>
        </div>}
        {!isTextSearch && <p className="random-hint">Escolha o tipo e a categoria para gerar novas descobertas aleatórias.</p>}
        <div className="form-fields">
          <div className="field">
            <label htmlFor="mediaType">Tipo de mídia</label>
            <select id="mediaType" {...register('mediaType')} disabled={disabled}>
              <option value="images">Imagens</option><option value="gifs">GIFs animados</option>
            </select>
          </div>
          <div className="field category-field">
            <label htmlFor="category">Categoria</label>
            <select id="category" {...categoryField} ref={(element) => { categoryField.ref(element); categoryRef.current = element }} disabled={disabled || !availableCategories.length} aria-invalid={!!errors.category} aria-describedby={errors.category ? 'category-error' : undefined}>
              {isTextSearch ? <option value="">Todas as categorias</option> : !availableCategories.length && <option value="">{categoriesLoading ? 'Carregando...' : 'Sem categorias'}</option>}
              {availableCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {errors.category && <span id="category-error" className="field-error" role="alert">{errors.category.message}</span>}
          </div>
          <div className="field amount-field">
            <label htmlFor="amount">Quantidade</label>
            <input id="amount" type="number" min="1" max="20" step="1" disabled={disabled} {...register('amount', {
              valueAsNumber: true,
              required: 'Informe a quantidade.',
              min: { value: 1, message: 'O mínimo é 1.' },
              max: { value: 20, message: 'O máximo é 20.' },
              validate: (value) => Number.isInteger(value) || 'Use um número inteiro.',
            })} aria-invalid={!!errors.amount} aria-describedby={errors.amount ? 'amount-error' : 'amount-hint'} />
            {errors.amount && <span id="amount-error" className="field-error" role="alert">{errors.amount.message}</span>}
          </div>
          <button className="button primary search-button" type="submit" disabled={disabled || !availableCategories.length}>
            <Icon name={loading ? 'refresh' : isTextSearch ? 'search' : 'shuffle'} className={loading ? 'spinning' : ''} />
            {loading ? 'Buscando...' : isTextSearch ? 'Buscar agora' : 'Gerar aleatórios'}
          </button>
        </div>
        <div className="form-note" id="amount-hint"><span className="status-dot" /> {isTextSearch ? 'Até a quantidade escolhida, conforme disponibilidade' : 'Imagens e GIFs aleatórios'} · De 1 a 20 por busca</div>
      </form>
    </section>
  )
}

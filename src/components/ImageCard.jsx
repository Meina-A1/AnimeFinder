import { useState } from 'react'
import Icon from './Icon.jsx'

function externalUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

export default function ImageCard({ item, favorite, onToggleFavorite }) {
  const [imageFailed, setImageFailed] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const isGif = new URL(item.url).pathname.endsWith('.gif')
  const title = item.artist_name || item.anime_name || 'Criação sem identificação'
  const source = externalUrl(item.source_url || item.artist_href)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(item.url)
      setCopyStatus('Link copiado!')
    } catch {
      setCopyStatus('Não foi possível copiar. Abra o GIF para copiar o endereço.')
    }
  }

  return (
    <article className="media-card">
      <div className="card-image-wrap">
        {imageFailed ? <div className="image-fallback"><Icon name="image" size={32} /><span>Mídia indisponível</span></div> : <img src={item.url} alt={`${isGif ? 'GIF de anime' : 'Ilustração'}: ${title}`} loading="lazy" onError={() => setImageFailed(true)} />}
        <span className="media-badge">{isGif ? 'GIF' : 'Imagem'}</span>
        <button type="button" className={`favorite-button ${favorite ? 'is-favorite' : ''}`} aria-label={`${favorite ? 'Remover dos' : 'Adicionar aos'} favoritos: ${title}`} aria-pressed={favorite} onClick={() => onToggleFavorite(item)}>
          <Icon name="heart" filled={favorite} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-title-line"><h3 title={title}>{title}</h3><span className="category-tag">{item.category || 'anime'}</span></div>
        <div className="card-bottom"><span>{isGif ? 'Anime' : 'Artista'}{item.dimensions?.width && item.dimensions?.height ? ` · ${item.dimensions.width} × ${item.dimensions.height}` : ''}</span>
          {source && <a href={source} target="_blank" rel="noopener noreferrer" aria-label={`Ver fonte original de ${title}`}>Fonte <Icon name="arrow" size={14} /></a>}
        </div>
        {isGif && <div className="gif-actions"><a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir GIF de ${title}`}>Abrir GIF <Icon name="arrow" size={13} /></a><button type="button" onClick={copyLink} aria-label={`Copiar link do GIF de ${title}`}>Copiar link</button></div>}
        {copyStatus && <p className="copy-status" role="status">{copyStatus}</p>}
      </div>
    </article>
  )
}

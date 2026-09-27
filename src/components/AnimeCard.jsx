import { useState } from 'react'
import Icon from './Icon.jsx'

export default function AnimeCard({ item, favorite, onToggleFavorite, onOpenGifs }) {
  const [imageFailed, setImageFailed] = useState(false)
  const matchingTag = item.tags.find((tag) => tag.name === item.matchedKeyword)
  const tags = item.tags.filter((tag) => tag.name !== item.matchedKeyword).slice(0, 3)

  return (
    <article className="media-card anime-card">
      <div className="card-image-wrap anime-cover">
        {imageFailed || !item.url ? <div className="image-fallback"><Icon name="image" size={32} /><span>Capa indisponível</span></div> : <img src={item.url} alt={`Capa de ${item.title}`} loading="lazy" onError={() => setImageFailed(true)} />}
        <span className="media-badge">{item.format?.replaceAll('_', ' ') || 'Anime'}</span>
        <button type="button" className={`favorite-button ${favorite ? 'is-favorite' : ''}`} aria-label={`${favorite ? 'Remover dos' : 'Adicionar aos'} favoritos: ${item.title}`} aria-pressed={favorite} onClick={() => onToggleFavorite(item)}><Icon name="heart" filled={favorite} /></button>
        {item.score && <span className="anime-score">★ {(item.score / 10).toFixed(1)}</span>}
      </div>
      <div className="card-body anime-body">
        <h3>{item.title}</h3>
        {item.englishTitle && item.englishTitle !== item.title && <p className="anime-alternate-title">{item.englishTitle}</p>}
        <p className="anime-meta">{[item.year, item.episodes && `${item.episodes} episódios`].filter(Boolean).join(' · ') || 'Informações não disponíveis'}</p>
        <div className="anime-genres">{item.genres.slice(0, 3).join(' · ')}</div>
        {item.matchedKeyword && <span className="matched-tag"><Icon name="sparkles" size={12} />{item.matchedKeyword}{matchingTag ? ` · ${matchingTag.rank}%` : ''}</span>}
        <p className="anime-description">{item.description || 'Sinopse não disponível.'}</p>
        <div className="anime-tags">{tags.map((tag) => <span key={tag.name}>{tag.name}</span>)}</div>
        <div className="anime-actions"><button type="button" className="button secondary" onClick={() => onOpenGifs(item)} aria-label={`Ver GIFs de ${item.title}`}><Icon name="image" size={15} /> Ver GIFs</button><a className="anime-details" href={item.siteUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver detalhes de ${item.title} no AniList`}>Detalhes <Icon name="arrow" size={14} /></a></div>
      </div>
    </article>
  )
}

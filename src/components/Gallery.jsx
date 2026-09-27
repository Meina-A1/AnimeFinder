import Icon from './Icon.jsx'
import ImageCard from './ImageCard.jsx'
import AnimeCard from './AnimeCard.jsx'
import { favoriteKey } from '../services/favorites.js'

export default function Gallery({ items, loading, favorites, onToggleFavorite, onOpenGifs, view, query, onExplore }) {
  if (loading) {
    return <div className="gallery-grid" aria-busy="true" aria-label="Carregando galeria"><span className="sr-only" role="status">Buscando novas descobertas...</span>{Array.from({ length: 6 }, (_, index) => <div key={index} className="skeleton-card"><div /><span /><span /></div>)}</div>
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><Icon name={view === 'favorites' ? 'heart' : view === 'animes' ? 'search' : 'image'} size={32} /></span>
        <h3>{view === 'favorites' ? 'Sua coleção começa com um coração' : query ? 'Nenhum resultado encontrado' : view === 'animes' ? 'Qual história você quer descobrir?' : 'Uma nova descoberta está a um clique'}</h3>
        <p>{view === 'favorites' ? 'Favorite animes, imagens e GIFs que você gostar. Eles ficam salvos aqui para a próxima visita.' : view === 'animes' ? query ? `Não encontramos animes para “${query}”. Tente outro título ou uma palavra-chave das sugestões.` : 'Busque um título ou experimente yandere, isekai e outras características.' : query ? `Não encontramos mídias para “${query}”. Tente outro artista ou anime, ou escolha todas as categorias.` : 'Escolha uma categoria e explore imagens e GIFs da Nekos.best.'}</p>
        {view === 'favorites' && <button type="button" className="button secondary" onClick={onExplore}>Descobrir animes <Icon name="arrow" size={16} /></button>}
      </div>
    )
  }

  return <div className="gallery-grid">{items.map((item) => {
    const Card = item.kind === 'anime' ? AnimeCard : ImageCard
    return <Card key={favoriteKey(item)} item={item} favorite={favorites.some((saved) => favoriteKey(saved) === favoriteKey(item))} onToggleFavorite={onToggleFavorite} onOpenGifs={onOpenGifs} />
  })}</div>
}

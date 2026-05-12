import { useNavigate } from 'react-router-dom'
import { Item } from '../types/item'

interface Props {
  item: Item
}

export default function ItemCard({ item }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/items/${item.id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform w-full text-left"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">数量：{item.quantity}</p>
      </div>
    </button>
  )
}

import { useNavigate } from 'react-router-dom'
import { Item } from '../types/item'

interface Props {
  item: Item
}

export default function ItemCard({ item }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/items/${item.id}`)}
      className="bg-white rounded-2xl p-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer group hover:-translate-y-1 transition-all w-full text-left"
    >
      <div className="aspect-square rounded-xl overflow-hidden relative mb-3 bg-gray-50 flex justify-center items-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 7v10l8 4 8-4V7M4 7l8-4 8 4M4 7l8 4m0 10v-10m8-4l-8 4" />
          </svg>
        )}
        <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded-full">
          x{item.quantity}
        </span>
      </div>
      <div className="px-1 pb-1">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
            {item.category || '未分类'}
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            {item.price != null ? `¥${item.price}` : '未定价'}
          </span>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import AddItemModal from '../components/AddItemModal'

export default function InventoryPage() {
  const { items, loading } = useItems()
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const navigate = useNavigate()

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部搜索栏 */}
      <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-3">我的囤货</h1>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索物品..."
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 物品网格 */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p className="text-sm">{search ? '没有找到相关物品' : '还没有物品，点击 + 添加'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* 浮动 + 按钮 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed right-4 bottom-20 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform z-20"
      >
        +
      </button>

      {/* 新增入口弹窗 */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onManual={() => { setShowAddModal(false); navigate('/items/new') }}
          onScanDone={(barcode, name, category) => {
            setShowAddModal(false)
            navigate('/items/new', { state: { barcode, name, category } })
          }}
        />
      )}
    </div>
  )
}

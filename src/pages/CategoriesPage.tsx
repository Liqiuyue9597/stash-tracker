import { useState } from 'react'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'

export default function CategoriesPage() {
  const { items, loading } = useItems()
  const [expanded, setExpanded] = useState<string | null>(null)

  // 按分类分组，null/undefined 归入"未分类"
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category ?? '未分类'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === '未分类') return 1
    if (b === '未分类') return -1
    return a.localeCompare(b, 'zh')
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">分类</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400 text-sm">还没有物品</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="bg-white rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === cat ? null : cat)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{cat}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {grouped[cat].length}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === cat ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {expanded === cat && (
                <div className="grid grid-cols-2 gap-3 p-3 pt-0">
                  {grouped[cat].map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

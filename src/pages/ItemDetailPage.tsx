import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useImageUpload } from '../hooks/useImageUpload'

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getItem, deleteItem } = useItems()
  const { deleteImage } = useImageUpload()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const item = id ? getItem(id) : undefined

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">物品不存在</p>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    if (item.image_url) await deleteImage(id)
    const success = await deleteItem(id)
    if (success) navigate('/inventory')
    else setDeleting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶栏 */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">{item.name}</h1>
        <button
          onClick={() => navigate(`/items/${id}/edit`)}
          className="text-blue-500 text-sm font-medium"
        >
          编辑
        </button>
      </div>

      {/* 图片 */}
      <div className="bg-white">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>

      {/* 详情 */}
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl p-4 space-y-3">
          {[
            { label: '名称', value: item.name },
            { label: '分类', value: item.category },
            { label: '数量', value: String(item.quantity) },
            { label: '价格', value: item.price != null ? `¥${item.price}` : null },
            { label: '购买日期', value: item.purchased_at },
            { label: '备注', value: item.notes },
          ].map(({ label, value }) =>
            value ? (
              <div key={label} className="flex justify-between items-start">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm text-gray-900 text-right max-w-[60%]">{value}</span>
              </div>
            ) : null
          )}
        </div>

        {/* 删除按钮 */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3 text-red-500 text-sm font-medium bg-white rounded-xl"
        >
          删除物品
        </button>
      </div>

      {/* 删除确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white w-full rounded-t-2xl p-6 space-y-4">
            <p className="text-center text-base font-medium text-gray-900">确认删除「{item.name}」？</p>
            <p className="text-center text-sm text-gray-400">删除后无法恢复</p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3 bg-red-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {deleting ? '删除中...' : '确认删除'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full py-3 text-gray-500 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

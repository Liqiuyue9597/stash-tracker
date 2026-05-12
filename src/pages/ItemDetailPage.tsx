import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useImageUpload } from '../hooks/useImageUpload'

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getItem, deleteItem, loading } = useItems()
  const { deleteImage } = useImageUpload()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const item = id ? getItem(id) : undefined

  if (loading && !item) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative">
      {/* 顶部图片区域 - 画框模式 (适合随手拍的普通照片) */}
      <div className="relative h-[320px] w-full shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <>
            {/* 毛玻璃模糊背景层，提取图片色彩氛围 */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125"
              style={{ backgroundImage: `url(${item.image_url})` }}
            />
            {/* 画框式居中主图 */}
            <div className="relative z-10 w-44 h-44 mt-4 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border-[3px] border-white/80 overflow-hidden bg-white">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            </div>
          </>
        ) : (
           <svg className="w-16 h-16 text-gray-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
               d="M4 7v10l8 4 8-4V7M4 7l8-4 8 4M4 7l8 4m0 10v-10m8-4l-8 4" />
           </svg>
        )}
        
        {/* 导航栏 (悬浮) */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-10 flex justify-between items-center bg-gradient-to-b from-black/30 to-transparent z-20">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => navigate(`/items/${id}/edit`)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 详情内容区 */}
      <div className="flex-1 bg-[#f8fafc] -mt-6 rounded-t-3xl relative z-10 p-5 overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{item.name}</h1>
            {item.category && (
              <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                {item.category}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">{item.price != null ? `¥${item.price}` : '未定价'}</div>
            <div className="text-xs text-gray-400 mt-1">剩余 {item.quantity} 件</div>
          </div>
        </div>

        {/* 卡片化信息 */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-4 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">购买日期</span>
            </div>
            <span className="text-sm font-medium text-gray-800">{item.purchased_at || '--'}</span>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-gray-400 shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="text-sm">备注信息</span>
            </div>
            <span className="text-sm font-medium text-gray-800 text-right leading-relaxed pl-4">
              {item.notes || '无'}
            </span>
          </div>
        </div>

        {/* 删除按钮 */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full mt-4 bg-red-50 text-red-500 font-medium py-3.5 rounded-2xl text-sm hover:bg-red-100 transition-colors active:scale-95"
        >
          删除物品
        </button>
      </div>

      {/* 删除确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white w-full rounded-t-3xl p-6 space-y-4 shadow-xl">
            <p className="text-center text-lg font-bold text-gray-900 mt-2">确认删除「{item.name}」？</p>
            <p className="text-center text-sm text-gray-500 mb-6">删除后该物品的信息将无法恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-medium rounded-2xl text-sm active:scale-95 transition-transform"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3.5 bg-red-500 text-white font-medium rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

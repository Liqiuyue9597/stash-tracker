import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useImageUpload } from '../hooks/useImageUpload'
import { PRESET_CATEGORIES } from '../lib/categories'
import ImagePicker from '../components/ImagePicker'
import { NewItem } from '../types/item'

export default function ItemFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = !!id

  const { getItem, addItem, updateItem } = useItems()
  const { uploadImage } = useImageUpload()

  const existing = id ? getItem(id) : undefined
  const prefill = location.state as { barcode?: string; name?: string; category?: string } | null

  const [name, setName] = useState(existing?.name ?? prefill?.name ?? '')
  const [category, setCategory] = useState(existing?.category ?? prefill?.category ?? '')
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? 1))
  const [price, setPrice] = useState(existing?.price != null ? String(existing.price) : '')
  const [purchasedAt, setPurchasedAt] = useState(
    existing?.purchased_at ?? new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [barcode] = useState(existing?.barcode ?? prefill?.barcode ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existing?.image_url ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (file: File) => {
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('请输入物品名称'); return }
    if (!quantity || Number(quantity) <= 0) { setError('数量必须大于 0'); return }

    setSubmitting(true)
    setError(null)

    const itemData: NewItem = {
      name: name.trim(),
      category: category || null,
      quantity: Number(quantity),
      price: price ? Number(price) : null,
      purchased_at: purchasedAt || null,
      notes: notes.trim() || null,
      barcode: barcode || null,
      image_url: existing?.image_url ?? null,
    }

    if (isEdit && id) {
      const success = await updateItem(id, itemData)
      if (!success) { setError('保存失败，请重试'); setSubmitting(false); return }
      if (imageFile) {
        const url = await uploadImage(imageFile, id)
        if (url) await updateItem(id, { image_url: url })
      }
      navigate(`/items/${id}`)
    } else {
      const item = await addItem(itemData)
      if (!item) { setError('添加失败，请重试'); setSubmitting(false); return }
      if (imageFile) {
        const url = await uploadImage(imageFile, item.id)
        if (url) await updateItem(item.id, { image_url: url })
      }
      navigate('/inventory')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{isEdit ? '编辑物品' : '添加物品'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <ImagePicker value={imageFile} previewUrl={previewUrl} onChange={handleImageChange} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="物品名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">请选择分类</option>
            {PRESET_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">数量 *</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            min="0.1"
            step="any"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">价格（元）</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="可选"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">购买日期</label>
          <input
            type="date"
            value={purchasedAt}
            onChange={e => setPurchasedAt(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="可选"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? '保存中...' : isEdit ? '保存修改' : '添加物品'}
        </button>
      </form>
    </div>
  )
}

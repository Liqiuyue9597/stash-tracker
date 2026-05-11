import { useState } from 'react'
import BarcodeScanner from './BarcodeScanner'

interface Props {
  onClose: () => void
  onManual: () => void
  onScanDone: (barcode: string, name: string | null, category: string | null) => void
}

export default function AddItemModal({ onClose, onManual, onScanDone }: Props) {
  const [showScanner, setShowScanner] = useState(false)

  if (showScanner) {
    return (
      <BarcodeScanner
        onCancel={() => setShowScanner(false)}
        onResult={(barcode, result) => {
          onScanDone(barcode, result?.name ?? null, result?.category ?? null)
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute bottom-16 left-4 right-4 bg-white rounded-2xl p-4 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 text-center">添加物品</h3>

        <button
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center gap-3 p-4 bg-blue-50 rounded-xl"
        >
          <span className="text-2xl">📷</span>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">扫条形码</p>
            <p className="text-xs text-gray-400">自动识别商品信息</p>
          </div>
        </button>

        <button
          onClick={onManual}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
        >
          <span className="text-2xl">✏️</span>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">手动填写</p>
            <p className="text-xs text-gray-400">自己输入物品信息</p>
          </div>
        </button>

        <button onClick={onClose} className="w-full py-2 text-sm text-gray-400">取消</button>
      </div>
    </div>
  )
}

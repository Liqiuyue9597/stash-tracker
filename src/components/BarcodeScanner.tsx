import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { lookupBarcode, BarcodeResult } from '../lib/barcode'

interface Props {
  onResult: (barcode: string, result: BarcodeResult | null) => void
  onCancel: () => void
}

export default function BarcodeScanner({ onResult, onCancel }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  // 用 ref 做守卫，避免闭包捕获 stale state 导致多次触发
  const didScanRef = useRef(false)
  const [looking, setLooking] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      async (decodedText) => {
        if (didScanRef.current) return
        didScanRef.current = true

        // 先 stop，再改 state——确保 Html5Qrcode 在 #qr-reader 节点存在时完成清理
        await scanner.stop()
        setLooking(true)

        const result = await lookupBarcode(decodedText)
        onResult(decodedText, result)
      },
      () => {}
    ).catch(console.error)

    return () => {
      // 只在还没主动 stop 的情况下才调用（如用户点取消）
      if (!didScanRef.current) {
        scanner.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white text-lg font-medium">扫描条形码</h2>
        <button onClick={onCancel} className="text-white text-sm">取消</button>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {/* #qr-reader 始终保留在 DOM，Html5Qrcode 的 stop 需要它存在；用 CSS 隐藏而非条件渲染 */}
        <div id="qr-reader" className={`w-full max-w-sm ${looking ? 'invisible' : ''}`} />
        {looking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-sm">正在查询商品信息...</p>
          </div>
        )}
      </div>

      <p className="text-gray-400 text-xs text-center pb-8">将条形码对准框内</p>
    </div>
  )
}

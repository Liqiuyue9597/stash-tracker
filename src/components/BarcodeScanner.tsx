import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { lookupBarcode, BarcodeResult } from '../lib/barcode'

interface Props {
  onResult: (barcode: string, result: BarcodeResult | null) => void
  onCancel: () => void
}

export default function BarcodeScanner({ onResult, onCancel }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(true)
  const [looking, setLooking] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      async (decodedText) => {
        if (!scanning) return
        setScanning(false)
        setLooking(true)
        await scanner.stop()
        const result = await lookupBarcode(decodedText)
        onResult(decodedText, result)
      },
      () => {} // ignore errors during scanning
    ).catch(console.error)

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white text-lg font-medium">扫描条形码</h2>
        <button onClick={onCancel} className="text-white text-sm">取消</button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {looking ? (
          <p className="text-white text-sm">正在查询商品信息...</p>
        ) : (
          <div id="qr-reader" className="w-full max-w-sm" />
        )}
      </div>

      <p className="text-gray-400 text-xs text-center pb-8">将条形码对准框内</p>
    </div>
  )
}

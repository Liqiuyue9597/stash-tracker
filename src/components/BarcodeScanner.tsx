import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { lookupBarcode, BarcodeResult } from '../lib/barcode'

interface Props {
  onResult: (barcode: string, result: BarcodeResult | null) => void
  onCancel: () => void
}

// 明确列出商品条形码常用格式；不指定时 v2.3.x 对 1D 码识别不稳定
const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,   // 国内商品主流格式（690-699）
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.QR_CODE,
]

export default function BarcodeScanner({ onResult, onCancel }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const didScanRef = useRef(false)
  const [looking, setLooking] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader', {
      formatsToSupport: BARCODE_FORMATS,
      // 优先使用浏览器原生 BarcodeDetector（Android Chrome 支持，识别率更高）
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      verbose: false,
    })
    scannerRef.current = scanner

    scanner.start(
      {
        facingMode: 'environment',
        // iOS 需要持续对焦才能稳定识别条形码
        advanced: [{ focusMode: 'continuous' }] as unknown as MediaTrackConstraintSet[],
      },
      { fps: 10, qrbox: { width: 280, height: 120 } },
      async (decodedText) => {
        if (didScanRef.current) return
        didScanRef.current = true

        await scanner.stop()
        setLooking(true)

        const result = await lookupBarcode(decodedText)
        onResult(decodedText, result)
      },
      () => {}
    ).catch(console.error)

    return () => {
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
        <div id="qr-reader" className={`w-full max-w-sm ${looking ? 'invisible' : ''}`} />
        {looking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-sm">正在查询商品信息...</p>
          </div>
        )}
      </div>

      <p className="text-gray-400 text-xs text-center pb-8">将条形码横向对准框内</p>
    </div>
  )
}

import { useRef } from 'react'

interface Props {
  value: File | null
  previewUrl: string | null
  onChange: (file: File) => void
}

export default function ImagePicker({ value: _value, previewUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center overflow-hidden"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="预览" className="w-full h-full object-cover" />
        ) : (
          <>
            <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-400">拍照 / 从相册选择</p>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
        }}
      />
    </div>
  )
}

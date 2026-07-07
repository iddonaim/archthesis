import { useRef, useState } from 'react'
import { Sticker as StickerIcon, ImagePlus, Loader2 } from 'lucide-react'
import { useSceneStore } from '@/stores/useSceneStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { CURATED_STICKERS } from '@/data/stickers'

// Uploaded pictures are downscaled before entering the scene so the editor
// stays fast and the scene survives sessionStorage round-trips (template switch).
const MAX_UPLOAD_DIMENSION = 800
const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/** Formats that may carry transparency keep it; photos become JPEG. */
const outputFormat = (fileType: string): { mime: string; quality?: number } =>
  ['image/png', 'image/webp', 'image/gif', 'image/svg+xml'].includes(fileType)
    ? { mime: 'image/png' }
    : { mime: 'image/jpeg', quality: 0.85 }

const downscaleImage = (file: File): Promise<{ src: string; aspect: number }> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(img.width, img.height))
      const width = Math.max(1, Math.round(img.width * scale))
      const height = Math.max(1, Math.round(img.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas context unavailable'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      const { mime, quality } = outputFormat(file.type)
      resolve({ src: canvas.toDataURL(mime, quality), aspect: width / height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('image load failed'))
    }
    img.src = objectUrl
  })

export default function StickerPanel() {
  const { addElement, selectOne } = useSceneStore()
  const { canvasDimensions } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const addImageSticker = (src: string, aspect: number, source: 'upload' | 'curated') => {
    const canvasWidth = canvasDimensions?.width ?? 900
    const canvasHeight = canvasDimensions?.height ?? 650

    // Land at ~40% of the canvas's short side, centered. Scaling by √aspect
    // keeps the visual area similar for wide/tall artwork instead of letting
    // a 2.5:1 sticker span most of the canvas; the fit clamp guards extreme
    // panoramas and tall uploads.
    const base = Math.min(canvasWidth, canvasHeight) * 0.4
    let width = base * Math.sqrt(aspect)
    let height = width / aspect
    const fit = Math.min(1, (canvasWidth * 0.7) / width, (canvasHeight * 0.7) / height)
    width *= fit
    height *= fit

    const id = addElement({
      type: 'image',
      src,
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      width,
      height,
      rotation: 0,
      source
    })
    selectOne(id)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('נא לבחור קובץ תמונה')
      return
    }
    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      alert('התמונה גדולה מדי (מקסימום 10MB)')
      return
    }

    setIsProcessing(true)
    try {
      const { src, aspect } = await downscaleImage(file)
      addImageSticker(src, aspect, 'upload')
    } catch {
      alert('לא הצלחנו לטעון את התמונה, נסו קובץ אחר')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <StickerIcon size={20} className="text-primary" />
        <h3 className="font-bold text-lg">סטיקרים</h3>
      </div>

      {/* Upload your own picture as a sticker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/60 px-3 py-4 text-primary-700 hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-60"
      >
        {isProcessing ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <ImagePlus size={22} />
        )}
        <span className="text-sm font-semibold">
          {isProcessing ? 'מעבד תמונה...' : 'העלו תמונה כסטיקר'}
        </span>
        <span className="text-xs text-ink-light/70">PNG עם רקע שקוף עובד הכי טוב</span>
      </button>

      {/* Curated pack */}
      <div>
        <h4 className="text-sm font-semibold text-ink-light mb-2">חבילת הבית</h4>
        <div className="grid grid-cols-3 gap-2">
          {CURATED_STICKERS.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => addImageSticker(sticker.src, sticker.aspect, 'curated')}
              title={sticker.label}
              className="aspect-square rounded-xl border border-ink/5 bg-paper p-2 hover:border-primary-200 hover:bg-primary-50/60 hover:scale-105 transition-all flex items-center justify-center"
            >
              <img
                src={sticker.src}
                alt={sticker.label}
                className="max-w-full max-h-full object-contain pointer-events-none"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-light/70 text-center border-t border-ink/5 pt-3">
        לחצו על סטיקר כדי להוסיף אותו לתמונה — אפשר להזיז, לסובב ולשנות גודל
      </p>
    </div>
  )
}

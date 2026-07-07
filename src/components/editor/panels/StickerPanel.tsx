import { useRef, useState } from 'react'
import { Sticker as StickerIcon, ImagePlus, Loader2, X, User } from 'lucide-react'
import { useSceneStore } from '@/stores/useSceneStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { STICKER_PACKS } from '@/data/stickerPacks'
import {
  loadUserStickers,
  saveUserSticker,
  removeUserSticker,
  USER_STICKER_LIMIT,
  type UserSticker,
} from '@/lib/userStickers'
import { cn } from '@/lib/utils'

// Uploaded pictures are downscaled before entering the scene so the editor
// stays fast and the sticker fits in the localStorage sticker library.
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

type PackId = 'mine' | (typeof STICKER_PACKS)[number]['id']

export default function StickerPanel() {
  const { addElement, selectOne } = useSceneStore()
  const { canvasDimensions } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activePack, setActivePack] = useState<PackId>(STICKER_PACKS[0].id)
  const [userStickers, setUserStickers] = useState<UserSticker[]>(() => loadUserStickers())

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
      // Remember it in the personal library (best effort — quota may be full)
      const { stickers } = saveUserSticker(src, aspect)
      setUserStickers(stickers)
    } catch {
      alert('לא הצלחנו לטעון את התמונה, נסו קובץ אחר')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveUserSticker = (id: string) => {
    setUserStickers(removeUserSticker(id))
  }

  const activePackDef = STICKER_PACKS.find((p) => p.id === activePack)

  const packButtonClass = (isActive: boolean) =>
    cn(
      'flex flex-col items-center gap-0.5 min-w-[52px] px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-colors',
      isActive ? 'bg-primary text-white' : 'bg-paper text-ink-light hover:bg-primary-50'
    )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <StickerIcon size={20} className="text-primary" />
        <h3 className="font-bold text-lg">סטיקרים</h3>
      </div>

      {/* Pack switcher — like a keyboard's sticker-pack row */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
        <button onClick={() => setActivePack('mine')} className={packButtonClass(activePack === 'mine')} title="הסטיקרים שלי">
          <User size={16} />
          <span>שלי</span>
        </button>
        {STICKER_PACKS.map((pack) => (
          <button
            key={pack.id}
            onClick={() => setActivePack(pack.id)}
            className={packButtonClass(activePack === pack.id)}
            title={pack.label}
          >
            <span className="text-base leading-none">{pack.icon}</span>
            <span>{pack.label}</span>
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {activePack === 'mine' ? (
        <div className="space-y-3">
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

          {userStickers.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {userStickers.map((sticker) => (
                <div key={sticker.id} className="relative group">
                  <button
                    onClick={() => addImageSticker(sticker.src, sticker.aspect, 'upload')}
                    title="הוסיפו לקנבס"
                    className="w-full aspect-square rounded-xl border border-ink/5 bg-paper p-2 hover:border-primary-200 hover:bg-primary-50/60 transition-all flex items-center justify-center"
                  >
                    <img
                      src={sticker.src}
                      alt="סטיקר אישי"
                      className="max-w-full max-h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  </button>
                  <button
                    onClick={() => handleRemoveUserSticker(sticker.id)}
                    title="הסירו מהספרייה"
                    className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-ink text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-light/70 text-center">
              סטיקרים שתעלו יישמרו כאן לפעם הבאה (עד {USER_STICKER_LIMIT})
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto scrollbar-thin">
          {activePackDef?.stickers.map((sticker) => (
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
      )}

      <p className="text-xs text-ink-light/70 text-center border-t border-ink/5 pt-3">
        לחצו על סטיקר כדי להוסיף אותו לתמונה — אפשר להזיז, לסובב ולשנות גודל
      </p>
    </div>
  )
}

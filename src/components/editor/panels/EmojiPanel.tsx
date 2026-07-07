import { lazy, Suspense } from 'react'
import { Smile } from 'lucide-react'
// Type-only import — a runtime import here would pull the whole picker
// (and its emoji data) into the page chunk and defeat the lazy() split.
import type { EmojiStyle, EmojiClickData } from 'emoji-picker-react'
import { useSceneStore } from '@/stores/useSceneStore'
import { useEditorStore } from '@/stores/useEditorStore'
import Spinner from '@/components/common/Spinner'

// The picker ships its own emoji data (~heavy), so it only loads when the
// emoji tab is actually opened.
const EmojiPicker = lazy(() => import('emoji-picker-react'))

export default function EmojiPanel() {
  const { addElement, selectOne } = useSceneStore()
  const { canvasDimensions } = useEditorStore()

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    // Drop the emoji at the canvas center (its anchor is the top-left corner)
    const size = 64
    const centerX = (canvasDimensions?.width ?? 900) / 2 - size / 2
    const centerY = (canvasDimensions?.height ?? 650) / 2 - size / 2
    const id = addElement({
      type: 'emoji',
      glyph: emojiData.emoji,
      x: centerX,
      y: centerY,
      size,
      rotation: 0
    })
    selectOne(id)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Smile size={20} className="text-primary" />
        <h3 className="font-bold text-lg">אמוג'י</h3>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner size="md" />
          </div>
        }
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          // Native glyphs — matches exactly how the emoji renders on the
          // canvas (a Konva Text node) and avoids any CDN image fetches.
          emojiStyle={'native' as EmojiStyle}
          searchPlaceholder="חיפוש אמוג'י..."
          width="100%"
          height={380}
          previewConfig={{ showPreview: false }}
          skinTonesDisabled
          lazyLoadEmojis
        />
      </Suspense>

      <p className="text-xs text-ink-light/70 text-center border-t border-ink/5 pt-3">
        לחצו על אמוג'י כדי להוסיף אותו לתמונה
      </p>
    </div>
  )
}

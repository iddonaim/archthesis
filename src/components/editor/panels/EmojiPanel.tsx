import { Smile } from 'lucide-react'
import { useSceneStore } from '@/stores/useSceneStore'
import { useEditorStore } from '@/stores/useEditorStore'

const EMOJI_CATEGORIES = {
  'פרצופים': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😚', '😋', '😛', '😝', '😜'],
  'מחוות': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚'],
  'חיות': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'],
  'אוכל': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🥓', '🥚', '🍳', '🥞', '🧇', '🥐', '🍞', '🥖', '🥨', '🥗', '🍝', '🍜', '🍲'],
  'אובייקטים': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳'],
  'סמלים': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐']
}

export default function EmojiPanel() {
  const { addElement, selectOne } = useSceneStore()
  const { canvasDimensions } = useEditorStore()

  const handleEmojiClick = (emoji: string) => {
    // Drop the emoji at the canvas center (its anchor is the top-left corner)
    const size = 64
    const centerX = (canvasDimensions?.width ?? 900) / 2 - size / 2
    const centerY = (canvasDimensions?.height ?? 650) / 2 - size / 2
    const id = addElement({
      type: 'emoji',
      glyph: emoji,
      x: centerX,
      y: centerY,
      size,
      rotation: 0
    })
    selectOne(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Smile size={20} className="text-primary" />
        <h3 className="font-bold text-lg">אמוג'י</h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-ink-light mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="aspect-square text-2xl hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center hover:scale-110"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-light/70 text-center border-t border-ink/5 pt-3">
        לחצו על אמוג'י כדי להוסיף אותו לתמונה
      </p>
    </div>
  )
}

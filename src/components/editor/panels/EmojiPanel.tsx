import { Smile } from 'lucide-react'
import { useSceneStore } from '@/stores/useSceneStore'

const EMOJI_CATEGORIES = {
  'פרצופים': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😚', '😋', '😛', '😝', '😜'],
  'מחוות': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚'],
  'חיות': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'],
  'אוכל': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🥓', '🥚', '🍳', '🥞', '🧇', '🥐', '🍞', '🥖', '🥨', '🥗', '🍝', '🍜', '🍲'],
  'אובייקטים': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳'],
  'סמלים': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐']
}

export default function EmojiPanel() {
  const { addElement } = useSceneStore()

  const handleEmojiClick = (emoji: string) => {
    addElement({
      type: 'emoji',
      glyph: emoji,
      x: 200,
      y: 200,
      size: 64,
      rotation: 0
    })
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
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="aspect-square text-2xl hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center hover:scale-110"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center border-t pt-3">
        לחצו על אמוג'י כדי להוסיף אותו לתמונה
      </p>
    </div>
  )
}

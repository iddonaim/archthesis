import { Plus } from 'lucide-react'
import { useEditorStore } from '@/stores/useEditorStore'
import { useSceneStore } from '@/stores/useSceneStore'
import Button from '@/components/common/Button'
import ColorPanel from './ColorPanel'

export default function TextPanel() {
  const {
    canvasDimensions,
    description,
    setDescription
  } = useEditorStore()
  const { scene, addElement } = useSceneStore()

  const selectedElement = scene.elements.find(el => scene.selection.includes(el.id))
  const isTextSelected = selectedElement?.type === 'text'

  const handleQuickAddText = () => {
    // Use actual canvas dimensions to center text box, fallback to defaults
    const centerX = canvasDimensions ? canvasDimensions.width / 2 : 450
    const centerY = canvasDimensions ? canvasDimensions.height / 2 : 325

    // Calculate text box width based on canvas size (45% of width, min 200, max 400)
    const textBoxWidth = canvasDimensions
      ? Math.max(200, Math.min(400, canvasDimensions.width * 0.45))
      : 300

    addElement({
      type: 'text',
      text: 'כתוב כאן...',
      x: centerX,
      y: centerY,
      width: textBoxWidth,
      fontSize: 36,
      color: '#FFFFFF',
      fontFamily: 'IBM Plex Sans Hebrew',
      stroke: '#000000',
      strokeWidth: 1,
      fontStyle: 'bold',
      rotation: 0,
      isPlaceholder: true,
      isEditing: true
    })
  }

  return (
    <div className="space-y-4">
      {/* Meme Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink-light">
          תיאור הגיחוך (אופציונלי)
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= 200) {
              setDescription(e.target.value)
            }
          }}
          placeholder="הוסף תיאור לגיחוך שלך..."
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
        />
        <p className="text-xs text-ink-light/70 text-left">
          {description.length}/200
        </p>
      </div>

      {/* Add Text to Canvas */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleQuickAddText}
        className="w-full flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        <span>הוסף טקסט לקנבס</span>
      </Button>

      {/* Help text */}
      <p className="text-xs text-ink-light/70 text-center">
        לחצו פעמיים על טקסט בקנבס כדי לערוך אותו
      </p>

      {/* Color Controls - only show when text is selected */}
      {isTextSelected && (
        <>
          <div className="border-t border-gray-200 pt-4 mt-4">
            <ColorPanel />
          </div>
        </>
      )}
    </div>
  )
}

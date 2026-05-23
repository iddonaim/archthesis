import { Palette, X } from 'lucide-react'
import { useSceneStore } from '@/stores/useSceneStore'
import type { TextElement } from '@/types/scene'

const PRESET_COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
]

export default function ColorPanel() {
  const { scene, updateElement } = useSceneStore()

  const selectedId = scene.selection[0]
  const selectedTextBox = scene.elements.find(
    (el): el is TextElement => el.id === selectedId && el.type === 'text'
  )

  if (!selectedTextBox || !selectedId) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        בחרו טקסט כדי לשנות צבעים
      </div>
    )
  }

  const handleColorChange = (color: string) => {
    updateElement(selectedId, { color })
  }

  const handleStrokeChange = (stroke: string) => {
    updateElement(selectedId, { stroke })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette size={20} className="text-primary" />
        <h3 className="font-bold text-lg">צבעים</h3>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          צבע טקסט:
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={`text-${color}`}
              onClick={() => handleColorChange(color)}
              className={`w-full aspect-square rounded-lg border-2 transition-all ${
                selectedTextBox.color === color
                  ? 'border-primary scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <input
          type="color"
          value={selectedTextBox.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      {/* Stroke Color */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          צבע מתאר:
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={`stroke-${color}`}
              onClick={() => handleStrokeChange(color)}
              className={`w-full aspect-square rounded-lg border-2 transition-all ${
                selectedTextBox.stroke === color
                  ? 'border-primary scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <input
          type="color"
          value={selectedTextBox.stroke || '#000000'}
          onChange={(e) => handleStrokeChange(e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          עובי מתאר: {selectedTextBox.strokeWidth || 0}px
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={selectedTextBox.strokeWidth || 0}
          onChange={(e) => updateElement(selectedId, {
            strokeWidth: Number(e.target.value)
          })}
          className="w-full"
        />
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          צבע רקע:
        </label>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {/* Transparent option */}
          <button
            onClick={() => updateElement(selectedId, { backgroundColor: undefined })}
            className={`w-full aspect-square rounded-lg border-2 transition-all flex items-center justify-center ${
              !selectedTextBox.backgroundColor
                ? 'border-primary bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
            title="שקוף"
          >
            <X size={16} className="text-gray-500" />
          </button>

          {/* Background color presets */}
          {['#FFFFFF', '#000000', '#FFFF00', '#FF6B6B', '#4ECDC4'].map((color) => (
            <button
              key={`bg-${color}`}
              onClick={() => updateElement(selectedId, { backgroundColor: color })}
              className={`w-full aspect-square rounded-lg border-2 transition-all ${
                selectedTextBox.backgroundColor === color
                  ? 'border-primary scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        {selectedTextBox.backgroundColor && (
          <input
            type="color"
            value={selectedTextBox.backgroundColor}
            onChange={(e) => updateElement(selectedId, { backgroundColor: e.target.value })}
            className="w-full h-10 rounded cursor-pointer"
          />
        )}
      </div>
    </div>
  )
}

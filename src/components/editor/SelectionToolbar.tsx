import { Trash2, Copy, ChevronsUp, ChevronsDown, Type, Smile, MapPin } from 'lucide-react'
import { useSceneStore } from '@/stores/useSceneStore'
import { useEditorStore } from '@/stores/useEditorStore'

/**
 * Floating action bar shown above the canvas while an element is selected.
 * Gives mouse/touch access to delete, duplicate and z-order — actions that
 * previously existed in the store but had no UI at all.
 */
export default function SelectionToolbar() {
  const { scene, deleteElement, addElement, reorderElement, selectOne } = useSceneStore()
  const { canvasDimensions } = useEditorStore()

  const selected = scene.elements.find((el) => scene.selection.includes(el.id))
  if (!selected) return null

  const index = scene.elements.findIndex((el) => el.id === selected.id)
  const isTop = index === scene.elements.length - 1
  const isBottom = index === 0

  const typeInfo =
    selected.type === 'text'
      ? { icon: Type, label: 'טקסט' }
      : selected.type === 'emoji'
      ? { icon: Smile, label: 'אימוג׳י' }
      : { icon: MapPin, label: 'מיקום' }
  const TypeIcon = typeInfo.icon

  const handleDuplicate = () => {
    // Offset the copy slightly so it's visibly a new element, but keep it on canvas
    const maxX = canvasDimensions?.width ?? 900
    const maxY = canvasDimensions?.height ?? 650
    // addElement always assigns a fresh id, so the copied id is ignored
    const newId = addElement({
      ...selected,
      x: Math.min((selected.x ?? 0) + 16, maxX - 20),
      y: Math.min((selected.y ?? 0) + 16, maxY - 20),
    })
    selectOne(newId)
  }

  const buttonClass =
    'p-2 rounded-lg text-ink-light hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors'

  return (
    <div className="flex items-center gap-0.5 mb-3 rounded-xl border border-ink/5 bg-paper px-2 py-1">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-light px-2 border-e border-ink/10 me-1">
        <TypeIcon size={14} />
        {typeInfo.label}
      </span>

      {selected.type !== 'location' && (
        <button onClick={handleDuplicate} title="שכפל" className={buttonClass}>
          <Copy size={16} />
        </button>
      )}
      <button
        onClick={() => reorderElement(selected.id, scene.elements.length - 1)}
        disabled={isTop}
        title="הבא לחזית"
        className={buttonClass}
      >
        <ChevronsUp size={16} />
      </button>
      <button
        onClick={() => reorderElement(selected.id, 0)}
        disabled={isBottom}
        title="שלח לרקע"
        className={buttonClass}
      >
        <ChevronsDown size={16} />
      </button>
      <button
        onClick={() => deleteElement(selected.id)}
        title="מחק (Delete)"
        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

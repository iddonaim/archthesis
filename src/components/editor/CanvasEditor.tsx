import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Line, Rect, Group } from 'react-konva'
import { useEditorStore } from '@/stores/useEditorStore'
import { useSceneStore } from '@/stores/useSceneStore'
import { useEditorKeyboard } from '@/hooks/useEditorKeyboard'
import type { TextElement, EmojiElement, LocationElement, ImageElement } from '@/types/scene'
import { getContrastColor } from '@/lib/utils'
import useImage from 'use-image'
import Konva from 'konva'
import type { Sticker, Location } from '@/types/editor'

interface CanvasEditorProps {
  width?: number
  height?: number
}

/** Cursor feedback + a shared drag clamp so elements can't be lost off-canvas. */
interface EditableCommonProps {
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number }
  onHoverCursor?: (cursor: string) => void
}

export interface CanvasEditorHandle {
  getStage: () => Konva.Stage | null
}

// Text component with transformer
function EditableText({
  textBox,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onSnapDragEnd,
  onTransformEnd,
  dragBoundFunc,
  onHoverCursor
}: {
  textBox: any
  isSelected: boolean
  onSelect: () => void
  onChange: (attrs: any) => void
  onDragStart?: () => void
  onDragMove?: (e: any) => void
  onSnapDragEnd?: (e: any, onChange: (attrs: any) => void) => void
  onTransformEnd?: () => void
} & EditableCommonProps) {
  const textRef = useRef<Konva.Text>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [isEditing, setIsEditing] = useState(false)
  const hasTriggeredEdit = useRef(false)

  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  // Auto-trigger edit mode for new text boxes
  useEffect(() => {
    if (textBox.isEditing && !hasTriggeredEdit.current && textRef.current) {
      hasTriggeredEdit.current = true
      onChange({ isEditing: false }) // Clear the flag
      setTimeout(() => {
        handleDoubleClick()
      }, 100)
    }
  }, [textBox.isEditing])

  const handleDoubleClick = () => {
    const textNode = textRef.current
    if (!textNode) return

    const stage = textNode.getStage()
    if (!stage) return

    // Store original text for potential revert
    const originalText = textBox.text

    // Get text position and stage bounds
    const textPosition = textNode.absolutePosition()
    const stageBox = stage.container().getBoundingClientRect()

    // Set editing state
    setIsEditing(true)
    onSelect()
    onChange({ isPlaceholder: false })

    // Directly clear the Konva text node (bypasses React)
    textNode.text('')
    textNode.getLayer()?.batchDraw()

    // Create textarea

    // Use actual text width (for wrapping around content) or max width
    const maxWidth = textBox.width || 300
    const actualTextWidth = textNode.width()
    const textWidth = Math.min(actualTextWidth + 20, maxWidth) // Add padding, but don't exceed max
    const textHeight = textNode.height()

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    textarea.value = textBox.text
    textarea.dir = 'auto' // Hebrew and English both align correctly while typing
    textarea.style.position = 'absolute'
    textarea.style.top = stageBox.top + textPosition.y + 'px'
    textarea.style.left = stageBox.left + textPosition.x - textWidth / 2 + 'px'
    textarea.style.width = textWidth + 'px'
    textarea.style.fontSize = textBox.fontSize + 'px'
    textarea.style.fontFamily = textBox.fontFamily
    textarea.style.fontStyle = textBox.fontStyle || 'bold'
    // White fill with black outline (matching canvas text)
    textarea.style.color = '#FFFFFF'
    textarea.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
    textarea.style.border = '2px solid #4ECDC4'
    textarea.style.padding = '4px'
    textarea.style.margin = '0px'
    textarea.style.overflow = 'hidden'
    textarea.style.background = 'transparent'
    textarea.style.outline = 'none'
    textarea.style.resize = 'none'
    textarea.style.lineHeight = '1.2'
    textarea.style.transformOrigin = 'left top'
    textarea.style.textAlign = 'center'
    textarea.style.zIndex = '1000'

    textarea.focus()
    textarea.select()

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea)
      setIsEditing(false) // React will show text again via visible={!isEditing}
    }

    const PLACEHOLDER_TEXT = 'כתוב כאן...'
    let userHasTyped = false // Track if user actually typed anything

    const handleTextSave = () => {
      const newText = textarea.value.trim()
      // If text is empty, revert to placeholder
      if (newText === '') {
        onChange({ text: PLACEHOLDER_TEXT, isPlaceholder: true })
      } else if (userHasTyped) {
        // User typed something - mark as real content even if it matches placeholder text
        onChange({ text: newText, isPlaceholder: false })
      } else {
        // User never typed - text is still the original placeholder
        onChange({ text: newText, isPlaceholder: true })
      }
      removeTextarea()
    }

    // Track any input to detect user typing
    textarea.addEventListener('input', () => {
      userHasTyped = true
    })

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleTextSave()
      }
      if (e.key === 'Escape') {
        // Escape reverts without saving
        onChange({ text: originalText })
        removeTextarea()
      }
    })

    textarea.addEventListener('blur', () => {
      handleTextSave()
    })
  }

  // Calculate effective text color (auto-contrast when background is present)
  const effectiveTextColor = textBox.isPlaceholder
    ? '#999999'
    : textBox.backgroundColor
    ? getContrastColor(textBox.backgroundColor)
    : textBox.color

  // Get text dimensions for background
  const textWidth = textBox.width || 300
  const padding = textBox.backgroundPadding || 8
  const textHeight = textRef.current?.height() || textBox.fontSize * 1.5

  return (
    <>
      {/* Background Rectangle */}
      {textBox.backgroundColor && !isEditing && (
        <Rect
          x={textBox.x - textWidth / 2 - padding}
          y={textBox.y - padding}
          width={textWidth + padding * 2}
          height={textHeight + padding * 2}
          fill={textBox.backgroundColor}
          cornerRadius={4}
          opacity={0.9}
          rotation={textBox.rotation}
        />
      )}

      <Text
        ref={textRef}
        id={textBox.id}
        text={textBox.text}
        x={textBox.x}
        y={textBox.y}
        width={textWidth}
        offsetX={textWidth / 2}
        rotation={textBox.rotation}
        fill={effectiveTextColor}
        fontSize={textBox.fontSize}
        fontFamily={textBox.fontFamily}
        fontStyle={textBox.isPlaceholder ? 'italic' : (textBox.fontStyle || 'bold')}
        stroke={textBox.stroke || '#000000'}
        strokeWidth={textBox.strokeWidth || 1}
        align="center"
        verticalAlign="top"
        wrap="word"
        opacity={textBox.isPlaceholder ? 0.85 : 1}
        draggable
        dragBoundFunc={dragBoundFunc}
        onMouseEnter={() => onHoverCursor?.('move')}
        onMouseLeave={() => onHoverCursor?.('default')}
        onDragStart={onDragStart}
        onTransformStart={onDragStart}
        visible={!isEditing}
        onClick={() => {
          if (isSelected) {
            handleDoubleClick()
          } else {
            onSelect()
          }
        }}
        onTap={() => {
          if (isSelected) {
            handleDoubleClick()
          } else {
            onSelect()
          }
        }}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          if (onSnapDragEnd) {
            onSnapDragEnd(e, onChange)
          } else {
            onChange({
              x: e.target.x(),
              y: e.target.y()
            })
            useSceneStore.getState().commitTransaction()
          }
        }}
        onTransformEnd={() => {
          const node = textRef.current
          if (!node) return

          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // Reset scale
          node.scaleX(1)
          node.scaleY(1)

          // Calculate new width and fontSize
          const newWidth = Math.max(50, node.width() * scaleX)
          const newFontSize = Math.max(12, textBox.fontSize * scaleY)

          onChange({
            x: node.x(),
            y: node.y(),
            width: newWidth,
            fontSize: newFontSize,
            rotation: node.rotation()
          })

          if (onTransformEnd) {
            onTransformEnd()
          } else {
            useSceneStore.getState().commitTransaction()
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotateEnabled={true}
          rotateAnchorOffset={20}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right'
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

// Sticker component with transformer
function EditableSticker({
  sticker,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onSnapDragEnd,
  onTransformEnd,
  dragBoundFunc,
  onHoverCursor
}: {
  sticker: Sticker
  isSelected: boolean
  onSelect: () => void
  onChange: (attrs: any) => void
  onDragStart?: () => void
  onDragMove?: (e: any) => void
  onSnapDragEnd?: (e: any, onChange: (attrs: any) => void) => void
  onTransformEnd?: () => void
} & EditableCommonProps) {
  const stickerRef = useRef<Konva.Text>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (isSelected && transformerRef.current && stickerRef.current) {
      transformerRef.current.nodes([stickerRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <Text
        ref={stickerRef}
        text={sticker.emoji}
        x={sticker.x}
        y={sticker.y}
        fontSize={sticker.size}
        rotation={sticker.rotation}
        draggable
        dragBoundFunc={dragBoundFunc}
        onMouseEnter={() => onHoverCursor?.('move')}
        onMouseLeave={() => onHoverCursor?.('default')}
        onDragStart={onDragStart}
        onTransformStart={onDragStart}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          if (onSnapDragEnd) {
            onSnapDragEnd(e, onChange)
          } else {
            onChange({
              x: e.target.x(),
              y: e.target.y()
            })
            useSceneStore.getState().commitTransaction()
          }
        }}
        onTransformEnd={() => {
          const node = stickerRef.current
          if (!node) return

          const scaleX = node.scaleX()

          // Reset scale and apply to fontSize
          node.scaleX(1)
          node.scaleY(1)

          onChange({
            x: node.x(),
            y: node.y(),
            size: Math.max(20, sticker.size * scaleX),
            rotation: node.rotation()
          })

          if (onTransformEnd) {
            onTransformEnd()
          } else {
            useSceneStore.getState().commitTransaction()
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotateEnabled={true}
          rotateAnchorOffset={20}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

// Image sticker component with transformer.
// Anchored at its center (via offsetX/offsetY) so rotation pivots around the
// middle and the drag clamp keeps the sticker's center — not a corner — on canvas.
function EditableImage({
  imageEl,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onSnapDragEnd,
  onTransformEnd,
  dragBoundFunc,
  onHoverCursor
}: {
  imageEl: ImageElement
  isSelected: boolean
  onSelect: () => void
  onChange: (attrs: Partial<ImageElement>) => void
  onDragStart?: () => void
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void
  onSnapDragEnd?: (
    e: Konva.KonvaEventObject<DragEvent>,
    onChange: (attrs: Partial<ImageElement>) => void
  ) => void
  onTransformEnd?: () => void
} & EditableCommonProps) {
  const imageRef = useRef<Konva.Image>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [img] = useImage(imageEl.src, 'anonymous')

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected, img])

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={img}
        x={imageEl.x}
        y={imageEl.y}
        width={imageEl.width}
        height={imageEl.height}
        offsetX={imageEl.width / 2}
        offsetY={imageEl.height / 2}
        rotation={imageEl.rotation}
        draggable
        dragBoundFunc={dragBoundFunc}
        onMouseEnter={() => onHoverCursor?.('move')}
        onMouseLeave={() => onHoverCursor?.('default')}
        onDragStart={onDragStart}
        onTransformStart={onDragStart}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          if (onSnapDragEnd) {
            onSnapDragEnd(e, onChange)
          } else {
            onChange({
              x: e.target.x(),
              y: e.target.y()
            })
            useSceneStore.getState().commitTransaction()
          }
        }}
        onTransformEnd={() => {
          const node = imageRef.current
          if (!node) return

          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // Reset scale and bake it into width/height
          node.scaleX(1)
          node.scaleY(1)

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(24, imageEl.width * scaleX),
            height: Math.max(24, imageEl.height * scaleY),
            rotation: node.rotation()
          })

          if (onTransformEnd) {
            onTransformEnd()
          } else {
            useSceneStore.getState().commitTransaction()
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotateEnabled={true}
          rotateAnchorOffset={20}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

// Location component with transformer
function EditableLocation({
  location,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onSnapDragEnd,
  onTransformEnd,
  dragBoundFunc,
  onHoverCursor
}: {
  location: Location
  isSelected: boolean
  onSelect: () => void
  onChange: (attrs: Partial<Location>) => void
  onDragStart?: () => void
  onDragMove?: (e: any) => void
  onSnapDragEnd?: (e: any, onChange: (attrs: any) => void) => void
  onTransformEnd?: () => void
} & EditableCommonProps) {
  const locationRef = useRef<Konva.Text>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (isSelected && transformerRef.current && locationRef.current) {
      transformerRef.current.nodes([locationRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  // Get short format: Street + City
  const parts = location.display_name.split(',').map(p => p.trim())
  const shortLocation = parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : parts[0]

  const locationWidth = 300

  return (
    <>
      <Text
        ref={locationRef}
        text={`📍 ${shortLocation}`}
        x={location.x || 0}
        y={location.y || 0}
        width={locationWidth}
        offsetX={locationWidth / 2}
        fontSize={location.fontSize || 24}
        fill={location.color || '#FFFFFF'}
        stroke="#000000"
        strokeWidth={1}
        fontFamily="IBM Plex Sans Hebrew"
        fontStyle="bold"
        rotation={location.rotation || 0}
        align="center"
        verticalAlign="top"
        wrap="word"
        draggable
        dragBoundFunc={dragBoundFunc}
        onMouseEnter={() => onHoverCursor?.('move')}
        onMouseLeave={() => onHoverCursor?.('default')}
        onDragStart={onDragStart}
        onTransformStart={onDragStart}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          if (onSnapDragEnd) {
            onSnapDragEnd(e, onChange)
          } else {
            onChange({
              x: e.target.x(),
              y: e.target.y()
            })
            useSceneStore.getState().commitTransaction()
          }
        }}
        onTransformEnd={() => {
          const node = locationRef.current
          if (!node) return

          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // Reset scale
          node.scaleX(1)
          node.scaleY(1)

          // Calculate new fontSize based on vertical scale
          const newFontSize = Math.max(12, (location.fontSize || 24) * scaleY)

          onChange({
            x: node.x(),
            y: node.y(),
            fontSize: newFontSize,
            rotation: node.rotation()
          })

          if (onTransformEnd) {
            onTransformEnd()
          } else {
            useSceneStore.getState().commitTransaction()
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotateEnabled={true}
          rotateAnchorOffset={20}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right'
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  ({ width = 800, height = 600 }, ref) => {
    const {
      currentImageUrl,
      selectedLocation,
      setCanvasDimensions
    } = useEditorStore()

    const {
      scene,
      selectOne,
      updateElement,
      beginTransaction,
      commitTransaction
    } = useSceneStore()

    const [image] = useImage(currentImageUrl || '', 'anonymous')
    const stageRef = useRef<Konva.Stage>(null)

    // Delete/arrows/undo shortcuts — active only while the editor is mounted
    useEditorKeyboard()

    // Snapping guides state
    const [guides, setGuides] = useState<{ vertical: number | null; horizontal: number | null }>({
      vertical: null,
      horizontal: null
    })
    const SNAP_THRESHOLD = 10

    // Expose stage ref to parent
    useImperativeHandle(ref, () => ({
      getStage: () => stageRef.current
    }))

  // Calculate canvas dimensions to fit image
  const canvasDimensions = (() => {
    if (!image) return { width, height }

    const imgRatio = image.width / image.height
    const canvasRatio = width / height

    if (imgRatio > canvasRatio) {
      // Image is wider
      return {
        width,
        height: width / imgRatio
      }
    } else {
      // Image is taller
      return {
        width: height * imgRatio,
        height
      }
    }
  })()

  // Update canvas dimensions in store when they change
  useEffect(() => {
    if (image) {
      setCanvasDimensions(canvasDimensions)
    }
  }, [canvasDimensions.width, canvasDimensions.height, image, setCanvasDimensions])

  // Keep the anchor point of every element inside the canvas while dragging,
  // so nothing can be dragged fully off-screen and become unreachable.
  const clampToCanvas = (pos: { x: number; y: number }) => ({
    x: Math.max(0, Math.min(pos.x, canvasDimensions.width)),
    y: Math.max(0, Math.min(pos.y, canvasDimensions.height))
  })

  const setCursor = (cursor: string) => {
    const container = stageRef.current?.container()
    if (container) container.style.cursor = cursor
  }

  const handleStageClick = (e: any) => {
    // Deselect when clicking on empty area or the background image.
    // Image stickers are Konva Images too, so match the background by name
    // rather than by class — otherwise clicking a sticker would deselect it.
    const clickedOnEmpty = e.target === e.target.getStage()
    const clickedOnBackground = e.target.name?.() === 'background-image'

    if (clickedOnEmpty || clickedOnBackground) {
      selectOne(null)
    }
  }

  // Snapping to center
  const handleDragMove = (e: any) => {
    const node = e.target
    const stage = node.getStage()
    if (!stage) return

    const centerX = canvasDimensions.width / 2
    const centerY = canvasDimensions.height / 2

    const nodeX = node.x()
    const nodeY = node.y()

    let newGuides = { vertical: null as number | null, horizontal: null as number | null }
    let snappedX = nodeX
    let snappedY = nodeY

    // Check vertical snap (horizontal center line)
    if (Math.abs(nodeX - centerX) < SNAP_THRESHOLD) {
      snappedX = centerX
      newGuides.vertical = centerX
    }

    // Check horizontal snap (vertical center line)
    if (Math.abs(nodeY - centerY) < SNAP_THRESHOLD) {
      snappedY = centerY
      newGuides.horizontal = centerY
    }

    // Apply snapping
    node.x(snappedX)
    node.y(snappedY)

    // Update guides
    setGuides(newGuides)
  }

  const handleSnapDragEnd = (e: any, onChange: (attrs: any) => void) => {
    // Clear guides
    setGuides({ vertical: null, horizontal: null })

    // Update position
    onChange({
      x: e.target.x(),
      y: e.target.y()
    })

    // Commit drag transaction
    commitTransaction()
  }

  // Two-finger gesture tracking
  const lastDist = useRef<number>(0)
  const lastAngle = useRef<number>(0)

  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  const getAngle = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
  }

  const handleTouchMove = (e: any) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]

    // Only handle two-finger gestures
    if (!touch1 || !touch2) {
      lastDist.current = 0
      lastAngle.current = 0
      return
    }

    const p1 = { x: touch1.clientX, y: touch1.clientY }
    const p2 = { x: touch2.clientX, y: touch2.clientY }

    const newDist = getDistance(p1, p2)
    const newAngle = getAngle(p1, p2)

    if (lastDist.current > 0) {
      // Apply pinch-to-zoom
      const scale = newDist / lastDist.current

      // Apply rotation
      const rotation = newAngle - lastAngle.current

      // Apply to selected element
      const selectedId = scene.selection[0]
      if (selectedId) {
        const selectedEl = scene.elements.find((el) => el.id === selectedId)
        if (selectedEl) {
          beginTransaction()
          if (selectedEl.type === 'text') {
            updateElement(selectedId, {
              fontSize: Math.max(12, Math.min(200, selectedEl.fontSize * scale)),
              width: Math.max(50, (selectedEl.width || 300) * scale),
              rotation: (selectedEl.rotation + rotation) % 360
            })
          } else if (selectedEl.type === 'emoji') {
            updateElement(selectedId, {
              size: Math.max(20, Math.min(200, selectedEl.size * scale)),
              rotation: (selectedEl.rotation + rotation) % 360
            })
          } else if (selectedEl.type === 'image') {
            // Clamp the scale factor itself so both dimensions shrink together
            // and the sticker keeps its aspect ratio at the minimum size
            const minScale = 24 / Math.min(selectedEl.width, selectedEl.height)
            const uniformScale = Math.max(minScale, scale)
            updateElement(selectedId, {
              width: selectedEl.width * uniformScale,
              height: selectedEl.height * uniformScale,
              rotation: (selectedEl.rotation + rotation) % 360
            })
          } else if (selectedEl.type === 'location') {
            updateElement(selectedId, {
              fontSize: Math.max(12, Math.min(100, (selectedEl.fontSize || 24) * scale)),
              rotation: ((selectedEl.rotation || 0) + rotation) % 360
            })
          }
        }
      }
    }

    lastDist.current = newDist
    lastAngle.current = newAngle
  }

  const handleTouchEnd = () => {
    lastDist.current = 0
    lastAngle.current = 0
    commitTransaction()
  }

  return (
    <div className="flex justify-center items-center bg-paper bg-blueprint-light bg-grid-sm rounded-xl border border-ink/5 p-4">
      <Stage
        ref={stageRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white shadow-lg"
      >
        <Layer>
          {/* Background Image */}
          {image && (
            <KonvaImage
              name="background-image"
              image={image}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
            />
          )}

          {/* Render Elements in Z-Order */}
          {scene.elements.map((element) => {
            if (element.type === 'text') {
              return (
                <EditableText
                  key={element.id}
                  textBox={element}
                  isSelected={scene.selection.includes(element.id)}
                  onSelect={() => selectOne(element.id)}
                  onChange={(attrs) => updateElement(element.id, attrs)}
                  onDragStart={() => beginTransaction()}
                  onDragMove={handleDragMove}
                  onSnapDragEnd={handleSnapDragEnd}
                  onTransformEnd={() => commitTransaction()}
                  dragBoundFunc={clampToCanvas}
                  onHoverCursor={setCursor}
                />
              )
            } else if (element.type === 'emoji') {
              return (
                <EditableSticker
                  key={element.id}
                  sticker={{
                    id: element.id,
                    emoji: element.glyph,
                    x: element.x,
                    y: element.y,
                    size: element.size,
                    rotation: element.rotation
                  }}
                  isSelected={scene.selection.includes(element.id)}
                  onSelect={() => selectOne(element.id)}
                  onChange={(attrs) => {
                    const updates: any = {}
                    if (attrs.x !== undefined) updates.x = attrs.x
                    if (attrs.y !== undefined) updates.y = attrs.y
                    if (attrs.size !== undefined) updates.size = attrs.size
                    if (attrs.rotation !== undefined) updates.rotation = attrs.rotation
                    updateElement(element.id, updates)
                  }}
                  onDragStart={() => beginTransaction()}
                  onDragMove={handleDragMove}
                  onSnapDragEnd={handleSnapDragEnd}
                  onTransformEnd={() => commitTransaction()}
                  dragBoundFunc={clampToCanvas}
                  onHoverCursor={setCursor}
                />
              )
            } else if (element.type === 'image') {
              return (
                <EditableImage
                  key={element.id}
                  imageEl={element}
                  isSelected={scene.selection.includes(element.id)}
                  onSelect={() => selectOne(element.id)}
                  onChange={(attrs) => updateElement(element.id, attrs)}
                  onDragStart={() => beginTransaction()}
                  onDragMove={handleDragMove}
                  onSnapDragEnd={handleSnapDragEnd}
                  onTransformEnd={() => commitTransaction()}
                  dragBoundFunc={clampToCanvas}
                  onHoverCursor={setCursor}
                />
              )
            } else if (element.type === 'location') {
              return (
                <EditableLocation
                  key={element.id}
                  location={{
                    display_name: element.display_name,
                    latitude: element.latitude,
                    longitude: element.longitude,
                    x: element.x || canvasDimensions.width / 2 - 100,
                    y: element.y || canvasDimensions.height - 60,
                    fontSize: element.fontSize,
                    color: element.color,
                    rotation: element.rotation
                  }}
                  isSelected={scene.selection.includes(element.id)}
                  onSelect={() => selectOne(element.id)}
                  onChange={(attrs) => {
                    const updates: any = {}
                    if (attrs.x !== undefined) updates.x = attrs.x
                    if (attrs.y !== undefined) updates.y = attrs.y
                    if (attrs.fontSize !== undefined) updates.fontSize = attrs.fontSize
                    if (attrs.rotation !== undefined) updates.rotation = attrs.rotation
                    updateElement(element.id, updates)
                  }}
                  onDragStart={() => beginTransaction()}
                  onDragMove={handleDragMove}
                  onSnapDragEnd={handleSnapDragEnd}
                  onTransformEnd={() => commitTransaction()}
                  dragBoundFunc={clampToCanvas}
                  onHoverCursor={setCursor}
                />
              )
            }
            return null
          })}

          {/* Snap Guides */}
          {guides.vertical !== null && (
            <Line
              points={[guides.vertical, 0, guides.vertical, canvasDimensions.height]}
              stroke="#4ECDC4"
              strokeWidth={2}
              dash={[4, 6]}
              listening={false}
            />
          )}
          {guides.horizontal !== null && (
            <Line
              points={[0, guides.horizontal, canvasDimensions.width, guides.horizontal]}
              stroke="#4ECDC4"
              strokeWidth={2}
              dash={[4, 6]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
})

CanvasEditor.displayName = 'CanvasEditor'

export default CanvasEditor

import { useState, useRef, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { useEditorStore } from '@/stores/useEditorStore'
import { TEMPLATES, getTemplatesList } from '@/lib/templates'
import { preloadImages } from '@/lib/cache'
// import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

interface TemplateSelectorProps {
  canvasWidth?: number
  canvasHeight?: number
}

export default function TemplateSelector({ canvasWidth = 900, canvasHeight = 650 }: TemplateSelectorProps = {}) {
  const {
    setCurrentImage,
    addTextBox,
    addSticker,
    setSelectedTags,
    setSelectedLocation,
    setUsername,
    setDescription,
    resetEditor
  } = useEditorStore()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const templates = getTemplatesList()

  // Preload template images on mount
  useEffect(() => {
    const imageUrls = templates.map(t => t.url)
    preloadImages(imageUrls).catch(err => {
      console.warn('Failed to preload some template images:', err)
    })
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    resetEditor()
    setSelectedTemplate(templateId)

    const template = TEMPLATES[templateId]

    // Load image to get actual dimensions and calculate canvas scaling
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      // Calculate scaled canvas dimensions (same logic as CanvasEditor)
      const maxWidth = canvasWidth
      const maxHeight = canvasHeight
      const imgRatio = img.width / img.height
      const canvasRatio = maxWidth / maxHeight

      let scaledWidth: number, scaledHeight: number
      if (imgRatio > canvasRatio) {
        // Image is wider
        scaledWidth = maxWidth
        scaledHeight = maxWidth / imgRatio
      } else {
        // Image is taller
        scaledWidth = maxHeight * imgRatio
        scaledHeight = maxHeight
      }

      // Set image after calculating dimensions
      setCurrentImage(null, template.url, templateId)

      // Calculate font size scale based on canvas size (for mobile)
      const fontSizeScale = canvasWidth < 600 ? 0.5 : canvasWidth < 800 ? 0.7 : 1.0

      // Calculate text box width scale based on canvas size
      const textBoxWidth = Math.max(200, Math.min(400, scaledWidth * 0.45))

      // Check for pending editor state from template switch
      const savedStateJson = sessionStorage.getItem('pendingEditorState')

      if (savedStateJson) {
        // Restore saved state instead of adding default text boxes
        const savedState = JSON.parse(savedStateJson)

        // Restore text boxes
        savedState.textBoxes?.forEach((textBox: any) => {
          addTextBox(textBox)
        })

        // Restore stickers
        savedState.stickers?.forEach((sticker: any) => {
          addSticker(sticker)
        })

        // Restore metadata
        if (savedState.selectedTags) setSelectedTags(savedState.selectedTags)
        if (savedState.selectedLocation) setSelectedLocation(savedState.selectedLocation)
        if (savedState.username) setUsername(savedState.username)
        if (savedState.description) setDescription(savedState.description)

        // Clear saved state
        sessionStorage.removeItem('pendingEditorState')
      } else {
        // No saved state - add default text boxes with scaled positions
        template.defaultTextBoxes.forEach((defaultBox) => {
          addTextBox({
            text: defaultBox.text,
            x: defaultBox.xPercent * scaledWidth,  // Use scaled canvas width
            y: defaultBox.yPercent * scaledHeight, // Use scaled canvas height
            width: textBoxWidth,
            fontSize: Math.max(16, defaultBox.fontSize * fontSizeScale),
            color: defaultBox.color,
            fontFamily: defaultBox.fontFamily,
            stroke: defaultBox.stroke,
            strokeWidth: defaultBox.strokeWidth,
            fontStyle: defaultBox.fontStyle || 'bold',
            rotation: 0,
            isPlaceholder: true  // Gray placeholder styling from initial load
          })
        })
      }
    }

    img.onerror = () => {
      console.error('Failed to load template image:', template.url)
      alert('שגיאה בטעינת התבנית')
    }

    img.src = template.url
  }

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('נא לבחור קובץ תמונה')
      return
    }

    // Validate file size (20MB = 20 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      alert(`גודל הקובץ (${fileSizeMB}MB) חורג מהמקסימום המותר (20MB).\nנא לבחור תמונה קטנה יותר.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      resetEditor()
      setSelectedTemplate('custom')

      // Load image to calculate canvas dimensions
      const img = new Image()
      img.onload = () => {
        // Calculate scaled canvas dimensions
        const maxWidth = canvasWidth
        const maxHeight = canvasHeight
        const imgRatio = img.width / img.height
        const canvasRatio = maxWidth / maxHeight

        let scaledWidth: number, scaledHeight: number
        if (imgRatio > canvasRatio) {
          scaledWidth = maxWidth
          scaledHeight = maxWidth / imgRatio
        } else {
          scaledWidth = maxHeight * imgRatio
          scaledHeight = maxHeight
        }

        setCurrentImage(null, imageUrl, null)

        // Calculate font size scale based on canvas size (for mobile)
        const fontSizeScale = canvasWidth < 600 ? 0.5 : canvasWidth < 800 ? 0.7 : 1.0

        // Calculate text box width scale based on canvas size
        const textBoxWidth = Math.max(200, Math.min(400, scaledWidth * 0.45))

        // Check for pending editor state from template switch
        const savedStateJson = sessionStorage.getItem('pendingEditorState')

        if (savedStateJson) {
          // Restore saved state instead of adding default text boxes
          const savedState = JSON.parse(savedStateJson)

          // Restore text boxes
          savedState.textBoxes?.forEach((textBox: any) => {
            addTextBox(textBox)
          })

          // Restore stickers
          savedState.stickers?.forEach((sticker: any) => {
            addSticker(sticker)
          })

          // Restore metadata
          if (savedState.selectedTags) setSelectedTags(savedState.selectedTags)
          if (savedState.selectedLocation) setSelectedLocation(savedState.selectedLocation)
          if (savedState.username) setUsername(savedState.username)
          if (savedState.description) setDescription(savedState.description)

          // Clear saved state
          sessionStorage.removeItem('pendingEditorState')
        } else {
          // No saved state - add default text boxes for custom image at top and bottom
          addTextBox({
            text: 'כתבו כאן...',
            x: scaledWidth / 2,
            y: scaledHeight * 0.1,
            width: textBoxWidth,
            fontSize: Math.max(16, 36 * fontSizeScale),
            color: '#FFFFFF',
            fontFamily: 'IBM Plex Sans Hebrew',
            stroke: '#000000',
            strokeWidth: 1,
            fontStyle: 'bold',
            rotation: 0,
            isPlaceholder: true  // Gray placeholder styling from initial load
          })

          addTextBox({
            text: 'כתבו כאן...',
            x: scaledWidth / 2,
            y: scaledHeight * 0.85,
            width: textBoxWidth,
            fontSize: Math.max(16, 36 * fontSizeScale),
            color: '#FFFFFF',
            fontFamily: 'IBM Plex Sans Hebrew',
            stroke: '#000000',
            strokeWidth: 1,
            fontStyle: 'bold',
            rotation: 0,
            isPlaceholder: true  // Gray placeholder styling from initial load
          })
        }
      }

      img.src = imageUrl
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* Upload Custom Image - Wide Filled Card */}
      <Card
        hover
        padding="none"
        className="cursor-pointer transition-all border-2 border-dashed border-primary/30 hover:border-primary hover:shadow-xl"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="h-48 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white/50" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="bg-primary/10 p-6 rounded-full backdrop-blur-sm border-2 border-primary/20">
              <Upload size={48} className="text-primary" />
            </div>
            <div className="text-center px-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                העלו תמונה משלכם
              </h3>
              <p className="text-gray-600">
                לחצו כאן כדי לבחור תמונה מהמחשב
              </p>
            </div>
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCustomUpload}
        className="hidden"
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 px-4 text-sm text-gray-500 font-medium">
            או בחרו תבנית קיימת
          </span>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            hover
            padding="none"
            className={`cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'ring-4 ring-primary'
                : ''
            }`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-center truncate">
                {template.name}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

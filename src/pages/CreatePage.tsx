import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import TemplateSelector from '@/components/editor/TemplateSelector'
import CanvasEditor, { type CanvasEditorHandle } from '@/components/editor/CanvasEditor'
import SelectionToolbar from '@/components/editor/SelectionToolbar'
import TextPanel from '@/components/editor/panels/TextPanel'
import EmojiPanel from '@/components/editor/panels/EmojiPanel'
import StickerPanel from '@/components/editor/panels/StickerPanel'
import TagsPanel from '@/components/editor/panels/TagsPanel'
import LocationPanel from '@/components/editor/panels/LocationPanel'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import SuccessModal from '@/components/common/SuccessModal'
import ConsentModal from '@/components/common/ConsentModal'
import Spinner from '@/components/common/Spinner'
import { useEditorStore } from '@/stores/useEditorStore'
import { useSceneStore } from '@/stores/useSceneStore'
import { usePublishMeme } from '@/hooks/usePublishMeme'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { ArrowRight, Type, Smile, Sticker, Tag, MapPin, RotateCcw, Sparkles, Upload, Undo2, Redo2, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canvasSizeForViewport } from '@/lib/canvasSizing'

type EditorTab = 'text' | 'emoji' | 'sticker' | 'tags' | 'location'

// Mobile bottom sheet states: collapsed (tabs + publish button only),
// half (default editing height) and tall (almost full screen). The handle
// can also be dragged freely; on release the sheet snaps to the nearest state.
type SheetState = 'collapsed' | 'half' | 'tall'
const SHEET_DRAG_MIN_PX = 80
const SHEET_DRAG_MAX_VH = 0.85
const SNAP_HALF_BELOW_VH = 0.3
const SNAP_TALL_ABOVE_VH = 0.62

export default function CreatePage() {
  const {
    currentImageUrl,
    currentTemplateId,
    resetEditor,
    setCurrentImage,
    setSelectedTags,
    setSelectedLocation,
    selectedLocation,
    selectedTags,
    username,
    description
  } = useEditorStore()
  const { scene, undo, redo, reset: resetScene } = useSceneStore()
  const past = useSceneStore((state) => state.past)
  const future = useSceneStore((state) => state.future)
  const [activeTab, setActiveTab] = useState<EditorTab>('text')
  const [sheetState, setSheetState] = useState<SheetState>('collapsed')
  // Live height while the user drags the sheet handle; null when not dragging
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startHeight: number; moved: boolean } | null>(null)
  const { keyboardInset, visualHeight } = useKeyboardInset()
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [publishedMeme, setPublishedMeme] = useState<{ imageUrl: string; memeId: string } | null>(null)
  const [showNavigationDialog, setShowNavigationDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [showTemplateSwitchModal, setShowTemplateSwitchModal] = useState(false)
  const [showImageUploadModal, setShowImageUploadModal] = useState(false)
  const canvasRef = useRef<CanvasEditorHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isRemixing = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { publishMeme, isPublishing } = usePublishMeme()

  // Check if user has accepted terms on mount
  useEffect(() => {
    const hasAcceptedPermanent = localStorage.getItem('hasAcceptedTerms')
    const hasAcceptedSession = sessionStorage.getItem('hasAcceptedTerms')

    // Only show if neither localStorage nor sessionStorage has the flag
    // This prevents showing multiple times in same session even if iOS clears localStorage
    if (!hasAcceptedPermanent && !hasAcceptedSession) {
      setShowConsentModal(true)
    }
  }, [])

  // Responsive canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 900, height: 650 })

  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasDimensions(canvasSizeForViewport(window.innerWidth, window.innerHeight))
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  // Handle remix: Load meme from navigation state
  useEffect(() => {
    const remixMeme = location.state?.remixMeme
    if (remixMeme) {
      // Set remixing flag
      isRemixing.current = true

      // Load the meme image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setCurrentImage(img, remixMeme.imageUrl, null)

        // Restore tags if available
        if (remixMeme.tags && remixMeme.tags.length > 0) {
          setSelectedTags(remixMeme.tags)
        }

        // Restore location if available
        if (remixMeme.location) {
          setSelectedLocation(remixMeme.location)
        }

        // Clear remixing flag after successful load
        isRemixing.current = false
      }
      img.src = remixMeme.imageUrl

      // Clear the navigation state to prevent re-loading on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, setCurrentImage, setSelectedTags, setSelectedLocation, navigate])

  // --- Bottom sheet drag-to-resize (mobile only; the sheet is static on lg) ---
  const isSheetExpanded = sheetState !== 'collapsed' || dragHeight !== null

  const handleSheetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 1024) return
    const sheet = sheetRef.current
    if (!sheet) return
    dragRef.current = { startY: e.clientY, startHeight: sheet.getBoundingClientRect().height, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const handleSheetPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dy = drag.startY - e.clientY
    if (Math.abs(dy) > 6) drag.moved = true
    if (!drag.moved) return
    const maxH = Math.round(window.innerHeight * SHEET_DRAG_MAX_VH)
    setDragHeight(Math.min(maxH, Math.max(SHEET_DRAG_MIN_PX, Math.round(drag.startHeight + dy))))
  }

  const handleSheetPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)

    if (!drag.moved) {
      // A tap (no real movement) toggles the sheet like before
      setSheetState((s) => (s === 'collapsed' ? 'half' : 'collapsed'))
      setDragHeight(null)
      return
    }

    // Snap the dragged height to the nearest state
    const h = sheetRef.current?.getBoundingClientRect().height ?? 0
    const vh = window.innerHeight
    if (h < vh * SNAP_HALF_BELOW_VH) setSheetState('collapsed')
    else if (h < vh * SNAP_TALL_ABOVE_VH) setSheetState('half')
    else setSheetState('tall')
    setDragHeight(null)
  }

  const handlePublish = async () => {
    const stage = canvasRef.current?.getStage()
    if (!stage) {
      alert('אנא המתן עד שהעורך יהיה מוכן')
      return
    }

    const result = await publishMeme({ current: stage })

    if (result.success && result.imageUrl && result.memeId) {
      setPublishedMeme({
        imageUrl: result.imageUrl,
        memeId: result.memeId
      })
      setShowSuccessModal(true)
    } else {
      alert(`שגיאה בפרסום: ${result.error}`)
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    resetEditor()
    resetScene()
  }

  // Warn before leaving page with unsaved work
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentImageUrl) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentImageUrl])

  // Navigation dialog handlers
  const handlePublishAndNavigate = async () => {
    const stage = canvasRef.current?.getStage()
    if (stage) {
      const result = await publishMeme({ current: stage })
      if (result.success) {
        resetEditor()
        resetScene()
        setShowNavigationDialog(false)
        if (pendingNavigation) {
          navigate(pendingNavigation)
        }
      }
    }
  }

  const handleDiscardAndNavigate = () => {
    resetEditor()
    resetScene()
    setShowNavigationDialog(false)
    if (pendingNavigation) {
      navigate(pendingNavigation)
    }
  }

  const handleCancelNavigation = () => {
    setShowNavigationDialog(false)
    setPendingNavigation(null)
  }

  // Template switching handlers
  const handleSwitchTemplateClick = () => {
    // Check if there's any work to save
    if (scene.elements.length > 0) {
      setShowTemplateSwitchModal(true)
    } else {
      // No work to save, just reset
      resetEditor()
      resetScene()
    }
  }

  const handleSaveAndSwitchTemplate = () => {
    // Save current editor state to sessionStorage
    const editorState = {
      selectedTags,
      selectedLocation,
      username,
      description
    }
    sessionStorage.setItem('pendingEditorState', JSON.stringify(editorState))
    sessionStorage.setItem('pendingSceneElements', JSON.stringify(scene.elements))

    // Reset only the image (keep other state temporarily)
    setCurrentImage(null, null, null)
    setShowTemplateSwitchModal(false)
  }

  const handleDiscardAndSwitchTemplate = () => {
    resetEditor()
    resetScene()
    setShowTemplateSwitchModal(false)
  }

  // Custom image upload handlers
  const handleChangeCustomImageClick = () => {
    // Check if there's any work to save
    if (scene.elements.length > 0) {
      setShowImageUploadModal(true)
    } else {
      // No work to save, just open file picker
      fileInputRef.current?.click()
    }
  }

  const handleSaveAndUploadImage = () => {
    // Save current editor state to sessionStorage
    const editorState = {
      selectedTags,
      selectedLocation,
      username,
      description
    }
    sessionStorage.setItem('pendingEditorState', JSON.stringify(editorState))
    sessionStorage.setItem('pendingSceneElements', JSON.stringify(scene.elements))
    setShowImageUploadModal(false)

    // Trigger file picker
    fileInputRef.current?.click()
  }

  const handleDiscardAndUploadImage = () => {
    resetEditor()
    resetScene()
    setShowImageUploadModal(false)
    fileInputRef.current?.click()
  }

  // Expose navigation interceptor for Header to use
  useEffect(() => {
    // Store function in window for Header to access
    (window as any).checkUnsavedWork = (path: string) => {
      if (currentImageUrl && location.pathname === '/create') {
        setPendingNavigation(path)
        setShowNavigationDialog(true)
        return false
      }
      return true
    }

    return () => {
      delete (window as any).checkUnsavedWork
    }
  }, [currentImageUrl, location.pathname])

  // Show loading state while remixing
  if (isRemixing.current && !currentImageUrl) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-lg text-gray-600">טוען גיחוך...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show template selector when no image is selected and not remixing
  if (!currentImageUrl && !isRemixing.current) {
    return (
      <>
        <Layout>
          <div className="container mx-auto px-4 py-4 md:py-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-8">בחרו תבנית</h1>
            <TemplateSelector canvasWidth={canvasDimensions.width} canvasHeight={canvasDimensions.height} />
          </div>
        </Layout>

        {/* Consent Modal */}
        <ConsentModal
          isOpen={showConsentModal}
          onAccept={() => setShowConsentModal(false)}
        />
      </>
    )
  }

  // Show editor when image is selected
  return (
    <Layout>
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 pb-44 lg:pb-8">
        {/* Compact single-row toolbar on phones (icons only) so the canvas
            starts above the fold; labels appear from the sm breakpoint up. */}
        <div className="mb-3 md:mb-8 flex flex-row items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold">עורך הגיחוכים</h1>
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            {/* Undo/Redo Controls */}
            <Button
              variant="outline"
              onClick={undo}
              disabled={past.length === 0}
              className="flex items-center justify-center p-2 min-w-[44px]"
              title="ביטול פעולה אחרונה"
              aria-label="ביטול פעולה אחרונה"
            >
              <Undo2 size={18} />
            </Button>
            <Button
              variant="outline"
              onClick={redo}
              disabled={future.length === 0}
              className="flex items-center justify-center p-2 min-w-[44px]"
              title="ביצוע שוב של הפעולה"
              aria-label="ביצוע שוב של הפעולה"
            >
              <Redo2 size={18} />
            </Button>

            {/* Upload Different Image - Only for custom uploads */}
            {currentTemplateId === null && (
              <Button
                variant="secondary"
                onClick={handleChangeCustomImageClick}
                className="text-sm md:text-base p-2 min-w-[44px] sm:px-4 flex items-center justify-center gap-2"
                title="החלף תמונה"
                aria-label="החלף תמונה"
              >
                <Upload size={18} />
                <span className="hidden sm:inline">החלף תמונה</span>
              </Button>
            )}
            {/* Choose Different Template */}
            <Button
              variant="outline"
              onClick={handleSwitchTemplateClick}
              className="text-sm md:text-base p-2 min-w-[44px] sm:px-4 flex items-center justify-center gap-2"
              title="בחר תבנית אחרת"
              aria-label="בחר תבנית אחרת"
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">בחר תבנית אחרת</span>
            </Button>
            {/* Start Fresh */}
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('האם אתה בטוח? כל השינויים יימחקו')) {
                  resetEditor()
                  resetScene()
                }
              }}
              className="text-sm md:text-base p-2 min-w-[44px] sm:px-4 flex items-center justify-center gap-2"
              title="התחל מחדש"
              aria-label="התחל מחדש"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">התחל מחדש</span>
            </Button>
          </div>
        </div>

        {/* Hidden file input for custom image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            // Use the same handler as TemplateSelector
            const file = e.target.files?.[0]
            if (!file) return

            if (!file.type.startsWith('image/')) {
              alert('נא לבחור קובץ תמונה')
              return
            }

            const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
            if (file.size > MAX_FILE_SIZE) {
              const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
              alert(`גודל הקובץ (${fileSizeMB}MB) חורג מהמקסימום המותר (20MB).\nנא לבחור תמונה קטנה יותר.`)
              return
            }

            const reader = new FileReader()
            reader.onload = (event) => {
              const imageUrl = event.target?.result as string
              if (!sessionStorage.getItem('pendingEditorState')) {
                resetEditor()
                resetScene()
              }

              const img = new Image()
              img.onload = () => {
                setCurrentImage(null, imageUrl, null)
              }
              img.src = imageUrl
            }
            reader.readAsDataURL(file)

            // Reset file input
            e.target.value = ''
          }}
          className="hidden"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Main: Canvas Editor - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-card border border-ink/5 p-3 md:p-6">
              <SelectionToolbar />
              <CanvasEditor ref={canvasRef} width={canvasDimensions.width} height={canvasDimensions.height} />
            </div>
          </div>

          {/* Right: Editor Tools & Mobile Bottom Sheet */}
          <div
            ref={sheetRef}
            style={{
              ...(dragHeight !== null ? { height: dragHeight } : {}),
              // Lift the sheet above the software keyboard (iOS Safari and
              // Chrome Android keep fixed elements behind it otherwise) and
              // cap its height so the handle stays reachable.
              ...(keyboardInset > 0
                ? {
                    bottom: keyboardInset,
                    maxHeight: Math.max(160, (visualHeight ?? window.innerHeight) - 56)
                  }
                : {})
            }}
            className={cn(
              "bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-100 rounded-t-2xl flex flex-col z-30",
              dragHeight !== null ? "transition-none" : "transition-all duration-300",
              "lg:col-span-1 lg:rounded-2xl lg:static lg:shadow-card lg:border lg:border-ink/5 lg:h-auto lg:z-auto", // Desktop resets
              "fixed bottom-0 left-0 right-0", // Mobile layout positioning
              // Collapsed: intrinsic height (handle + tabs + publish button all visible).
              // A fixed height here used to clip the publish footer off-screen on phones.
              dragHeight === null && sheetState === 'half' && "mobile-bottom-sheet-half lg:h-auto",
              dragHeight === null && sheetState === 'tall' && "mobile-bottom-sheet-tall lg:h-auto"
            )}
          >
            {/* Drag handle for mobile viewports: tap toggles, drag resizes */}
            <div
              role="button"
              aria-label={isSheetExpanded ? 'הקטן את חלונית הכלים' : 'הגדל את חלונית הכלים'}
              tabIndex={0}
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerEnd}
              onPointerCancel={handleSheetPointerEnd}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSheetState((s) => (s === 'collapsed' ? 'half' : 'collapsed'))
                }
              }}
              className="lg:hidden flex items-center justify-center py-2.5 cursor-grab touch-none select-none border-b border-gray-50 flex-shrink-0"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
            </div>

            {/* Tab Headers */}
            <div className="grid grid-cols-5 border-b border-ink/5 flex-shrink-0">
              {[
                { id: 'text' as EditorTab, icon: Type, label: 'טקסט' },
                { id: 'emoji' as EditorTab, icon: Smile, label: 'אמוג׳י' },
                { id: 'sticker' as EditorTab, icon: Sticker, label: 'סטיקרים' },
                { id: 'location' as EditorTab, icon: MapPin, label: 'מיקום' },
                { id: 'tags' as EditorTab, icon: Tag, label: 'תגיות' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    // Auto-expand bottom sheet when a tab is clicked on mobile
                    setSheetState((s) => (s === 'collapsed' ? 'half' : s))
                  }}
                  className={`flex flex-col items-center gap-1 py-2 md:py-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-pop-pink text-white'
                      : 'bg-paper text-ink-light hover:bg-pastel-pink/40'
                  }`}
                >
                  <tab.icon size={18} className="md:w-5 md:h-5" />
                  <span className="text-[10px] md:text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content area - scrollable when height shrunken by software keyboard.
                Hidden while the mobile sheet is collapsed so the publish footer below
                stays on-screen (desktop always shows it). */}
            <div className={cn(
              "p-3 md:p-6 overflow-y-auto scrollbar-thin flex-1 min-h-0",
              "lg:max-h-[calc(100vh-300px)]",
              !isSheetExpanded && "hidden lg:block"
            )}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'text' && <TextPanel />}
                  {activeTab === 'emoji' && <EmojiPanel />}
                  {activeTab === 'sticker' && <StickerPanel />}
                  {activeTab === 'location' && <LocationPanel />}
                  {activeTab === 'tags' && <TagsPanel />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Publish Button Footer - bottom padding clears the iOS home indicator */}
            <div className="border-t p-3 md:p-4 flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-4">
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2 text-sm md:text-base py-3"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                <Sparkles className="h-5 w-5" />
                <span>{isPublishing ? 'מפרסם...' : 'פרסם גיחוך'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {publishedMeme && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}

          imageUrl={publishedMeme.imageUrl}
          memeId={publishedMeme.memeId}
        />
      )}

      {/* Navigation Confirmation Dialog */}
      <Modal isOpen={showNavigationDialog} onClose={handleCancelNavigation} title="רגע, יש לך גיחוך בעבודה!">
        <div className="space-y-4">
          <p className="text-gray-700">מה תרצה לעשות עם הגיחוך שלך?</p>
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={handlePublishAndNavigate}
              disabled={isPublishing}
              className="w-full"
            >
              {isPublishing ? 'מפרסם...' : 'פרסם גיחוך'}
            </Button>
            <Button
              variant="danger"
              onClick={handleDiscardAndNavigate}
              className="w-full"
            >
              מחק והמשך
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelNavigation}
              className="w-full"
            >
              בטל
            </Button>
          </div>
        </div>
      </Modal>

      {/* Template Switch Confirmation Dialog */}
      <Modal isOpen={showTemplateSwitchModal} onClose={() => setShowTemplateSwitchModal(false)} title="החלפת תבנית">
        <div className="space-y-4">
          <p className="text-gray-700">מה תרצה לעשות עם העריכות הנוכחיות?</p>
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={handleSaveAndSwitchTemplate}
              className="w-full"
            >
              שמור והחלף תבנית
            </Button>
            <Button
              variant="danger"
              onClick={handleDiscardAndSwitchTemplate}
              className="w-full"
            >
              התחל מחדש (מחק הכל)
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTemplateSwitchModal(false)}
              className="w-full"
            >
              ביטול
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Upload Confirmation Dialog */}
      <Modal isOpen={showImageUploadModal} onClose={() => setShowImageUploadModal(false)} title="החלפת תמונה">
        <div className="space-y-4">
          <p className="text-gray-700">מה תרצה לעשות עם העריכות הנוכחיות?</p>
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={handleSaveAndUploadImage}
              className="w-full"
            >
              שמור והעלה תמונה חדשה
            </Button>
            <Button
              variant="danger"
              onClick={handleDiscardAndUploadImage}
              className="w-full"
            >
              התחל מחדש (מחק הכל)
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImageUploadModal(false)}
              className="w-full"
            >
              ביטול
            </Button>
          </div>
        </div>
      </Modal>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={() => setShowConsentModal(false)}
      />
    </Layout>
  )
}

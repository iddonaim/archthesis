import { useState } from 'react'
import toast from 'react-hot-toast'
import { FirebaseError } from 'firebase/app'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase'
import { validateMemePublish } from '@/lib/publishValidation'
import { useEditorStore } from '@/stores/useEditorStore'
import { useSceneStore } from '@/stores/useSceneStore'
import type { TextElement } from '@/types/scene'
import type Konva from 'konva'

interface PublishResult {
  success: boolean
  memeId?: string
  imageUrl?: string
  error?: string
}

export function usePublishMeme() {
  const [isPublishing, setIsPublishing] = useState(false)
  const {
    selectedTags,
    selectedLocation,
    username,
    description
  } = useEditorStore()
  const { scene, clearSelection } = useSceneStore()

  const publishMeme = async (
    stageRef: React.RefObject<Konva.Stage>
  ): Promise<PublishResult> => {
    setIsPublishing(true)

    // Show loading toast
    const toastId = toast.loading('מפרסם גיחוך...')

    try {
      // 0. Validate against the firestore.rules limits BEFORE exporting or
      // uploading anything — otherwise the server rejects the Firestore write
      // with a cryptic English permissions error after the image upload.
      const combinedText = scene.elements
        .filter((el): el is TextElement => el.type === 'text')
        .filter(tb => !tb.isPlaceholder && tb.text && tb.text.trim())
        .map(tb => tb.text.trim())
        .join(' ')

      const validationError = validateMemePublish({
        memeText: combinedText,
        description: description || '',
        username: username || '',
        tags: selectedTags
      })
      if (validationError) {
        setIsPublishing(false)
        toast.error(validationError, { id: toastId })
        return { success: false, error: validationError }
      }

      // 1. Deselect all elements to avoid rendering selection boxes
      clearSelection()

      // Wait for React to re-render without selections
      await new Promise(resolve => setTimeout(resolve, 100))

      // 2. Hide placeholder text boxes by setting them invisible during export
      // (Placeholders are marked as isPlaceholder: true when not edited by user)

      // Get the stage to manipulate Konva nodes directly
      const stage = stageRef.current
      if (!stage) {
        throw new Error('Canvas not found')
      }

      // Look up Konva nodes by the text-box id (set on the Text via id={textBox.id}
      // in CanvasEditor). Matching by id rather than by text content prevents two
      // boxes with identical text from both being hidden during export.
      const placeholderIds = new Set(
        scene.elements
          .filter((el): el is TextElement => el.type === 'text' && el.isPlaceholder)
          .map(el => el.id)
      )

      const setPlaceholderVisibility = (visible: boolean) => {
        if (placeholderIds.size === 0) return
        stage.find('Text').forEach((node) => {
          if (placeholderIds.has(node.id())) {
            node.visible(visible)
          }
        })
        stage.batchDraw()
      }

      let dataUrl: string

      try {
        setPlaceholderVisibility(false)

        // Wait a bit for the layer to re-render
        await new Promise(resolve => setTimeout(resolve, 50))

        // 3. Export canvas as image
        dataUrl = stage.toDataURL({
          mimeType: 'image/jpeg',
          quality: 0.9,
          pixelRatio: 2 // Higher quality
        })
      } finally {
        // Always restore visibility of placeholder text nodes
        setPlaceholderVisibility(true)
      }

      // Convert data URL to Blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      // 4. Generate unique ID for the meme
      const memeId = `meme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // 5. Upload to Firebase Storage
      const storageRef = ref(storage, `memes/${memeId}.jpg`)
      await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedAt: new Date().toISOString()
        }
      })

      // 6. Get download URL
      const imageUrl = await getDownloadURL(storageRef)

      // 7. Save metadata to Firestore (combinedText computed in step 0)
      const memeData = {
        imageUrl,
        memeText: combinedText || '', // Searchable text content from all text boxes
        description: description || '',
        tags: selectedTags,
        location: selectedLocation ? {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          display_name: selectedLocation.display_name,
          showInGallery: selectedLocation.showInGallery || false,
          hideFromGallery: selectedLocation.hideFromGallery || false
        } : null,
        username: username || '',
        likes: 0,
        hidden: false,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        originSource: localStorage.getItem('user_origin') || 'link' // QR code origin tracking
      }

      const docRef = await addDoc(collection(db, 'memes'), memeData)

      setIsPublishing(false)

      // Show success toast
      toast.success('הגיחוך פורסם בהצלחה! 🎉', { id: toastId })

      return {
        success: true,
        memeId: docRef.id,
        imageUrl
      }
    } catch (error) {
      console.error('Error publishing meme:', error)
      setIsPublishing(false)

      // Show error toast — translate known Firebase denials into actionable
      // Hebrew instead of surfacing the raw English SDK message.
      let errorMessage = error instanceof Error ? error.message : 'שגיאה בפרסום הגיחוך'
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
          errorMessage = 'הפרסום נדחה על ידי השרת — ייתכן שהתוכן חורג מהמגבלות (למשל טקסט ארוך מדי). נסו לקצר ולפרסם שוב.'
        } else if (error.code === 'unavailable' || error.code === 'storage/retry-limit-exceeded') {
          errorMessage = 'בעיית תקשורת עם השרת — בדקו את החיבור לאינטרנט ונסו שוב.'
        }
      }
      toast.error(errorMessage, { id: toastId })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  return {
    publishMeme,
    isPublishing
  }
}

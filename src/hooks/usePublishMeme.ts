import { useState } from 'react'
import toast from 'react-hot-toast'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase'
import { useEditorStore } from '@/stores/useEditorStore'
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
    description,
    textBoxes,
    selectTextBox,
    selectSticker,
    selectLocation: setLocationSelected,
    resetEditor
  } = useEditorStore()

  const publishMeme = async (
    stageRef: React.RefObject<Konva.Stage>
  ): Promise<PublishResult> => {
    setIsPublishing(true)

    // Show loading toast
    const toastId = toast.loading('מפרסם גיחוך...')

    try {
      // 1. Deselect all elements to avoid rendering selection boxes
      selectTextBox(null)
      selectSticker(null)
      setLocationSelected(false)

      // Wait for React to re-render without selections
      await new Promise(resolve => setTimeout(resolve, 100))

      // 2. Hide placeholder text boxes by setting them invisible during export
      // (Placeholders are marked as isPlaceholder: true when not edited by user)

      // Get the stage to manipulate Konva nodes directly
      const stage = stageRef.current
      if (!stage) {
        throw new Error('Canvas not found')
      }

      // Collect text content of all placeholder text boxes
      const placeholderTexts = textBoxes
        .filter(tb => tb.isPlaceholder)
        .map(tb => tb.text.trim())

      // Hide placeholder text nodes in Konva (bypass React)
      const layer = stage.getLayers()[0]
      let dataUrl: string

      try {
        if (layer && placeholderTexts.length > 0) {
          layer.getChildren().forEach((node) => {
            if (node.getClassName() === 'Text') {
              const konvaText = node as Konva.Text
              const textContent = konvaText.text()
              // Hide if this text box is marked as a placeholder in state
              if (placeholderTexts.includes(textContent.trim())) {
                konvaText.visible(false)
              }
            }
          })
          layer.batchDraw()
        }

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
        if (layer && placeholderTexts.length > 0) {
          layer.getChildren().forEach((node) => {
            if (node.getClassName() === 'Text') {
              const konvaText = node as Konva.Text
              const textContent = konvaText.text()
              if (placeholderTexts.includes(textContent.trim())) {
                konvaText.visible(true)
              }
            }
          })
          layer.batchDraw()
        }
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

      // 7. Collect text content for search (exclude unedited placeholders)
      const memeText = textBoxes
        .filter(tb => !tb.isPlaceholder && tb.text && tb.text.trim())
        .map(tb => tb.text.trim())
        .join(' ')

      // 8. Save metadata to Firestore
      const memeData = {
        imageUrl,
        memeText: memeText || null, // Searchable text content from all text boxes
        description: description || null,
        tags: selectedTags,
        location: selectedLocation ? {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          display_name: selectedLocation.display_name,
          showInGallery: selectedLocation.showInGallery || false,
          hideFromGallery: selectedLocation.hideFromGallery || false
        } : null,
        username: username || null,
        likes: 0,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        originSource: localStorage.getItem('user_origin') || 'link' // QR code origin tracking
      }

      await addDoc(collection(db, 'memes'), memeData)

      setIsPublishing(false)

      // Show success toast
      toast.success('הגיחוך פורסם בהצלחה! 🎉', { id: toastId })

      return {
        success: true,
        memeId,
        imageUrl
      }
    } catch (error) {
      console.error('Error publishing meme:', error)
      setIsPublishing(false)

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בפרסום הגיחוך'
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

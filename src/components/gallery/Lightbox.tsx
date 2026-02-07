import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ChevronLeft, ChevronRight, Download, Heart, Share2 } from 'lucide-react'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { ref, getBlob } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useMemeStore } from '@/stores/useMemeStore'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import type { Meme } from '@/types/meme'
import toast from 'react-hot-toast'

interface LightboxProps {
  meme: Meme
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export default function Lightbox({
  meme,
  isOpen,
  onClose,
  onNext,
  onPrevious
}: LightboxProps) {
  const { likedMemes, toggleLike } = useMemeStore()
  const [isLiking, setIsLiking] = useState(false)
  const [localLikes, setLocalLikes] = useState(meme.likes)

  const isLiked = likedMemes.includes(meme.id)

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    const increment_value = isLiked ? -1 : 1

    setLocalLikes(prev => prev + increment_value)
    toggleLike(meme.id)

    try {
      const memeRef = doc(db, 'memes', meme.id)
      await updateDoc(memeRef, {
        likes: increment(increment_value)
      })
    } catch (error) {
      setLocalLikes(prev => prev - increment_value)
      toggleLike(meme.id)
      console.error('Error updating likes:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDownload = async () => {
    try {
      console.log('Lightbox download started for meme:', meme.id)
      console.log('Image URL:', meme.imageUrl)

      // Extract storage path from Firebase URL
      const urlObj = new URL(meme.imageUrl)
      console.log('URL object:', urlObj.pathname)

      // Match everything after /o/ in the pathname
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/)
      const storagePath = pathMatch ? decodeURIComponent(pathMatch[1]) : null
      console.log('Storage path:', storagePath)

      if (!storagePath) {
        throw new Error('Invalid image URL - could not extract storage path')
      }

      // Use Firebase SDK to download (avoids CORS issues)
      const storageRef = ref(storage, storagePath)
      console.log('Getting blob from storage...')
      const blob = await getBlob(storageRef)
      console.log('Blob received:', blob.size, 'bytes')

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meme-${meme.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('הגיחוך הורד בהצלחה!')
    } catch (error: any) {
      console.error('Lightbox download error details:', {
        error,
        message: error?.message,
        code: error?.code,
        memeId: meme.id,
        imageUrl: meme.imageUrl
      })
      toast.error(`שגיאה בהורדת גיחוך: ${error?.message || 'לא ידוע'}`)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?meme=${meme.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'גיחוך מגניב!',
          text: `${meme.topText} ${meme.bottomText}`,
          url: shareUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('הקישור הועתק ללוח!')
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && onNext) {
      onNext()
    } else if (e.key === 'ArrowRight' && onPrevious) {
      onPrevious()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div
            className="flex min-h-full items-center justify-center p-4"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-5xl">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-0 right-0 -mt-12 p-2 text-white hover:text-gray-300 transition-colors z-10"
                  aria-label="סגור"
                >
                  <X size={32} />
                </button>

                {/* Previous button */}
                {onPrevious && (
                  <button
                    onClick={onPrevious}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-16 p-3 text-white hover:text-gray-300 transition-colors bg-black/30 rounded-full hover:bg-black/50"
                    aria-label="הקודם"
                  >
                    <ChevronRight size={32} />
                  </button>
                )}

                {/* Next button */}
                {onNext && (
                  <button
                    onClick={onNext}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-16 p-3 text-white hover:text-gray-300 transition-colors bg-black/30 rounded-full hover:bg-black/50"
                    aria-label="הבא"
                  >
                    <ChevronLeft size={32} />
                  </button>
                )}

                {/* Image */}
                <div className="bg-black rounded-lg overflow-hidden">
                  <img
                    src={meme.imageUrl}
                    alt={`${meme.topText} ${meme.bottomText}`}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                </div>

                {/* Info panel */}
                <div className="mt-4 bg-white rounded-lg p-6 shadow-xl">
                  <div className="space-y-4">
                    {/* Tags */}
                    {meme.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {meme.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Location - handle both string (old) and object (new) formats */}
                    {meme.location && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <span>📍</span>
                        <span>
                          {typeof meme.location === 'string'
                            ? meme.location
                            : meme.location.display_name}
                        </span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <Button
                        variant={isLiked ? 'primary' : 'outline'}
                        onClick={handleLike}
                        isLoading={isLiking}
                        className="flex items-center gap-2"
                      >
                        <Heart
                          size={20}
                          className={isLiked ? 'fill-current' : ''}
                        />
                        <span className="font-semibold">{localLikes}</span>
                      </Button>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleDownload}
                          className="flex items-center gap-2"
                        >
                          <Download size={20} />
                          <span>הורד</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleShare}
                          className="flex items-center gap-2"
                        >
                          <Share2 size={20} />
                          <span>שתף</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

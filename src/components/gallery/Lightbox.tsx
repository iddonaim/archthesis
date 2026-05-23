import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ChevronLeft, ChevronRight, Download, Heart, Share2, User, Clock, MapPin, ExternalLink, Shuffle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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
        toast.success('הגיחוך שותף בהצלחה!')
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('שגיאה בשיתוף הגיחוך')
        }
        console.error('Error sharing:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('הקישור הועתק ללוח!')
      } catch (error) {
        toast.error('אין אפשרות לשתף במכשיר זה')
      }
    }
  }

  const handleRemix = () => {
    navigate('/create', { state: { remixMeme: meme } })
    onClose()
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

  // Defensive date formatting supporting Firestore Timestamp, Javascript Date, and createdAt fallback
  const formattedDate = (() => {
    let date: Date | null = null
    const ts = (meme.timestamp as any) || (meme as any).createdAt

    if (ts) {
      if (typeof ts.toDate === 'function') {
        date = ts.toDate()
      } else if (ts instanceof Date) {
        date = ts
      } else {
        date = new Date(ts)
      }
    }

    if (date && !isNaN(date.getTime())) {
      try {
        return new Intl.DateTimeFormat('he-IL', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }).format(date)
      } catch (e) {
        console.error('Error formatting date:', e)
        return date.toLocaleDateString('he-IL')
      }
    }
    return null
  })()

  // Dynamic OpenStreetMap geocoded map integration details
  const hasCoordinates =
    meme.location &&
    typeof meme.location === 'object' &&
    typeof meme.location.latitude === 'number' &&
    typeof meme.location.longitude === 'number' &&
    meme.location.latitude !== 0 &&
    meme.location.longitude !== 0

  const mapIframeUrl = hasCoordinates
    ? (() => {
        const loc = meme.location as { latitude: number; longitude: number }
        const lat = loc.latitude
        const lon = loc.longitude
        const delta = 0.002
        const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
      })()
    : ''

  const externalMapUrl = hasCoordinates
    ? (() => {
        const loc = meme.location as { latitude: number; longitude: number }
        return `https://www.openstreetmap.org/?mlat=${loc.latitude}&mlon=${loc.longitude}#map=17/${loc.latitude}/${loc.longitude}`
      })()
    : ''

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 animate-fade-in" onClose={onClose}>
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
            className="flex min-h-full items-center justify-center p-4 focus:outline-none"
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

                {/* Main responsive grid layout */}
                <div className="bg-white rounded-lg overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-3 text-right">
                  {/* Left Section: Centered Image */}
                  <div className="md:col-span-2 bg-black flex items-center justify-center p-4 min-h-[50vh] md:min-h-[70vh]">
                    <img
                      src={meme.imageUrl}
                      alt={`${meme.topText} ${meme.bottomText}`}
                      className="w-full h-auto max-h-[75vh] object-contain"
                    />
                  </div>

                  {/* Right Section: Details Scrollpane */}
                  <div className="p-6 flex flex-col justify-between border-t md:border-t-0 md:border-r border-gray-100 md:max-h-[80vh] md:max-h-[85vh] overflow-y-auto">
                    <div className="space-y-6">
                      {/* Creator Username and Creation Date */}
                      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                          <User size={16} className="text-gray-400" />
                          <span>יוצר/ת:</span>
                          <span className="text-gray-900 font-bold">{meme.username || 'אנונימי/ת'}</span>
                        </div>
                        {formattedDate && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Clock size={14} className="text-gray-400" />
                            <span>נוצר ב:</span>
                            <span>{formattedDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Meme Description Paragraph */}
                      {meme.description && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">תיאור</h4>
                          <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {meme.description}
                          </p>
                        </div>
                      )}

                      {/* Associated Tags badges */}
                      {meme.tags && meme.tags.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">תגיות</h4>
                          <div className="flex flex-wrap gap-2">
                            {meme.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tagged Location and OpenStreetMap iframe Preview */}
                      {meme.location && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">מיקום</h4>
                          <div className="flex items-start gap-2 text-gray-700 text-sm">
                            <MapPin size={16} className="text-primary mt-0.5" />
                            <span>
                              {typeof meme.location === 'string'
                                ? meme.location
                                : meme.location.display_name}
                            </span>
                          </div>

                          {hasCoordinates && (
                            <div className="space-y-2 pt-1">
                              <div className="border border-gray-200 rounded-lg overflow-hidden h-48 bg-gray-50 relative shadow-sm">
                                <iframe
                                  title="מפת מיקום"
                                  width="100%"
                                  height="100%"
                                  src={mapIframeUrl}
                                  style={{ border: 'none' }}
                                  allowFullScreen
                                />
                              </div>
                              <a
                                href={externalMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 justify-end font-semibold transition-colors"
                              >
                                <span>לא רואה את המפה? פתח ב-OpenStreetMap</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Likes and Social Action Buttons Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-2">
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

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            onClick={handleRemix}
                            title="רמיקס"
                            className="flex items-center justify-center p-2"
                          >
                            <Shuffle size={20} />
                            <span className="hidden sm:inline mr-1 text-sm">רמיקס</span>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={handleDownload}
                            title="הורד"
                            className="flex items-center justify-center p-2"
                          >
                            <Download size={20} />
                            <span className="hidden sm:inline mr-1 text-sm">הורד</span>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={handleShare}
                            title="שתף"
                            className="flex items-center justify-center p-2"
                          >
                            <Share2 size={20} />
                            <span className="hidden sm:inline mr-1 text-sm">שתף</span>
                          </Button>
                        </div>
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


import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import MemeCard from './MemeCard'
import MemeCardSkeleton from './MemeCardSkeleton'
import Lightbox from './Lightbox'
import type { Meme } from '@/types/meme'

const PAGE_SIZE = 20

interface MemeGridProps {
  memes: Meme[]
  isLoading?: boolean
  initialMemeId?: string | null
  selectedTags?: string[]
  searchQuery?: string
  sortBy?: string
}

export default function MemeGrid({
  memes,
  isLoading = false,
  initialMemeId,
  selectedTags,
  searchQuery,
  sortBy
}: MemeGridProps) {
  const [lightboxMeme, setLightboxMeme] = useState<Meme | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Reset visible count only when the active filter or sort order changes
  const serializedTags = selectedTags ? selectedTags.join(',') : ''
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [serializedTags, searchQuery, sortBy])

  // Auto-open lightbox if initialMemeId is provided (from shared link)
  useEffect(() => {
    if (initialMemeId && memes.length > 0 && !hasAutoOpened) {
      const meme = memes.find(m => m.id === initialMemeId)
      if (meme) {
        const index = memes.findIndex(m => m.id === initialMemeId)
        setLightboxMeme(meme)
        setLightboxIndex(index)
        setHasAutoOpened(true)
      }
    }
  }, [initialMemeId, memes, hasAutoOpened])

  const openLightbox = (meme: Meme) => {
    const index = memes.findIndex((m) => m.id === meme.id)
    setLightboxMeme(meme)
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxMeme(null)
  }

  const showNext = () => {
    if (lightboxIndex < memes.length - 1) {
      const nextIndex = lightboxIndex + 1
      setLightboxIndex(nextIndex)
      setLightboxMeme(memes[nextIndex])
    }
  }

  const showPrevious = () => {
    if (lightboxIndex > 0) {
      const prevIndex = lightboxIndex - 1
      setLightboxIndex(prevIndex)
      setLightboxMeme(memes[prevIndex])
    }
  }

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, memes.length))
  }, [memes.length])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <MemeCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (memes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🤷‍♂️</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          לא נמצאו גיחוכים
        </h3>
        <p className="text-gray-500">
          נסו להסיר כמה מהפילטרים או צרו גיחוך חדש!
        </p>
      </div>
    )
  }

  const visibleMemes = memes.slice(0, visibleCount)
  const hasMore = visibleCount < memes.length

  return (
    <>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {visibleMemes.map((meme) => (
          <MemeCard
            key={meme.id}
            meme={meme}
            onImageClick={() => openLightbox(meme)}
          />
        ))}
      </motion.div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            טען עוד ({memes.length - visibleCount} נותרו)
          </button>
        </div>
      )}

      {lightboxMeme && (
        <Lightbox
          meme={lightboxMeme}
          isOpen={!!lightboxMeme}
          onClose={closeLightbox}
          onNext={lightboxIndex < memes.length - 1 ? showNext : undefined}
          onPrevious={lightboxIndex > 0 ? showPrevious : undefined}
        />
      )}
    </>
  )
}

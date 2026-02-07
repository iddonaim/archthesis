import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/firebase'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import type { Meme } from '@/types/meme'

export default function FeaturedCarousel() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedMemes = async () => {
      try {
        const q = query(
          collection(db, 'memes'),
          orderBy('timestamp', 'desc'),
          limit(6)
        )

        const snapshot = await getDocs(q)
        const memesData: Meme[] = snapshot.docs.map((doc) => {
          const data = doc.data()

          // Handle timestamp - it might be a Firestore Timestamp or already a Date
          let timestamp: Date
          if (data.timestamp?.toDate) {
            timestamp = data.timestamp.toDate()
          } else if (data.timestamp instanceof Date) {
            timestamp = data.timestamp
          } else {
            timestamp = new Date()
          }

          return {
            id: doc.id,
            imageUrl: data.imageUrl,
            topText: data.topText || '',
            bottomText: data.bottomText || '',
            tags: data.tags || [],
            location: data.location,
            likes: data.likes || 0,
            timestamp,
            userId: data.userId
          }
        })

        setMemes(memesData)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching featured memes:', err)
        setError('שגיאה בטעינת הגיחוכים המובילים')
        setIsLoading(false)
      }
    }

    fetchFeaturedMemes()
  }, [])

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (memes.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memes.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [memes.length])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % memes.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + memes.length) % memes.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-xl mb-4" />
          <div className="flex justify-center gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || memes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-500 mb-4">
          {error || 'אין גיחוכים להצגה כרגע'}
        </p>
        <Link to="/create">
          <Button variant="primary">צור את הגיחוך הראשון!</Button>
        </Link>
      </div>
    )
  }

  const currentMeme = memes[currentIndex]

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Carousel Container */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={currentMeme.imageUrl}
              alt={`${currentMeme.topText} ${currentMeme.bottomText}`}
              className="w-full h-full object-contain"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="הקודם"
          >
            <ChevronRight size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="הבא"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Slide Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {memes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`עבור לגיחוך ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Meme Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              {/* Tags */}
              {currentMeme.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {currentMeme.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {currentMeme.tags.length > 3 && (
                    <Badge variant="secondary" size="sm">
                      +{currentMeme.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Location */}
              {currentMeme.location && (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate">
                    {typeof currentMeme.location === 'string'
                      ? currentMeme.location
                      : currentMeme.location.display_name}
                  </span>
                </p>
              )}
            </div>

            {/* Likes */}
            <div className="flex items-center gap-2 text-primary">
              <span className="text-2xl">❤️</span>
              <span className="text-lg font-bold">{currentMeme.likes}</span>
            </div>
          </div>

          {/* View Gallery Link */}
          <Link to="/gallery">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <span>צפה בכל הגיחוכים</span>
              <ExternalLink size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

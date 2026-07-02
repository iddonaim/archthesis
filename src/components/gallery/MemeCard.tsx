import { useState } from 'react'
import { Heart, Download, Share2, Shuffle, MapPin, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { ref, getBlob } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useMemeStore } from '@/stores/useMemeStore'
import Card, { CardContent, CardFooter } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import type { Meme } from '@/types/meme'

interface MemeCardProps {
  meme: Meme
  onImageClick?: () => void
}

export default function MemeCard({ meme, onImageClick }: MemeCardProps) {
  const { t } = useTranslation('gallery')
  const navigate = useNavigate()
  const { likedMemes, toggleLike } = useMemeStore()
  const [isLiking, setIsLiking] = useState(false)
  const [localLikes, setLocalLikes] = useState(meme.likes)

  const isLiked = likedMemes.includes(meme.id)

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLiking) return

    setIsLiking(true)
    const increment_value = isLiked ? -1 : 1

    // Optimistic update
    setLocalLikes(prev => prev + increment_value)
    toggleLike(meme.id)

    try {
      // Update in Firestore
      const memeRef = doc(db, 'memes', meme.id)
      await updateDoc(memeRef, {
        likes: increment(increment_value)
      })
    } catch (error: any) {
      // Rollback optimistic update
      setLocalLikes(prev => prev - increment_value)
      toggleLike(meme.id)

      // Enhanced error handling with specific error codes
      let errorMessage = t('like.error')
      if (error.code === 'permission-denied') {
        errorMessage = t('like.errorPermission')
      } else if (error.code === 'not-found') {
        errorMessage = t('like.errorNotFound')
      } else if (error.code === 'unavailable') {
        errorMessage = t('like.errorNetwork')
      }

      toast.error(errorMessage)
      console.error('Like error:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      console.log('Download started for meme:', meme.id)
      console.log('Image URL:', meme.imageUrl)

      // Extract storage path from URL
      const urlObj = new URL(meme.imageUrl)
      console.log('URL object:', urlObj.pathname)

      // Match everything after /o/ in the pathname
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)$/)
      const storagePath = pathMatch ? decodeURIComponent(pathMatch[1]) : null
      console.log('Storage path:', storagePath)

      if (!storagePath) {
        throw new Error('Invalid image URL - could not extract storage path')
      }

      // Use Firebase SDK (bypasses CORS)
      const storageRef = ref(storage, storagePath)
      console.log('Getting blob from storage...')
      const blob = await getBlob(storageRef)
      console.log('Blob received:', blob.size, 'bytes')

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meme-${meme.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(t('toast.downloadSuccess'))
    } catch (error: any) {
      console.error('Download error details:', {
        error,
        message: error?.message,
        code: error?.code,
        memeId: meme.id,
        imageUrl: meme.imageUrl
      })
      toast.error(t('toast.downloadError', { error: error?.message || t('toast.unknownError') }))
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/gallery?meme=${meme.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share.title'),
          text: `${meme.topText} ${meme.bottomText}`,
          url: shareUrl
        })
        toast.success(t('toast.shareSuccess'))
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error(t('toast.shareError'))
        }
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(shareUrl)
      toast.success(t('toast.linkCopied'))
    }
  }

  const handleRemix = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate('/create', { state: { remixMeme: meme } })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card hover>
        <CardContent>
        <div
          className="relative cursor-pointer group"
          onClick={onImageClick}
        >
          <img
            src={meme.imageUrl}
            alt={`${meme.topText} ${meme.bottomText}`}
            className="w-full h-auto object-cover"
            loading="lazy"
            decoding="async"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full space-y-3">
          {/* Tags */}
          {meme.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {meme.tags.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {meme.description && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {meme.description}
            </p>
          )}

          {/* Location - handle both string (old) and object (new) formats */}
          {meme.location && (() => {
            // Old format: location is a string
            if (typeof meme.location === 'string') {
              return (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-500" />
                  <span>{meme.location}</span>
                </p>
              )
            }
            // New format: location is an object
            if (meme.location.display_name && !meme.location.hideFromGallery) {
              return (
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-500" />
                  <span>{meme.location.display_name.split(',').slice(0, 2).map(p => p.trim()).join(', ')}</span>
                </p>
              )
            }
            return null
          })()}

          {/* Username */}
          {meme.username && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <User size={14} className="text-gray-400" />
              <span>{meme.username}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant={isLiked ? 'primary' : 'outline'}
              size="sm"
              onClick={handleLike}
              isLoading={isLiking}
              className="flex items-center gap-1.5"
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-current' : ''}
              />
              <span>{localLikes}</span>
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemix}
                title={t('card.remix')}
                className="flex items-center justify-center"
              >
                <Shuffle size={18} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title={t('card.download')}
                className="flex items-center justify-center"
              >
                <Download size={18} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                title={t('card.share')}
                className="flex items-center justify-center"
              >
                <Share2 size={18} />
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
    </motion.div>
  )
}

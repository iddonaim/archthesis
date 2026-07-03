import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import Button from './Button'
import { Share2, Download, Image as ImageIcon, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  memeId: string
}

export default function SuccessModal({ isOpen, onClose, imageUrl, memeId }: SuccessModalProps) {
  const { t } = useTranslation('modals')
  const navigate = useNavigate()

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/gallery?meme=${memeId}`
    const shareData = {
      title: t('success.shareTitle'),
      text: t('success.shareText'),
      url: shareUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success(t('success.shareSuccess'))
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error(t('success.shareError'))
        }
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success(t('success.linkCopied'))
      } catch (error) {
        toast.error(t('success.shareUnavailable'))
      }
    }
  }

  const handleDownload = () => {
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `meme-${memeId}.jpg`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGoToGallery = () => {
    onClose()
    navigate('/gallery')
  }

  const handleCreateMore = () => {
    onClose()
    // CreatePage will handle resetEditor when mounted
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('success.title')}>
      <div className="space-y-6">
        {/* Success Message */}
        <p className="text-lg text-gray-700">
          {t('success.message')}
        </p>

        {/* Preview Image */}
        <div className="rounded-lg overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt="Published meme"
            className="w-full h-auto"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            onClick={handleShare}
            className="flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            <span>{t('success.share')}</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2"
          >
            <Download size={18} />
            <span>{t('success.download')}</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleGoToGallery}
            className="flex items-center justify-center gap-2"
          >
            <ImageIcon size={18} />
            <span>{t('success.toGallery')}</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleCreateMore}
            className="flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>{t('success.createMore')}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

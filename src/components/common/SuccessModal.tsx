import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import Button from './Button'
import { Share2, Download, Image as ImageIcon, Plus } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  memeId: string
}

export default function SuccessModal({ isOpen, onClose, imageUrl, memeId }: SuccessModalProps) {
  const navigate = useNavigate()

  const handleShare = async () => {
    const shareData = {
      title: 'הגיחוך שלי',
      text: 'צפו בגיחוך שיצרתי!',
      url: window.location.origin + '/gallery'
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + '/gallery')
        alert('הקישור הועתק ללוח!')
      } catch (error) {
        alert('אין אפשרות לשתף במכשיר זה')
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
    <Modal isOpen={isOpen} onClose={onClose} title="🎉 הגיחוך פורסם בהצלחה!">
      <div className="space-y-6">
        {/* Success Message */}
        <p className="text-lg text-gray-700">
          הממ שלך נוסף לגלריה
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
            <span>שתף</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2"
          >
            <Download size={18} />
            <span>הורד</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleGoToGallery}
            className="flex items-center justify-center gap-2"
          >
            <ImageIcon size={18} />
            <span>לגלריה</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleCreateMore}
            className="flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>צור עוד</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

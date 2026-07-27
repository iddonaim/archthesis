import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Trash2, MapPin, Tag, Calendar, ExternalLink, EyeOff, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { useTagLabel } from '@/hooks/useTagLabel'
import { dateLocale } from '@/lib/utils'

interface Meme {
  id: string
  imageUrl: string
  tags?: string[]
  location?: {
    display_name: string
  }
  createdAt: any
  hidden?: boolean
  [key: string]: any
}

export default function MemeManagementTable() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [memeToDelete, setMemeToDelete] = useState<Meme | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { t, i18n } = useTranslation('admin')
  const tagLabel = useTagLabel()

  useEffect(() => {
    const q = query(collection(db, 'memes'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meme[]
      setMemes(memesData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching memes:', error)
      toast.error(t('memes.loadError'))
      setLoading(false)
    })

    // `t` is only read by the error toast, but react-i18next hands back a new
    // function on a language change, so it belongs in the deps. The cost is a
    // single re-subscribe when the admin toggles language.
    return unsubscribe
  }, [t])

  const handleDeleteClick = (meme: Meme) => {
    setMemeToDelete(meme)
    setDeleteModalOpen(true)
  }

  const handleToggleHidden = async (meme: Meme) => {
    const newHiddenState = !meme.hidden

    try {
      await updateDoc(doc(db, 'memes', meme.id), {
        hidden: newHiddenState
      })

      toast.success(
        newHiddenState
          ? t('memes.hideSuccess')
          : t('memes.showSuccess')
      )
    } catch (error) {
      console.error('Error toggling hidden status:', error)
      toast.error(t('memes.statusError'))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!memeToDelete) return

    setDeleting(true)
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'memes', memeToDelete.id))

      // Try to delete from Storage (extract filename from URL)
      try {
        const imageUrl = memeToDelete.imageUrl
        if (imageUrl && imageUrl.includes('firebase')) {
          // Extract path from Firebase Storage URL
          const urlParts = imageUrl.split('/o/')
          if (urlParts[1]) {
            const pathWithParams = urlParts[1].split('?')[0]
            const storagePath = decodeURIComponent(pathWithParams)
            const imageRef = ref(storage, storagePath)
            await deleteObject(imageRef)
          }
        }
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError)
        // Continue even if storage deletion fails
      }

      toast.success(t('memes.deleteSuccess'))
      setDeleteModalOpen(false)
      setMemeToDelete(null)
    } catch (error) {
      console.error('Error deleting meme:', error)
      toast.error(t('memes.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return t('memes.unknownDate')
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat(dateLocale(i18n.language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">{t('memes.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('memes.title', { count: memes.length })}</h2>
      </div>

      {memes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">{t('memes.empty')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('memes.columns.image')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('memes.columns.status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('memes.columns.tags')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('memes.columns.location')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('memes.columns.createdAt')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('memes.columns.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memes.map((meme) => (
                <tr key={meme.id} className={meme.hidden ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={meme.imageUrl}
                        alt="Meme"
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {meme.hidden ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <EyeOff className="w-3 h-3" />
                        {t('memes.status.hidden')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <Eye className="w-3 h-3" />
                        {t('memes.status.visible')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {meme.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs"
                        >
                          <Tag className="w-3 h-3" />
                          {tagLabel(tag)}
                        </span>
                      )) || <span className="text-gray-400 text-sm">{t('memes.noTags')}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {meme.location ? (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="max-w-xs truncate">{meme.location.display_name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">{t('memes.noLocation')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(meme.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-start text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleHidden(meme)}
                        className={meme.hidden ? "text-green-600 hover:text-green-900" : "text-orange-600 hover:text-orange-900"}
                        title={meme.hidden ? t('memes.actions.show') : t('memes.actions.hide')}
                      >
                        {meme.hidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <a
                        href={meme.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                        title={t('memes.actions.openImage')}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => handleDeleteClick(meme)}
                        className="text-red-600 hover:text-red-900"
                        title={t('memes.actions.delete')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title={t('memes.deleteModal.title')}
      >
        <div className="space-y-4">
          {memeToDelete && (
            <div className="flex justify-center">
              <img
                src={memeToDelete.imageUrl}
                alt="Meme to delete"
                className="max-w-xs rounded-lg"
              />
            </div>
          )}
          <p className="text-gray-600 text-center">
            {t('memes.deleteModal.message')}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? t('memes.deleteModal.deleting') : t('memes.deleteModal.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

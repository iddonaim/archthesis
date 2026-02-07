import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Trash2, MapPin, Tag, Calendar, ExternalLink, EyeOff, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'

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
      toast.error('שגיאה בטעינת גיחוכים')
      setLoading(false)
    })

    return unsubscribe
  }, [])

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
          ? 'הגיחוך הוסתר מהגלריה (נשמר במסד הנתונים)'
          : 'הגיחוך חזר להיות גלוי בגלריה'
      )
    } catch (error) {
      console.error('Error toggling hidden status:', error)
      toast.error('שגיאה בעדכון הסטטוס')
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

      toast.success('הגיחוך נמחק בהצלחה')
      setDeleteModalOpen(false)
      setMemeToDelete(null)
    } catch (error) {
      console.error('Error deleting meme:', error)
      toast.error('שגיאה במחיקת הגיחוך')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'לא ידוע'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('he-IL', {
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
        <p className="mt-4 text-gray-600">טוען גיחוכים...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ניהול גיחוכים ({memes.length})</h2>
      </div>

      {memes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">אין גיחוכים עדיין</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תמונה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תגיות
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מיקום
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך יצירה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
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
                        מוסתר
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <Eye className="w-3 h-3" />
                        גלוי
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
                          {tag}
                        </span>
                      )) || <span className="text-gray-400 text-sm">אין תגיות</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {meme.location ? (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="max-w-xs truncate">{meme.location.display_name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">אין מיקום</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(meme.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleHidden(meme)}
                        className={meme.hidden ? "text-green-600 hover:text-green-900" : "text-orange-600 hover:text-orange-900"}
                        title={meme.hidden ? "הצג בגלריה" : "הסתר מהגלריה"}
                      >
                        {meme.hidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <a
                        href={meme.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                        title="פתח תמונה"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => handleDeleteClick(meme)}
                        className="text-red-600 hover:text-red-900"
                        title="מחק לצמיתות"
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
        title="מחיקת גיחוך"
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
            האם אתה בטוח שברצונך למחוק את הגיחוך? פעולה זו לא ניתנת לביטול.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              ביטול
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'מוחק...' : 'מחק'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

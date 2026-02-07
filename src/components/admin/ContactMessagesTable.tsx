import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import { Trash2, CheckCircle, Mail, Calendar, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  source: string
  timestamp: any
  createdAt: string
  status: 'unread' | 'read'
}

export default function ContactMessagesTable() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'contact_messages'),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ContactMessage[]

        setMessages(messagesData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching messages:', error)
        toast.error('שגיאה בטעינת הודעות')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק הודעה זו?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'contact_messages', id))
      toast.success('ההודעה נמחקה')
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('שגיאה במחיקת ההודעה')
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', id), {
        status: 'read'
      })
      toast.success('סומן כנקרא')
    } catch (error) {
      console.error('Error updating message:', error)
      toast.error('שגיאה בעדכון ההודעה')
    }
  }

  const getSourceLabel = (source: string) => {
    const sources: Record<string, string> = {
      privacy_page: 'דף פרטיות',
      homepage: 'דף הבית',
      footer: 'פוטר'
    }
    return sources[source] || source
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">טוען הודעות...</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">אין הודעות</h3>
            <p className="text-gray-500">
              טרם התקבלו הודעות מהמשתמשים
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סה"כ הודעות</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">לא נקראו</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">נקראו</p>
                <p className="text-2xl font-bold">{messages.length - unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <Card key={msg.id} className={msg.status === 'unread' ? 'border-r-4 border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">
                      {msg.name || 'אנונימי'}
                    </CardTitle>
                    {msg.status === 'unread' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                        חדש
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {msg.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${msg.email}`} className="hover:text-primary">
                          {msg.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getSourceLabel(msg.source)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {msg.timestamp
                        ? formatDistanceToNow(msg.timestamp.toDate(), {
                            addSuffix: true,
                            locale: he,
                          })
                        : msg.createdAt
                        ? new Date(msg.createdAt).toLocaleDateString('he-IL')
                        : 'לא ידוע'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {msg.status === 'unread' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(msg.id)}
                      title="סמן כנקרא"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(msg.id)}
                    className="text-red-600 hover:bg-red-50"
                    title="מחק"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

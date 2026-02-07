import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  source?: string
}

export default function ContactModal({ isOpen, onClose, source = 'unknown' }: ContactModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!message.trim()) {
      setError('נא למלא הודעה')
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: name.trim() || 'אנונימי',
        email: email.trim() || '',
        message: message.trim(),
        source,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        status: 'unread'
      })

      // Success
      alert('✅ ההודעה נשלחה בהצלחה! תודה שיצרת קשר.')

      // Reset form
      setName('')
      setEmail('')
      setMessage('')
      onClose()
    } catch (err) {
      console.error('Error sending message:', err)
      setError('שגיאה בשליחת ההודעה. נסה שוב.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📧 יצירת קשר" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="contactName" className="block text-right font-medium mb-2">
            שם (אופציונלי):
          </label>
          <Input
            id="contactName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="השאר ריק לאנונימיות"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-right font-medium mb-2">
            אימייל (אופציונלי):
          </label>
          <Input
            id="contactEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="אם תרצה תשובה"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="contactMessage" className="block text-right font-medium mb-2">
            הודעה: <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contactMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="שאלה, הצעה, או כל דבר אחר..."
            rows={5}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-right disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-right">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ שולח...' : '📤 שלח'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

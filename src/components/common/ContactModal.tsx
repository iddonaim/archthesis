import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('modals')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!message.trim()) {
      setError(t('contact.validationEmpty'))
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: name.trim() || t('contact.anonymous'),
        email: email.trim() || '',
        message: message.trim(),
        source,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        status: 'unread'
      })

      // Success
      alert(t('contact.success'))

      // Reset form
      setName('')
      setEmail('')
      setMessage('')
      onClose()
    } catch (err) {
      console.error('Error sending message:', err)
      setError(t('contact.errorSend'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('contact.title')} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="contactName" className="block text-start font-medium mb-2">
            {t('contact.nameLabel')}
          </label>
          <Input
            id="contactName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('contact.namePlaceholder')}
            maxLength={100}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-start font-medium mb-2">
            {t('contact.emailLabel')}
          </label>
          <Input
            id="contactEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('contact.emailPlaceholder')}
            maxLength={200}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="contactMessage" className="block text-start font-medium mb-2">
            {t('contact.messageLabel')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contactMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('contact.messagePlaceholder')}
            rows={5}
            required
            maxLength={5000}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-start disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-start">
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
            {t('contact.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('contact.sending') : t('contact.send')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

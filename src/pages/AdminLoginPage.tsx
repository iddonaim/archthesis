import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Lock, Mail, AlertCircle, Home } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('התחברת בהצלחה!')
      navigate('/admin')
    } catch (err: any) {
      console.error('Login error:', err)

      // Handle different error codes
      let errorMessage = 'שגיאה בהתחברות. נסה שוב.'

      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'אימייל או סיסמה שגויים'
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'משתמש לא נמצא'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'סיסמה שגויה'
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'יותר מדי ניסיונות. נסה שוב מאוחר יותר'
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'בעיית חיבור לאינטרנט'
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-4">
      <div className="w-full max-w-md">
        {/* Big Return Home Button */}
        <div className="mb-6 text-center">
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-lg px-6 py-3"
          >
            <Home className="w-6 h-6" />
            חזרה לדף הבית
          </Button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            כניסה לפאנל הניהול
          </h1>
          <p className="text-gray-600">
            מכונת הגיחוך וההגחה
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                אימייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pr-12"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-12"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              חזרה לדף הבית
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>דף זה מוגן ומיועד למנהלי המערכת בלבד</p>
        </div>
      </div>
    </div>
  )
}

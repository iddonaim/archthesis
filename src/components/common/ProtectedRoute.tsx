import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingState } from './Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return <LoadingState message="מאמת הרשאות..." />
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-red-600 mb-4">אין הרשאה</h1>
          <p className="text-gray-600 mb-8">
            אין לך הרשאות גישה לדף זה
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            חזרה לדף הבית
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

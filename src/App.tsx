import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/common/ErrorBoundary'
import { LoadingState } from './components/common/Spinner'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import UpdateNotification from './components/UpdateNotification'
import HomePage from './pages/HomePage'

// Lazy load pages for better performance
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const CreatePage = lazy(() => import('./pages/CreatePage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))

// Page transition wrapper component
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Suspense fallback={<LoadingState message="טוען דף..." />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ErrorBoundary>
      {/* Visible update notification with manual refresh button */}
      <UpdateNotification />

      <AuthProvider>
        <BrowserRouter>
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#2C3E50',
              fontFamily: 'Heebo, sans-serif',
              fontSize: '16px',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            success: {
              iconTheme: {
                primary: '#4ECDC4',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF6B6B',
                secondary: '#fff',
              },
            },
          }}
        />

        <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

// 404 Not Found component
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-9xl font-black text-gray-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          הדף לא נמצא
        </h2>
        <p className="text-gray-500 mb-8">
          הדף שחיפשתם אינו קיים או הועבר למיקום אחר
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

export default App

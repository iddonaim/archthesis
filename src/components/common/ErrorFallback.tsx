import { useTranslation } from 'react-i18next'
import Button from './Button'

interface ErrorFallbackProps {
  error: Error | null
  onReset: () => void
}

/**
 * The crash screen rendered by ErrorBoundary. It lives in its own file so it
 * can read translations with the usual hook — class components have no access
 * to `useTranslation`.
 */
export default function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t('errorBoundary.title')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('errorBoundary.message')}
        </p>

        {error && (
          <details className="mb-6 text-start">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              {t('errorBoundary.details')}
            </summary>
            <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto text-left max-h-40">
              {error.toString()}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            variant="primary"
            onClick={onReset}
          >
            {t('errorBoundary.reload')}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            {t('errorBoundary.home')}
          </Button>
        </div>
      </div>
    </div>
  )
}

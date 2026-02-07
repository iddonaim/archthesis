import { Component, type ReactNode } from 'react'
import Button from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              משהו השתבש
            </h1>
            <p className="text-gray-600 mb-6">
              אירעה שגיאה בלתי צפויה. אנחנו מתנצלים על אי הנוחות.
            </p>

            {this.state.error && (
              <details className="mb-6 text-right">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  פרטי שגיאה טכניים
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto text-left max-h-40">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                onClick={this.handleReset}
              >
                טען מחדש את הדף
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                חזור לדף הבית
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

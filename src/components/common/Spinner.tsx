import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-gray-200 border-t-primary',
          sizes[size],
          className
        )}
      />
    </div>
  )
}

export function LoadingOverlay({ message = 'טוען...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-lg font-semibold text-gray-900">{message}</p>
      </div>
    </div>
  )
}

export function LoadingState({ message = 'טוען נתונים...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  )
}

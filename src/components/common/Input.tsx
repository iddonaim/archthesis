import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200',
            'text-right placeholder:text-right',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 focus:border-primary',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 text-right">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 text-right">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

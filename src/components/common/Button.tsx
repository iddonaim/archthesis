import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    // Sticker-style buttons: ink outline + hard offset shadow that "presses in"
    const sticker = 'border-2 border-ink shadow-[3px_3px_0_#20242E] hover:shadow-[1px_1px_0_#20242E] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]'

    const variants = {
      primary: `bg-sunset text-white ${sticker}`,
      secondary: `bg-secondary-400 text-ink ${sticker}`,
      outline: `bg-white text-ink hover:bg-pastel-pink/40 ${sticker}`,
      ghost: 'text-ink-light hover:bg-ink/5',
      danger: `bg-[#FF5757] text-white ${sticker}`
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin me-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            טוען...
          </>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

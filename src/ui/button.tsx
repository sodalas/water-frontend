import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        {
          'bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-900':
            variant === 'primary' && !isDisabled,
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400':
            variant === 'secondary' && !isDisabled,
          'opacity-50 cursor-not-allowed': isDisabled,
        },
        className
      )}
    >
      {children}
    </button>
  )
}

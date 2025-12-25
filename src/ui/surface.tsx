import type { ReactNode, ElementType } from 'react'
import clsx from 'clsx'

interface SurfaceProps {
  as?: ElementType
  className?: string
  children: ReactNode
}

export function Surface({
  as: Component = 'div',
  className,
  children,
}: SurfaceProps) {
  return (
    <Component
      className={clsx(
        'rounded-lg border border-gray-200 bg-white p-6',
        className
      )}
    >
      {children}
    </Component>
  )
}

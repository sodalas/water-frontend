import type { ReactNode, ElementType } from 'react'
import clsx from 'clsx'

type Gap = 'sm' | 'md' | 'lg'
type Align = 'start' | 'center' | 'end'

interface InlineProps {
  as?: ElementType
  gap?: Gap
  align?: Align
  className?: string
  children: ReactNode
}

const gapClasses: Record<Gap, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

const alignClasses: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
}

export function Inline({
  as: Component = 'div',
  gap = 'md',
  align = 'center',
  className,
  children,
}: InlineProps) {
  return (
    <Component
      className={clsx(
        'flex',
        gapClasses[gap],
        alignClasses[align],
        className
      )}
    >
      {children}
    </Component>
  )
}

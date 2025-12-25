import type { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

type Gap = 'sm' | 'md' | 'lg'

type StackProps<T extends ElementType> = {
  as?: T
  gap?: Gap
  className?: string
  children: ReactNode
} & ComponentPropsWithoutRef<T>

const gapClasses: Record<Gap, string> = {
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
}

export function Stack<T extends ElementType = 'div'>({
  as,
  gap = 'md',
  className,
  children,
  ...props
}: StackProps<T>) {
  const Component = as || 'div'
  return (
    <Component className={clsx(gapClasses[gap], className)} {...props}>
      {children}
    </Component>
  )
}

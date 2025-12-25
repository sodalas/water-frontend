import type { FormHTMLAttributes } from 'react'
import { Stack } from './stack'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  gap?: 'sm' | 'md' | 'lg'
}

export function Form({
  gap = 'md',
  children,
  ...props
}: FormProps) {
  return (
    <Stack as="form" gap={gap} {...props}>
      {children}
    </Stack>
  )
}

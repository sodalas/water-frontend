import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-900"
      >
        {label}
      </label>

      <div>{children}</div>

      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import { Field } from '../ui/field'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import { Surface } from '../ui/surface'

export function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const queryClient = useQueryClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await authClient.signIn.magicLink({
      email,
      // Directive: Absolute URL required to ensure redirect returns to frontend origin
      callbackURL: `${window.location.origin}/app`
    })

    if (error) {
      setError(error.message ?? "Unknown error")
      return
    }

    // Invariant: authClient responses indicate request acceptance,
    // not that a magic link was generated or delivered.
    setSuccess(true)
    await queryClient.refetchQueries({ queryKey: ["session"] })
  }

  if (success) {
    return (
      <div className="mx-auto max-w-sm mt-20 text-center">
        <Surface>
            <h1 className="text-2xl font-bold mb-4">Check your email</h1>
            <p className="text-gray-300">
                We sent a login link to <strong>{email}</strong>.<br/>
                Click the link to sign in.
            </p>
        </Surface>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm mt-20">
      <Surface>
        <Form onSubmit={handleLogin}>
          <h1 className="text-2xl font-bold mb-2">Login</h1>
          
          <Field label="Email" htmlFor="email" error={error}>
            <input 
                id="email"
                name="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                placeholder="you@example.com"
            />
          </Field>

          <Button type="submit">Send login link</Button>
        </Form>
      </Surface>
    </div>
  )
}

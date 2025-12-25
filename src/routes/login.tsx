import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import { Field } from '../ui/field'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import { Surface } from '../ui/surface'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await authClient.signIn.email({
      email,
      password
    })

    if (error) {
      setError(error.message ?? "Unknown error")
      return
    }

    await queryClient.refetchQueries({ queryKey: ["session"] })
    await router.navigate({ to: "/app" })
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
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <input 
                id="password"
                type="password" 
                name="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
            />
          </Field>

          <Button type="submit">Sign In</Button>
        </Form>
      </Surface>
    </div>
  )
}

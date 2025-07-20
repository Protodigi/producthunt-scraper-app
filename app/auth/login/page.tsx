'use client'

import { Card, CardBody, CardHeader, Button, Input, Divider } from '@nextui-org/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Placeholder for Supabase Auth login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const data = await response.json()
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-small text-default-500">
            Sign in to access the admin dashboard
          </p>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              variant="bordered"
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              variant="bordered"
            />

            {error && (
              <p className="text-small text-danger">{error}</p>
            )}

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isLoading}
              isDisabled={!email || !password}
            >
              Sign In
            </Button>
          </form>

          <Divider className="my-4" />

          <div className="text-center">
            <p className="text-small text-default-500">
              Protected area. Admin access only.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
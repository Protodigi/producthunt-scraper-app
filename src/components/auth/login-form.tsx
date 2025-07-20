'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardHeader, CardBody, Divider } from '@nextui-org/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setError('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.refresh()
        router.push('/')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="text-sm text-default-500">
          {isSignUp 
            ? 'Sign up to start tracking ProductHunt launches' 
            : 'Welcome back! Please sign in to continue'}
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
            variant="bordered"
            isInvalid={!!error && !isSignUp}
            errorMessage={!isSignUp && error}
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
            variant="bordered"
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <EyeSlashIcon className="h-5 w-5 text-default-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-default-400" />
                )}
              </button>
            }
            type={isVisible ? 'text' : 'password'}
          />

          {error && isSignUp && (
            <p className={`text-sm ${error.includes('Check your email') ? 'text-success' : 'text-danger'}`}>
              {error}
            </p>
          )}

          <Button 
            type="submit" 
            color="primary" 
            isLoading={isLoading}
            className="w-full"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="relative">
          <Divider className="my-4" />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-default-500">
            OR
          </span>
        </div>

        <Button
          variant="bordered"
          onClick={handleGoogleSignIn}
          className="w-full"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-default-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-primary hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </CardBody>
    </Card>
  )
}
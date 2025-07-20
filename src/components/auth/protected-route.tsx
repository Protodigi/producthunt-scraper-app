'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Spinner } from '@nextui-org/react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label="Loading..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

// Server Component version for app directory
export function ServerProtectedRoute({ 
  children,
  user
}: { 
  children: React.ReactNode
  user: any
}) {
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-default-500 mb-4">
            You need to be logged in to view this page.
          </p>
          <a 
            href="/login" 
            className="text-primary hover:underline"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
'use client'

import React from 'react'
import { Card, CardBody, Button } from '@nextui-org/react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: Error, reset: () => void) => React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center space-y-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-danger">Something went wrong</h2>
          <p className="text-default-600">
            An unexpected error occurred. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-default-500">
                Error details
              </summary>
              <pre className="mt-2 text-xs bg-default-100 p-2 rounded overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
          <Button
            color="primary"
            variant="solid"
            onPress={reset}
            className="mt-4"
          >
            Try again
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return {
    throwError: setError,
    clearError: () => setError(null)
  }
}

// Async error boundary wrapper
export function AsyncErrorBoundary({
  children,
  ...props
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundary {...props}>
      <React.Suspense fallback={<div>Loading...</div>}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  )
}
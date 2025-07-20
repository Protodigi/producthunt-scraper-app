'use client'

import { Card, CardBody, CardHeader, Button } from '@nextui-org/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  fullWidth?: boolean
}

export function ErrorState({ 
  title = 'Error', 
  message = 'Something went wrong. Please try again later.', 
  onRetry,
  fullWidth = false 
}: ErrorStateProps) {
  return (
    <div className={`p-4 ${fullWidth ? 'w-full' : 'max-w-lg mx-auto'}`}>
      <Card>
        <CardHeader className="flex gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-danger" />
          <h2 className="text-xl font-bold text-danger">{title}</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-default-600">{message}</p>
          {onRetry && (
            <Button color="primary" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
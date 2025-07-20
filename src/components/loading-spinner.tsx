'use client'

import React from 'react'
import { Spinner } from '@nextui-org/react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullscreen?: boolean
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  labelColor?: 'foreground' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export function LoadingSpinner({
  size = 'md',
  label,
  fullscreen = false,
  color = 'primary',
  labelColor = 'foreground'
}: LoadingSpinnerProps) {
  const spinner = (
    <Spinner
      size={size}
      color={color}
      label={label}
      labelColor={labelColor}
    />
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {spinner}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}

// Wrapper component for loading states in containers
export function LoadingContainer({
  isLoading,
  children,
  spinnerProps = {}
}: {
  isLoading: boolean
  children: React.ReactNode
  spinnerProps?: LoadingSpinnerProps
}) {
  if (isLoading) {
    return <LoadingSpinner {...spinnerProps} />
  }

  return <>{children}</>
}

// Skeleton loading for list items
export function LoadingSkeleton({
  rows = 5,
  className = ''
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-12 bg-default-200 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
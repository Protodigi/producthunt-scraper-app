'use client'

import { Spinner } from '@nextui-org/react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export function LoadingState({ message = 'Loading...', size = 'lg', fullScreen = true }: LoadingStateProps) {
  const containerClass = fullScreen 
    ? 'flex flex-col justify-center items-center min-h-screen gap-4'
    : 'flex flex-col justify-center items-center p-8 gap-4'

  return (
    <div className={containerClass}>
      <Spinner size={size} />
      <p className="text-default-500">{message}</p>
    </div>
  )
}
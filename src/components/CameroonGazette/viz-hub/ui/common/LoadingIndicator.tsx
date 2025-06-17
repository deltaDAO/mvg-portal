import React from 'react'

interface LoadingIndicatorProps {
  message?: string
}

/**
 * Full-screen loading indicator with spinner
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </div>
  )
}

export default LoadingIndicator

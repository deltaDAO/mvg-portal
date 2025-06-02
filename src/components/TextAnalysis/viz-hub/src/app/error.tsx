'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] pt-4 pb-16">
      <div className="max-w-md w-full text-center px-6 py-8">
        <div className="mb-8 flex flex-col items-center">
          <ExclamationTriangleIcon className="h-24 w-24 text-red-600 dark:text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Something went wrong
          </h1>
          <div className="w-12 h-1 bg-red-600 dark:bg-red-500 my-4 mx-auto"></div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We apologize for the inconvenience. An unexpected error has occurred.
          {error.digest && (
            <span className="block mt-2 text-sm text-gray-500 dark:text-gray-500">
              Error ID: {error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

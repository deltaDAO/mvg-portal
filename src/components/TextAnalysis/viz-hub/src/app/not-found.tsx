'use client'

import Link from 'next/link'
import React from 'react'
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] pt-4 pb-16">
      <div className="max-w-md w-full text-center px-6 py-8">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400">
            404
          </h1>
          <div className="w-12 h-1 bg-blue-600 dark:bg-blue-400 my-4 mx-auto"></div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved. Please
          check the URL or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Go to Homepage</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

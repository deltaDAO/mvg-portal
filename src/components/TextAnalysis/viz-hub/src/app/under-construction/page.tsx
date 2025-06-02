'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function UnderConstruction() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] pt-4 pb-16">
      <div className="max-w-md w-full text-center px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-20 h-20 text-yellow-500 dark:text-yellow-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 014.486 6.336l-3.276 3.689M7.042 16.136A4.5 4.5 0 0112.367 13l5.507-5.507a4.5 4.5 0 01.176 6.7l-3.739 3.739a4.5 4.5 0 01-6.364-6.364l5.036-5.037a1.5 1.5 0 012.121 0"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-6">
            Under Construction
          </h1>
          <div className="w-12 h-1 bg-yellow-500 dark:bg-yellow-400 my-4 mx-auto"></div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We're working hard to build this page. Please check back soon for
          updates!
        </p>

        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer mx-auto"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  )
}

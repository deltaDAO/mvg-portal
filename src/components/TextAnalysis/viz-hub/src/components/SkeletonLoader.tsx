'use client'

import React from 'react'

interface SkeletonLoaderProps {
  height?: string
  title?: boolean
  description?: boolean
  type?: 'chart' | 'line' | 'bar' | 'area' | 'wordcloud' | 'document'
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = 'h-64',
  title = true,
  description = true,
  type = 'chart'
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      {title && (
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
      )}

      {description && (
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
      )}

      <div
        className={`${height} bg-gray-100 rounded flex items-center justify-center`}
      >
        {/* Different loading indicators based on visualization type */}
        {(type === 'chart' || type === 'line') && (
          <div className="flex flex-col items-center">
            <svg
              className="w-10 h-10 text-gray-300 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Loading chart data...</p>
          </div>
        )}

        {type === 'bar' && (
          <div className="flex flex-col items-center">
            <svg
              className="w-10 h-10 text-gray-300 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Loading chart data...</p>
          </div>
        )}

        {type === 'area' && (
          <div className="flex flex-col items-center">
            <svg
              className="w-10 h-10 text-gray-300 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Loading chart data...</p>
          </div>
        )}

        {type === 'wordcloud' && (
          <div className="flex flex-col items-center">
            <svg
              className="w-10 h-10 text-gray-300 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Generating word cloud...</p>
          </div>
        )}

        {type === 'document' && (
          <div className="flex flex-col items-center">
            <svg
              className="w-10 h-10 text-gray-300 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Processing document data...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SkeletonLoader

import React from 'react'

interface EmptyStateProps {
  title: string
}

/**
 * EmptyState component displays a placeholder when visualization data is not available
 */
const EmptyState: React.FC<EmptyStateProps> = ({ title }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 mb-1">
      No data available to display.
    </p>
    <p className="text-gray-500 dark:text-gray-400 text-sm">
      Click the &quot;Upload Data&quot; button in the header to get started.
    </p>
  </div>
)

export default EmptyState

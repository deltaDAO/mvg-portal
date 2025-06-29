import React from 'react'

interface FutureFeaturesProps {
  title?: string
  description?: string
}

/**
 * Placeholder component for future features
 */
const FutureFeatures: React.FC<FutureFeaturesProps> = ({
  title = 'Further more ...',
  description = 'Additional visualizations and analysis tools will be added here.'
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

export default FutureFeatures

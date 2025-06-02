export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] pt-4 pb-16">
      <div className="flex flex-col items-center px-6 py-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <h2 className="mt-6 text-xl font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Preparing your visualization
        </p>
      </div>
    </div>
  )
}

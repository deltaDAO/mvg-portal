interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const LoadingSpinner = ({
  size = 'md',
  message = 'Loading...'
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
      />
      <span className="text-gray-500">{message}</span>
    </div>
  )
}

export default LoadingSpinner

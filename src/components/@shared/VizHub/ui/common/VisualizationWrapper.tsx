import React, { ReactNode } from 'react'
import EmptyState from './EmptyState'

interface VisualizationWrapperProps {
  isAvailable: boolean
  title: string
  className?: string
  children: ReactNode
}

/**
 * VisualizationWrapper conditionally renders a visualization or an EmptyState
 * based on whether data is available
 */
const VisualizationWrapper: React.FC<VisualizationWrapperProps> = ({
  isAvailable,
  title,
  className = 'mb-6',
  children
}) => {
  return (
    <div className={className}>
      {isAvailable ? children : <EmptyState title={title} />}
    </div>
  )
}

export default VisualizationWrapper

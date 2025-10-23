import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ReactNode, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Loader from '../atoms/Loader'
import QueryErrorRetry from '../QueryErrorRetry'

interface QueryBoundaryProps {
  text?: string
  children: ReactNode
}

function QueryBoundary({ text, children }: QueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={QueryErrorRetry}>
          <Suspense fallback={<Loader message={text ?? 'Loading...'} />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default QueryBoundary

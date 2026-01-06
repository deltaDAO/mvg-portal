import { ReactElement } from 'react'
import Loader from '@shared/atoms/Loader'

interface LoadingStateProps {
  containerClassName: string
  message?: string
}

export function LoadingState({
  containerClassName,
  message = 'Loading compute wizard...'
}: LoadingStateProps): ReactElement {
  return (
    <div className={containerClassName}>
      <Loader message={message} />
    </div>
  )
}

interface ErrorStateProps {
  containerClassName: string
  errorClassName: string
  title?: string
  message?: string
}

export function ErrorState({
  containerClassName,
  errorClassName,
  title = 'Error',
  message = 'Something went wrong.'
}: ErrorStateProps): ReactElement {
  return (
    <div className={containerClassName}>
      <h2>{title}</h2>
      <p className={errorClassName}>{message}</p>
    </div>
  )
}

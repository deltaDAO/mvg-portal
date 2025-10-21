import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'

export const QueryClientLoadingIndicator = () => {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()

  useEffect(() => {
    document.body.style.cursor = isFetching || isMutating ? 'wait' : 'default'
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [isFetching, isMutating])

  return <></>
}

import { useCancelToken } from '@hooks/useCancelToken'
import { LoggerInstance } from '@oceanprotocol/lib'
import { getAsset } from '@utils/aquarius'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { useAssetInput } from '..'

export const useAssetTextField = () => {
  const { asset, selected, written, setWritten, error, setError } =
    useAssetInput()

  const [inputValue, setInputValue] = useState('')
  const [debouncedValue] = useDebounce(inputValue, 500)
  const newCancelToken = useCancelToken()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setInputValue(e.target.value)
  }

  useEffect(() => {
    if (!debouncedValue) return
    getAsset(debouncedValue.trim(), newCancelToken())
      .then((fetchedAsset) => {
        if (!fetchedAsset) {
          setWritten(null)
          return
        }

        if (asset.chainId !== fetchedAsset.chainId) {
          setWritten(null)
          setError('Asset must be from the same chain')
          return
        }

        setWritten(fetchedAsset)
        setError(null)
      })
      .catch((error) => {
        LoggerInstance.error(error)
        setWritten(null)
        setError((error as Error).message)
      })
  }, [debouncedValue, newCancelToken, setWritten, setError, asset.chainId])

  return {
    selected,
    inputValue,
    error,
    written,
    handleInputChange
  }
}

import { Consent } from '@utils/consents/types'
import { useCallback } from 'react'

const STORAGE_KEY = 'currentConsent'

export const useCurrentConsent = () => {
  const setCurrentConsent = useCallback((consent: Consent | null) => {
    if (!consent) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    }
  }, [])

  const getCurrentConsent = (): Consent | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as Consent) : null
    } catch {
      return null
    }
  }

  return {
    currentConsent: getCurrentConsent(),
    setCurrentConsent
  }
}

import { useState, useEffect, useCallback } from 'react'
import {
  CredentialStatus,
  createCredentialStatus,
  checkCredentialExpiration,
  getTimeRemainingText,
  shouldShowExpirationWarning
} from '@utils/credentialExpiration'

export interface UseCredentialExpirationReturn {
  credentialStatus: CredentialStatus
  timeRemainingText: string
  showExpirationWarning: boolean
  refreshCredentials: () => void
  setCredentialsValid: (timestamp?: number) => void
  setCredentialsInvalid: () => void
}

export function useCredentialExpiration(
  assetId: string,
  serviceId: string,
  onRefresh?: () => void,
  isVerified?: boolean
): UseCredentialExpirationReturn {
  const [credentialStatus, setCredentialStatus] = useState<CredentialStatus>({
    isValid: false,
    needsRefresh: false
  })

  // Check localStorage for existing credential timestamp
  useEffect(() => {
    if (!assetId || !serviceId || typeof window === 'undefined') return

    const credentialKey = `credential_${assetId}_${serviceId}`

    const updateCredentialStatus = () => {
      if (!isVerified) {
        setCredentialStatus({
          isValid: false,
          needsRefresh: false
        })
        return
      }

      const storedTimestamp = window.localStorage.getItem(credentialKey)

      if (storedTimestamp) {
        const timestamp = parseInt(storedTimestamp, 10)
        const status = createCredentialStatus(true, timestamp)
        setCredentialStatus(status)
      } else {
        setCredentialStatus({
          isValid: false,
          needsRefresh: false
        })
      }
    }

    // Initial check
    updateCredentialStatus()

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === credentialKey) {
        updateCredentialStatus()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom events (for same-tab updates)
    const handleCredentialUpdate = (e: CustomEvent) => {
      if (e.detail?.credentialKey === credentialKey) {
        updateCredentialStatus()
      }
    }

    window.addEventListener(
      'credentialUpdated',
      handleCredentialUpdate as EventListener
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'credentialUpdated',
        handleCredentialUpdate as EventListener
      )
    }
  }, [assetId, serviceId, isVerified])

  const timeRemainingText = credentialStatus.timeRemaining
    ? getTimeRemainingText(credentialStatus.timeRemaining)
    : 'Credentials not verified'

  const showExpirationWarning = credentialStatus.timeRemaining
    ? shouldShowExpirationWarning(credentialStatus.timeRemaining)
    : false

  const refreshCredentials = useCallback(() => {
    setCredentialStatus({
      isValid: false,
      needsRefresh: true
    })
    onRefresh?.()
  }, [onRefresh])

  const setCredentialsValid = useCallback((timestamp?: number) => {
    setCredentialStatus(createCredentialStatus(true, timestamp))
  }, [])

  const setCredentialsInvalid = useCallback(() => {
    setCredentialStatus({
      isValid: false,
      needsRefresh: false
    })
  }, [])

  // Check expiration every second
  useEffect(() => {
    if (!credentialStatus.isValid || !credentialStatus.expiresAt) {
      return
    }

    const interval = setInterval(() => {
      const newStatus = checkCredentialExpiration(credentialStatus.expiresAt!)

      setCredentialStatus(newStatus)

      // Don't auto-refresh - let user manually trigger
      // if (newStatus.needsRefresh && onRefresh) {
      //   onRefresh()
      // }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [credentialStatus.isValid, credentialStatus.expiresAt])

  return {
    credentialStatus,
    timeRemainingText,
    showExpirationWarning,
    refreshCredentials,
    setCredentialsValid,
    setCredentialsInvalid
  }
}

import { useState, useCallback } from 'react'
import { checkVerifierSessionId } from '@utils/wallet/policyServer'
import { useSsiWallet } from '@context/SsiWallet'

export interface CredentialValidationState {
  isValidating: boolean
  isValid: boolean
  error: string | null
}

export interface UseCredentialValidationReturn {
  validationState: CredentialValidationState
  validateCredentials: (assetId: string, serviceId: string) => Promise<boolean>
  refreshCredentials: (assetId: string, serviceId: string) => Promise<boolean>
}

export function useCredentialValidation(): UseCredentialValidationReturn {
  const [validationState, setValidationState] =
    useState<CredentialValidationState>({
      isValidating: false,
      isValid: false,
      error: null
    })

  const { lookupVerifierSessionId, clearVerifierSessionCache } = useSsiWallet()

  const validateCredentials = useCallback(
    async (assetId: string, serviceId: string): Promise<boolean> => {
      setValidationState({
        isValidating: true,
        isValid: false,
        error: null
      })

      try {
        const sessionId = lookupVerifierSessionId(assetId, serviceId)
        if (!sessionId) {
          setValidationState({
            isValidating: false,
            isValid: false,
            error: 'No session found'
          })
          return false
        }

        const result = await checkVerifierSessionId(sessionId)

        if (result.success) {
          setValidationState({
            isValidating: false,
            isValid: true,
            error: null
          })
          return true
        } else {
          setValidationState({
            isValidating: false,
            isValid: false,
            error: 'Session expired'
          })
          return false
        }
      } catch (error) {
        const errorMessage = error?.message || 'Validation failed'
        setValidationState({
          isValidating: false,
          isValid: false,
          error: errorMessage
        })
        clearVerifierSessionCache()
        return false
      }
    },
    [lookupVerifierSessionId, clearVerifierSessionCache]
  )

  const refreshCredentials = useCallback(async (): Promise<boolean> => {
    // Clear the session to force re-authentication
    clearVerifierSessionCache()

    setValidationState({
      isValidating: true,
      isValid: false,
      error: null
    })

    // Return false to indicate credentials need to be re-verified
    // The UI should trigger the credential check flow
    setValidationState({
      isValidating: false,
      isValid: false,
      error: 'Credentials need to be re-verified'
    })

    return false
  }, [clearVerifierSessionCache])

  return {
    validationState,
    validateCredentials,
    refreshCredentials
  }
}

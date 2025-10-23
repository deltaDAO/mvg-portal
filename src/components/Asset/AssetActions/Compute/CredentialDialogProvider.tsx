// CredentialDialogContext.tsx
import { useCredentialDialogState } from '@hooks/useCredentials'
import { createContext, useContext } from 'react'

const CredentialDialogContext = createContext(null)

export function CredentialDialogProvider({ children, autoStart = false }) {
  const dialogState = useCredentialDialogState(autoStart)
  return (
    <CredentialDialogContext.Provider value={dialogState}>
      {children}
    </CredentialDialogContext.Provider>
  )
}

export function useCredentialDialog() {
  return useContext(CredentialDialogContext)
}

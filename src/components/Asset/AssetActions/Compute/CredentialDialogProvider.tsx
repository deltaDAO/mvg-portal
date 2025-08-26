// CredentialDialogContext.tsx
import { useCredentialDialogState } from '@hooks/useCredentials'
import { createContext, useContext } from 'react'

const CredentialDialogContext = createContext(null)

export function CredentialDialogProvider({ children }) {
  const dialogState = useCredentialDialogState()
  try {
    // Debug provider lifecycle
    console.log('[CredentialDialogProvider] mount', {
      state: dialogState.checkCredentialState,
      showVpDialog: dialogState.showVpDialog,
      showDidDialog: dialogState.showDidDialog
    })
  } catch {}
  return (
    <CredentialDialogContext.Provider value={dialogState}>
      {children}
    </CredentialDialogContext.Provider>
  )
}

export function useCredentialDialog() {
  return useContext(CredentialDialogContext)
}

// hooks/useCredentialDialogState.ts
import { useState } from 'react'
import { SsiWalletDid } from 'src/@types/SsiWallet'

export enum CheckCredentialState {
  Stop = 'Stop',
  StartCredentialExchange = 'StartCredentialExchange',
  ReadDids = 'ReadDids',
  ResolveCredentials = 'ResolveCredentials',
  AbortSelection = 'AbortSelection'
}

export interface ExchangeStateData {
  openid4vp: string
  verifiableCredentials: any[]
  selectedCredentials: any[]
  sessionId: string
  dids: SsiWalletDid[]
  selectedDid: string
  poliyServerData: any
}

export function newExchangeStateData(): ExchangeStateData {
  return {
    openid4vp: '',
    verifiableCredentials: [],
    sessionId: '',
    selectedCredentials: [],
    dids: [],
    selectedDid: '',
    poliyServerData: undefined
  }
}

export function useCredentialDialogState(autoStart = false) {
  const [checkCredentialState, setCheckCredentialState] =
    useState<CheckCredentialState>(CheckCredentialState.Stop)
  const [requiredCredentials, setRequiredCredentials] = useState<string[]>([])
  const [exchangeStateData, setExchangeStateData] = useState<ExchangeStateData>(
    newExchangeStateData()
  )
  const [showVpDialog, setShowVpDialog] = useState<boolean>(false)
  const [showDidDialog, setShowDidDialog] = useState<boolean>(false)
  const [credentialError, setCredentialError] = useState<string | null>(null)
  const [isCheckingCredentials, setIsCheckingCredentials] =
    useState<boolean>(false)

  return {
    checkCredentialState,
    setCheckCredentialState,
    requiredCredentials,
    setRequiredCredentials,
    exchangeStateData,
    setExchangeStateData,
    showVpDialog,
    setShowVpDialog,
    showDidDialog,
    setShowDidDialog,
    credentialError,
    setCredentialError,
    isCheckingCredentials,
    setIsCheckingCredentials,
    autoStart
  }
}

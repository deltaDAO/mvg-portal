import React, { useEffect, useState } from 'react'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'
import { useSsiWallet } from '@context/SsiWallet'
import { toast } from 'react-toastify'
import {
  getPd,
  requestCredentialPresentation
} from '@utils/wallet/policyServer'
import {
  extractURLSearchParams,
  matchCredentialForPresentationDefinition,
  getWalletDids,
  resolvePresentationRequest,
  sendPresentationRequest
} from '@utils/wallet/ssiWallet'
import { SsiWalletDid } from 'src/@types/SsiWallet'
import { VpSelector } from '../VpSelector'
import { DidSelector } from '../DidSelector'
import styles from './index.module.css'
import { Asset } from 'src/@types/Asset'
import { Service } from 'src/@types/ddo/Service'
import { useAccount } from 'wagmi'
import { CheckCredentialState, ExchangeStateData } from '@hooks/useCredentials'
import { useCredentialDialog } from '../Compute/CredentialDialogProvider'
import { parseCredentialPolicies } from '@components/Publish/_utils'

function newExchangeStateData(): ExchangeStateData {
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

export function AssetActionCheckCredentialsAlgo({
  asset,
  service,
  type,
  onVerified,
  onError
}: {
  asset: Asset
  service: Service
  type?: string
  onVerified?: () => void
  onError?: () => void
}) {
  const { address: accountId } = useAccount()
  const {
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
  } = useCredentialDialog()

  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState<boolean>(false)

  const {
    cacheVerifierSessionId,
    selectedWallet,
    ssiWalletCache,
    cachedCredentials,
    setCachedCredentials,
    sessionToken
  } = useSsiWallet()

  // Auto-start credential exchange if autoStart is true
  useEffect(() => {
    if (autoStart && selectedWallet?.id) {
      setCheckCredentialState(CheckCredentialState.StartCredentialExchange)
    }
  }, [autoStart, selectedWallet?.id])

  function handleResetWalletCache() {
    setCheckCredentialState(CheckCredentialState.Stop)
    setIsCheckingCredentials(false)
  }

  useEffect(() => {
    async function handleCredentialExchange() {
      try {
        // Clear any previous errors when starting new credential check
        if (
          checkCredentialState === CheckCredentialState.StartCredentialExchange
        ) {
          setCredentialError(null)
          setIsCheckingCredentials(true)
        }
        switch (checkCredentialState) {
          case CheckCredentialState.StartCredentialExchange: {
            parseCredentialPolicies(asset.credentialSubject?.credentials)
            asset?.credentialSubject?.services?.forEach((service) => {
              parseCredentialPolicies(service.credentials)
            })

            const presentationResult = await requestCredentialPresentation(
              asset,
              accountId,
              service.id
            )

            if (
              presentationResult.openid4vc &&
              typeof presentationResult.openid4vc === 'object' &&
              (presentationResult.openid4vc as any).redirectUri &&
              (presentationResult.openid4vc as any).redirectUri.includes(
                'success'
              )
            ) {
              const { id } = extractURLSearchParams(
                (presentationResult.openid4vc as any).redirectUri
              )
              cacheVerifierSessionId(asset.id, service.id, id, true)
              if (typeof window !== 'undefined' && window.localStorage) {
                const credentialKey = `credential_${asset.id}_${service.id}`
                const timestamp = Date.now().toString()
                window.localStorage.setItem(credentialKey, timestamp)
                window.dispatchEvent(
                  new CustomEvent('credentialUpdated', {
                    detail: { credentialKey }
                  })
                )
              }
              onVerified?.()
              break
            }

            exchangeStateData.openid4vp = presentationResult.openid4vc
            exchangeStateData.poliyServerData =
              presentationResult.policyServerData

            const searchParams = extractURLSearchParams(
              exchangeStateData.openid4vp
            )
            const { state } = searchParams
            exchangeStateData.sessionId = state
            const presentationDefinition = await getPd(state)
            const resultRequiredCredentials =
              presentationDefinition.input_descriptors.map(
                (credential) => credential.id
              )
            if (resultRequiredCredentials.length > 0) {
              setRequiredCredentials(resultRequiredCredentials)
            }

            const resultCachedCredentials = ssiWalletCache.lookupCredentials(
              asset.id,
              resultRequiredCredentials
            )
            if (resultCachedCredentials.length > 0) {
              setCachedCredentials(resultCachedCredentials)
            }

            if (
              resultRequiredCredentials.length > resultCachedCredentials.length
            ) {
              exchangeStateData.verifiableCredentials =
                await matchCredentialForPresentationDefinition(
                  selectedWallet?.id,
                  presentationDefinition,
                  sessionToken.token
                )

              const cachedCredentialsIds = resultCachedCredentials.map(
                (credential) => credential.parsedDocument.id
              )
              exchangeStateData.verifiableCredentials =
                exchangeStateData.verifiableCredentials.filter(
                  (credential) =>
                    !cachedCredentialsIds.includes(credential.parsedDocument.id)
                )

              if (exchangeStateData.verifiableCredentials.length > 0) {
                setShowVpDialog(true)
              } else {
                setCheckCredentialState(CheckCredentialState.ReadDids)
              }
            } else {
              // Cached credentials satisfy PD; normalize to IDs and allow user to review policy
              exchangeStateData.verifiableCredentials = resultCachedCredentials
              exchangeStateData.selectedCredentials =
                resultCachedCredentials.map(
                  (credential) =>
                    credential?.parsedDocument?.id || credential?.id
                )
              setShowVpDialog(true)
            }

            setExchangeStateData({ ...exchangeStateData })
            break
          }

          case CheckCredentialState.ReadDids: {
            let { selectedCredentials } = exchangeStateData
            if (!selectedCredentials || selectedCredentials.length === 0) {
              selectedCredentials = exchangeStateData.verifiableCredentials
            }
            if (!selectedCredentials || selectedCredentials.length === 0) {
              selectedCredentials = cachedCredentials
            }
            if (!selectedCredentials || selectedCredentials.length === 0) {
              toast.error(
                'You must select at least one credential to present, check if you have any required credential in your wallet'
              )
              setCheckCredentialState(CheckCredentialState.Stop)
              break
            }

            // Cache full credential objects
            ssiWalletCache.cacheCredentials(
              asset.id,
              selectedCredentials as any
            )
            setCachedCredentials(selectedCredentials as any)

            // Normalize for use request → IDs only
            exchangeStateData.selectedCredentials = (
              selectedCredentials as any[]
            )
              .map((cred) =>
                typeof cred === 'string'
                  ? cred
                  : cred?.parsedDocument?.id || cred?.id
              )
              .filter(Boolean)

            exchangeStateData.dids = await getWalletDids(
              selectedWallet.id,
              sessionToken.token
            )

            exchangeStateData.selectedDid =
              exchangeStateData.dids.length > 0
                ? exchangeStateData.dids[0].did
                : ''
            setExchangeStateData({ ...exchangeStateData })
            setShowDidDialog(true)
            break
          }

          case CheckCredentialState.ResolveCredentials: {
            const resolvedPresentationRequest =
              await resolvePresentationRequest(
                selectedWallet?.id,
                exchangeStateData.openid4vp,
                sessionToken.token
              )
            try {
              const result = await sendPresentationRequest(
                selectedWallet?.id,
                exchangeStateData.selectedDid,
                resolvedPresentationRequest,
                exchangeStateData.selectedCredentials,
                sessionToken.token
              )
              if (
                'errorMessage' in result ||
                result.redirectUri.includes('error')
              ) {
                console.error(
                  'Algorithm credential verification failed:',
                  result
                )
                toast.error('Validation was not successful as use presentation')
                handleResetWalletCache()
              } else {
                console.log(
                  'Algorithm credential verification successful, caching session:',
                  {
                    assetId: asset.id,
                    serviceId: service.id,
                    sessionId: exchangeStateData.sessionId
                  }
                )
                cacheVerifierSessionId(
                  asset.id,
                  service.id,
                  exchangeStateData.sessionId
                )
                onVerified?.() // ✅ Verification successful → move to next
              }
            } catch (error) {
              console.error('Algorithm credential verification error:', error)
              setError('Validation was not successful')
              handleResetWalletCache()
            }
            console.log('Resetting algorithm component state to Stop')
            setExchangeStateData({
              ...exchangeStateData,
              ...newExchangeStateData()
            })
            setCheckCredentialState(CheckCredentialState.Stop)
            setIsCheckingCredentials(false)
            break
          }

          case CheckCredentialState.AbortSelection: {
            setExchangeStateData(newExchangeStateData())
            setCheckCredentialState(CheckCredentialState.Stop)
            setIsCheckingCredentials(false)
            break
          }
        }
      } catch (error: any) {
        const errorMessage = error?.message
          ? `SSI credential validation was not successful: ${error.message}`
          : 'An error occurred during SSI credential validation. Please check the console'

        setError(errorMessage)
        setCredentialError(errorMessage)
        setIsCheckingCredentials(false)
        handleResetWalletCache()
        onError?.()
      }
    }

    handleCredentialExchange()
  }, [checkCredentialState])

  function handleAcceptCredentialSelection(selectedCredentials: any[]) {
    exchangeStateData.selectedCredentials = selectedCredentials
    setExchangeStateData({ ...exchangeStateData })
    setCheckCredentialState(CheckCredentialState.ReadDids)
  }

  function handleAcceptDidSelection(selectedDid: SsiWalletDid) {
    exchangeStateData.selectedDid = selectedDid.did
    setExchangeStateData({ ...exchangeStateData })
    setCheckCredentialState(CheckCredentialState.ResolveCredentials)
  }

  function getLoaderMessage() {
    const assetName = asset.credentialSubject?.metadata?.name || 'asset'
    const serviceName = service.name || 'service'
    const assetType = type === 'dataset' ? 'Dataset' : 'Algorithm'

    if (error) {
      return error
    }

    if (isRetrying) {
      return `Retrying ${assetType.toLowerCase()} credential check for ${assetName}...`
    }

    switch (checkCredentialState) {
      case CheckCredentialState.StartCredentialExchange:
        return `Connecting to policy server for ${assetType} ${assetName}...`
      case CheckCredentialState.ReadDids:
        return `Selecting credentials for ${serviceName}...`
      case CheckCredentialState.ResolveCredentials:
        return `Verifying access to ${assetType} ${assetName}...`
      default:
        return `Checking ${assetType.toLowerCase()} credentials for ${assetName}...`
    }
  }

  function handleRetry() {
    setError(null)
    setIsRetrying(true)
    setCheckCredentialState(CheckCredentialState.StartCredentialExchange)
    setTimeout(() => setIsRetrying(false), 1000)
  }

  return (
    <div className={`${styles.panelColumn} ${styles.alignItemsCenter}`}>
      {showVpDialog && (
        <VpSelector
          setShowDialog={setShowVpDialog}
          showDialog={showVpDialog}
          acceptSelection={handleAcceptCredentialSelection}
          abortSelection={() =>
            setCheckCredentialState(CheckCredentialState.AbortSelection)
          }
          ssiVerifiableCredentials={exchangeStateData.verifiableCredentials}
          assetAllowCredentials={asset.credentialSubject?.credentials?.allow}
        />
      )}
      {showDidDialog && (
        <DidSelector
          setShowDialog={setShowDidDialog}
          showDialog={showDidDialog}
          acceptSelection={handleAcceptDidSelection}
          abortSelection={() =>
            setCheckCredentialState(CheckCredentialState.AbortSelection)
          }
          dids={exchangeStateData.dids}
        />
      )}
      {!showVpDialog && !showDidDialog && (
        <div className={styles.buttonWrapperAlgo}>
          {autoStart ? (
            <div className={styles.loaderContainer}>
              <Loader message={getLoaderMessage()} variant="primary" />
              {error && (
                <Button
                  type="button"
                  onClick={handleRetry}
                  style="publish"
                  className={styles.retryButton}
                >
                  Retry
                </Button>
              )}
            </div>
          ) : (
            <Button
              type="button"
              style="publish"
              onClick={() => {
                setCheckCredentialState(
                  CheckCredentialState.StartCredentialExchange
                )
              }}
              disabled={!selectedWallet?.id}
            >
              {type === 'dataset'
                ? `Check Dataset Credentials for ${service.name}`
                : 'Check Algorithm Credentials'}
            </Button>
          )}
        </div>
      )}
      {requiredCredentials && requiredCredentials.length > 0 && (
        <div
          className={`${styles.panelGrid} ${styles.panelTemplateData} ${styles.marginTop1}`}
        >
          {requiredCredentials.map((cred) => (
            <React.Fragment key={cred}>
              <div className={`${styles.marginTop6px} ${styles.fillGreen}`} />
              {cred}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

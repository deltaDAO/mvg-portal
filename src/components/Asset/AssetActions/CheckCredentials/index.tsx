/* eslint-disable camelcase */
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
  usePresentationRequest
} from '@utils/wallet/ssiWallet'
import { Fragment, useEffect, useState } from 'react'
import { SsiVerifiableCredential, SsiWalletDid } from 'src/@types/SsiWallet'
import { VpSelector } from '../VpSelector'
import { DidSelector } from '../DidSelector'
import styles from './index.module.css'
import { LoggerInstance } from '@oceanprotocol/lib'
import { PolicyServerInitiateActionData } from 'src/@types/PolicyServer'
import { Asset } from 'src/@types/Asset'
import { Service } from 'src/@types/ddo/Service'
import { useAccount } from 'wagmi'
import Button from '@shared/atoms/Button'
import Loader from '@shared/atoms/Loader'
import { initializeProvider } from '@utils/order'
import VerifiedPatch from '@images/circle_check.svg'
import { useCredentialDialog } from '../Compute/CredentialDialogProvider'
import Alert from '@shared/atoms/Alert'
import { useUserPreferences } from '@context/UserPreferences'

enum CheckCredentialState {
  Stop = 'Stop',
  StartCredentialExchange = 'StartCredentialExchange',
  ReadDids = 'ReadDids',
  ResolveCredentials = 'ResolveCredentials',
  AbortSelection = 'AbortSelection'
}

interface ExchangeStateData {
  openid4vp: string
  verifiableCredentials: SsiVerifiableCredential[]
  selectedCredentials: string[]
  sessionId: string
  dids: SsiWalletDid[]
  selectedDid: string
  poliyServerData: PolicyServerInitiateActionData
}

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

function isCredentialCached(
  cachedCredentials: SsiVerifiableCredential[],
  credentialType: string
): boolean {
  if (!cachedCredentials) {
    return false
  }
  return cachedCredentials.some((credential) =>
    credential.parsedDocument.type.includes(credentialType)
  )
}

export function AssetActionCheckCredentials({
  asset,
  service,
  onVerified,
  onError
}: {
  asset: Asset
  service: Service
  onVerified?: () => void
  onError?: () => void
}) {
  const { address: accountId } = useAccount()
  const credentialDialog = useCredentialDialog()
  const autoStart = credentialDialog?.autoStart ?? false
  const [checkCredentialState, setCheckCredentialState] =
    useState<CheckCredentialState>(CheckCredentialState.Stop)

  const [requiredCredentials, setRequiredCredentials] = useState<string[]>([])
  const [exchangeStateData, setExchangeStateData] = useState<ExchangeStateData>(
    newExchangeStateData()
  )

  const [showVpDialog, setShowVpDialog] = useState<boolean>(false)
  const [showDidDialog, setShowDidDialog] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState<boolean>(false)
  const { setShowSsiWalletModule } = useUserPreferences()

  const {
    cacheVerifierSessionId,
    selectedWallet,
    ssiWalletCache,
    cachedCredentials,
    setCachedCredentials,
    sessionToken,
    clearVerifierSessionCache
  } = useSsiWallet()

  useEffect(() => {
    if (autoStart && selectedWallet?.id) {
      setCheckCredentialState(CheckCredentialState.StartCredentialExchange)
    }
  }, [autoStart, selectedWallet?.id])

  function handleResetWalletCache() {
    clearVerifierSessionCache()
    setCachedCredentials([])
  }

  useEffect(() => {
    async function handleCredentialExchange() {
      try {
        // Clear any previous errors when starting new credential check
        if (
          checkCredentialState === CheckCredentialState.StartCredentialExchange
        ) {
          // Reset state for new credential check
        }
        switch (checkCredentialState) {
          case CheckCredentialState.StartCredentialExchange: {
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

            // Check if we have a valid presentation result
            if (!presentationResult || !presentationResult.openid4vc) {
              console.error('No presentation result or openid4vc URL received')
              toast.error('No credential requirements found for this asset')
              setCheckCredentialState(CheckCredentialState.Stop)
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
            if (service?.type === 'access' && accountId) {
              const initializeData = await initializeProvider(
                asset,
                service,
                accountId
              )
            }
            const presentationDefinition = await getPd(state)
            const resultRequiredCredentials =
              presentationDefinition.input_descriptors.map(
                (credential) => credential.id
              )
            setRequiredCredentials(resultRequiredCredentials)

            const resultCachedCredentials = ssiWalletCache.lookupCredentials(
              asset.id,
              resultRequiredCredentials
            )
            setCachedCredentials(resultCachedCredentials)
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
                (credential) => credential.id
              )

              exchangeStateData.verifiableCredentials =
                exchangeStateData.verifiableCredentials.filter(
                  (credential) => !cachedCredentialsIds.includes(credential.id)
                )

              if (exchangeStateData.verifiableCredentials.length > 0) {
                setShowVpDialog(true)
              } else {
                toast.info('No more credentials found in your ssi wallet')
                setCheckCredentialState(CheckCredentialState.ReadDids)
              }
            } else {
              exchangeStateData.selectedCredentials =
                exchangeStateData.verifiableCredentials.map(
                  (credential) => credential.parsedDocument.id
                )
              setCheckCredentialState(CheckCredentialState.ReadDids)
            }

            setExchangeStateData(exchangeStateData)
            break
          }

          case CheckCredentialState.ReadDids: {
            let selectedCredentials =
              exchangeStateData.verifiableCredentials.filter((credential) =>
                exchangeStateData.selectedCredentials.includes(
                  credential.parsedDocument.id
                )
              )

            selectedCredentials = [...selectedCredentials, ...cachedCredentials]
            exchangeStateData.selectedCredentials = selectedCredentials.map(
              (credential) => credential.id
            )

            if (selectedCredentials.length === 0) {
              toast.error('You must select at least one credential to present')
              setCheckCredentialState(CheckCredentialState.Stop)
              break
            }

            ssiWalletCache.cacheCredentials(asset.id, selectedCredentials)
            setCachedCredentials(selectedCredentials)

            exchangeStateData.dids = await getWalletDids(
              selectedWallet.id,
              sessionToken.token
            )

            exchangeStateData.selectedDid =
              exchangeStateData.dids.length > 0
                ? exchangeStateData.dids[0].did
                : ''

            setShowDidDialog(true)
            setExchangeStateData(exchangeStateData)
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
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const result = await usePresentationRequest(
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
                toast.error('Validation was not successful as use presentation')
                handleResetWalletCache()
              } else {
                cacheVerifierSessionId(
                  asset.id,
                  service.id,
                  exchangeStateData.sessionId
                )
                onVerified?.()
              }
            } catch (error) {
              handleResetWalletCache()
              toast.error('Validation was not successful')
            }
            setExchangeStateData(newExchangeStateData())
            setCheckCredentialState(CheckCredentialState.Stop)
            break
          }

          case CheckCredentialState.AbortSelection: {
            setExchangeStateData(newExchangeStateData())
            setCheckCredentialState(CheckCredentialState.Stop)
            break
          }
        }
      } catch (error) {
        let details = ''
        if (typeof error?.message === 'string') details = error.message
        else if (error?.message?.error) details = error.message.error
        else if (error?.data?.message?.error) details = error.data.message.error
        else if (typeof error?.data?.message === 'string')
          details = error.data.message
        else details = 'Unknown error'

        const errorMessage = `SSI credential validation was not successful: ${details}`
        setError(errorMessage)
        setCheckCredentialState(CheckCredentialState.Stop)
        handleResetWalletCache()
        onError?.()
      }
    }

    handleCredentialExchange().catch((error) => {
      setExchangeStateData(newExchangeStateData())
      setCheckCredentialState(CheckCredentialState.Stop)

      let details = ''
      if (error?.data?.message?.error) details = error.data.message.error
      else if (typeof error?.data?.message === 'string')
        details = error.data.message
      else if (typeof error?.message === 'string') details = error.message
      else details = 'An error occurred'

      setError(details)

      if (error?.data?.message) {
        LoggerInstance.error(error?.data?.message)
      } else if (error?.message) {
        LoggerInstance.error(error?.message)
      }

      onError?.()
    })
  }, [
    checkCredentialState,
    asset,
    accountId,
    service.id,
    selectedWallet,
    sessionToken
  ])

  function handleAcceptCredentialSelection(selectedCredential: string[]) {
    exchangeStateData.selectedCredentials = selectedCredential
    setExchangeStateData(exchangeStateData)
    setCheckCredentialState(CheckCredentialState.ReadDids)
  }

  function handleAcceptDidSelection(selectedDid: SsiWalletDid) {
    exchangeStateData.selectedDid = selectedDid.did
    setExchangeStateData(exchangeStateData)
    setCheckCredentialState(CheckCredentialState.ResolveCredentials)
  }

  function getLoaderMessage() {
    const assetName = asset.credentialSubject?.metadata?.name || 'asset'
    const serviceName = service.name || 'service'

    if (error) {
      return error
    }

    if (isRetrying) {
      return `Retrying credential check for ${assetName}...`
    }

    switch (checkCredentialState) {
      case CheckCredentialState.StartCredentialExchange:
        return `Connecting to policy server for ${assetName}...`
      case CheckCredentialState.ReadDids:
        return `Selecting credentials for ${serviceName}...`
      case CheckCredentialState.ResolveCredentials:
        return `Verifying access to ${assetName}...`
      default:
        return `Checking credentials for ${assetName}...`
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
      <VpSelector
        setShowDialog={setShowVpDialog}
        showDialog={showVpDialog}
        acceptSelection={handleAcceptCredentialSelection}
        abortSelection={() =>
          setCheckCredentialState(CheckCredentialState.AbortSelection)
        }
        ssiVerifiableCredentials={exchangeStateData.verifiableCredentials}
        assetAllowCredentials={asset.credentialSubject?.credentials?.allow}
        asset={asset}
        service={service}
      />
      <DidSelector
        setShowDialog={setShowDidDialog}
        showDialog={showDidDialog}
        acceptSelection={handleAcceptDidSelection}
        abortSelection={() =>
          setCheckCredentialState(CheckCredentialState.AbortSelection)
        }
        dids={exchangeStateData.dids}
      />
      {!showVpDialog && !showDidDialog && (
        <div className={styles.buttonWrapper}>
          {checkCredentialState !== CheckCredentialState.Stop ? (
            <div className={styles.loaderContainer}>
              <Loader message={getLoaderMessage()} variant="primary" />
              {error && (
                <>
                  <div className={styles.marginTop1}>
                    <Alert state="error" text={error} />
                  </div>
                  <Button
                    type="button"
                    onClick={handleRetry}
                    style="publish"
                    className={styles.retryButton}
                  >
                    Retry
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {error ? (
                error.toLowerCase()?.includes('missing required fields') ? (
                  <div className={styles.walletWarning}>
                    <div className={styles.walletWarningAlert}>
                      <Alert
                        state="warning"
                        text="No credentials found for this wallet. Switch SSI wallet to one that holds the required credentials."
                      />
                    </div>
                    <div className={styles.leftAlign}>
                      <Button
                        type="button"
                        style="primary"
                        onClick={() => setShowSsiWalletModule(true)}
                      >
                        Switch SSI Wallet
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.marginTop1}>
                      <Alert state="error" text={error} />
                    </div>
                    <Button
                      type="button"
                      onClick={handleRetry}
                      style="publish"
                      className={styles.retryButton}
                    >
                      Retry
                    </Button>
                  </>
                )
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    if (!selectedWallet?.id) {
                      setShowSsiWalletModule(true)
                      return
                    }
                    setCheckCredentialState(
                      CheckCredentialState.StartCredentialExchange
                    )
                  }}
                  style="publish"
                  disabled={
                    !showVpDialog &&
                    !showDidDialog &&
                    checkCredentialState === CheckCredentialState.Stop &&
                    requiredCredentials?.length > 0 &&
                    !requiredCredentials?.some((c) =>
                      isCredentialCached(cachedCredentials, c)
                    )
                  }
                >
                  Check Credentials
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {(() => {
        const hasAnyCached = requiredCredentials?.some((c) =>
          isCredentialCached(cachedCredentials, c)
        )
        const showMissingWarning =
          !showVpDialog &&
          !showDidDialog &&
          checkCredentialState === CheckCredentialState.Stop &&
          requiredCredentials?.length > 0 &&
          !hasAnyCached &&
          !error
        const showVerifiedRibbon =
          !showVpDialog &&
          !showDidDialog &&
          checkCredentialState === CheckCredentialState.Stop &&
          requiredCredentials?.length > 0 &&
          hasAnyCached &&
          !error

        if (showMissingWarning) return null

        if (!requiredCredentials?.length) return null

        return (
          <div
            className={`${styles.panelGrid} ${styles.panelTemplateData} ${styles.marginTop1}`}
          >
            {requiredCredentials
              ?.sort((credential1, credential2) =>
                credential1.localeCompare(credential2)
              )
              .map((credential) => {
                return (
                  <Fragment key={credential}>
                    {isCredentialCached(cachedCredentials, credential) ? (
                      <VerifiedPatch
                        key={credential}
                        className={`${styles.marginTop6px} ${styles.fillGreen}`}
                      />
                    ) : (
                      <div
                        key={credential}
                        className={`${styles.marginTop6px} ${styles.fillRed}`}
                      ></div>
                    )}
                    {credential}
                  </Fragment>
                )
              })}
            {showVerifiedRibbon && (
              <div className={styles.marginTop1}>
                <Alert state="success" text="Credentials verified." />
              </div>
            )}
          </div>
        )
      })()}
      {!showVpDialog &&
        !showDidDialog &&
        checkCredentialState === CheckCredentialState.Stop &&
        requiredCredentials?.length > 0 &&
        !requiredCredentials.some((c) =>
          isCredentialCached(cachedCredentials, c)
        ) &&
        !error && (
          <div className={styles.marginTop1}>
            <Alert
              state="warning"
              text="No required credentials found in your SSI wallet. Obtain the listed credentials, then press Check Credentials again."
            />
          </div>
        )}
    </div>
  )
}

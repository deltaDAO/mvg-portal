import React, { useEffect } from 'react'
import Button from '@components/@shared/atoms/Button'
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
    setIsCheckingCredentials
  } = useCredentialDialog()

  const {
    cacheVerifierSessionId,
    selectedWallet,
    ssiWalletCache,
    cachedCredentials,
    setCachedCredentials,
    sessionToken
  } = useSsiWallet()

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
              exchangeStateData.verifiableCredentials = resultCachedCredentials
              exchangeStateData.selectedCredentials = resultCachedCredentials
              setCheckCredentialState(CheckCredentialState.ReadDids)
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
              handleResetWalletCache()
              toast.error('Validation was not successful')
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

        setCredentialError(errorMessage)
        setIsCheckingCredentials(false)
        toast.error(errorMessage)
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

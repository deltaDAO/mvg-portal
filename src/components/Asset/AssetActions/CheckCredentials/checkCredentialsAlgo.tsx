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
  type
}: {
  asset: Asset
  service: Service
  type?: string
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
    setShowDidDialog
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
    // ssiWalletCache.clearCredentials()
    // setCachedCredentials(undefined)
    // clearVerifierSessionCache()
  }

  useEffect(() => {
    async function handleCredentialExchange() {
      try {
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
                // toast.info('No more credentials found in your ssi wallet')
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
            if (selectedCredentials.length > 0) {
              setCachedCredentials(selectedCredentials)
            }
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
                toast.error('Validation was not successful as use presentation')
                handleResetWalletCache()
              } else {
                cacheVerifierSessionId(
                  asset.id,
                  service.id,
                  exchangeStateData.sessionId
                )
              }
            } catch (error) {
              handleResetWalletCache()
              toast.error('Validation was not successful')
            }
            setExchangeStateData({
              ...exchangeStateData,
              ...newExchangeStateData()
            })
            setCheckCredentialState(CheckCredentialState.Stop)
            break
          }

          case CheckCredentialState.AbortSelection: {
            setExchangeStateData(newExchangeStateData())
            setCheckCredentialState(CheckCredentialState.Stop)
            break
          }
        }
      } catch (error: any) {
        console.log(error)
        toast.error(
          error?.message
            ? `SSI credential validation was not succesful: ${error.message}`
            : 'An error occurred during SSI credential validation. Please check the console'
        )
        handleResetWalletCache()
      }
    }
    handleCredentialExchange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className={styles.buttonWrapper}>
        <Button
          type="button"
          style="primary"
          onClick={() =>
            setCheckCredentialState(
              CheckCredentialState.StartCredentialExchange
            )
          }
          disabled={!selectedWallet?.id}
        >
          {type === 'dataset'
            ? 'Check Dataset Credentials'
            : 'Check Algorithm Credentials'}
        </Button>
      </div>
      <div
        className={`${styles.panelGrid} ${styles.panelTemplateData} ${styles.marginTop1}`}
      >
        {requiredCredentials?.map((cred) => (
          <React.Fragment key={cred}>
            <div className={`${styles.marginTop6px} ${styles.fillGreen}`} />
            {cred}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

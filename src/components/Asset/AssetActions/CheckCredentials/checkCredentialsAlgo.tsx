import React, { useEffect, useState } from 'react'
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

enum CheckCredentialState {
  Stop = 'Stop',
  StartCredentialExchange = 'StartCredentialExchange',
  ReadDids = 'ReadDids',
  ResolveCredentials = 'ResolveCredentials',
  AbortSelection = 'AbortSelection'
}

interface ExchangeStateData {
  openid4vp: string
  verifiableCredentials: any[]
  selectedCredentials: any[]
  sessionId: string
  dids: SsiWalletDid[]
  selectedDid: string
  poliyServerData: any
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

export function AssetActionCheckCredentialsAlgo({
  asset,
  service
}: {
  asset: Asset
  service: Service
}) {
  const { address: accountId } = useAccount()
  console.log('reset stop')

  const [checkCredentialState, setCheckCredentialState] =
    useState<CheckCredentialState>(CheckCredentialState.Stop)
  const [requiredCredentials, setRequiredCredentials] = useState<string[]>([])

  const [exchangeStateData, setExchangeStateData] = useState<ExchangeStateData>(
    newExchangeStateData()
  )

  const [showVpDialog, setShowVpDialog] = useState<boolean>(false)
  const [showDidDialog, setShowDidDialog] = useState<boolean>(false)

  const {
    cacheVerifierSessionId,
    selectedWallet,
    ssiWalletCache,
    cachedCredentials,
    setCachedCredentials,
    sessionToken,
    clearVerifierSessionCache
  } = useSsiWallet()

  function handleResetWalletCache() {
    ssiWalletCache.clearCredentials()
    setCachedCredentials(undefined)
    clearVerifierSessionCache()
  }

  useEffect(() => {
    async function handleCredentialExchange() {
      try {
        console.log('[State] checkCredentialState:', checkCredentialState)
        switch (checkCredentialState) {
          case CheckCredentialState.StartCredentialExchange: {
            console.log('[Step] requestCredentialPresentation...')
            const presentationResult = await requestCredentialPresentation(
              asset,
              accountId,
              service.id
            )
            console.log(
              '[Step] requestCredentialPresentation result:',
              presentationResult
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
              console.log(
                '[Step] Already success, caching verifier session id:',
                id
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
            console.log(
              '[Step] Required credentials:',
              resultRequiredCredentials
            )
            setRequiredCredentials(resultRequiredCredentials)

            const resultCachedCredentials = ssiWalletCache.lookupCredentials(
              asset.id,
              resultRequiredCredentials
            )
            console.log('[Step] Cached credentials:', resultCachedCredentials)
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
                (credential) => credential.parsedDocument.id
              )

              exchangeStateData.verifiableCredentials =
                exchangeStateData.verifiableCredentials.filter(
                  (credential) =>
                    !cachedCredentialsIds.includes(credential.parsedDocument.id)
                )
              console.log(
                '[Step] verifiableCredentials after filter:',
                exchangeStateData.verifiableCredentials
              )
              if (exchangeStateData.verifiableCredentials.length > 0) {
                setShowVpDialog(true)
              } else {
                toast.info('No more credentials found in your ssi wallet')
                setCheckCredentialState(CheckCredentialState.ReadDids)
              }
            } else {
              // All required credentials are already cached. Use objects everywhere!
              exchangeStateData.verifiableCredentials = resultCachedCredentials
              exchangeStateData.selectedCredentials = resultCachedCredentials
              console.log(
                '[Step] All credentials are cached, moving to ReadDids',
                {
                  selectedCredentials: exchangeStateData.selectedCredentials,
                  verifiableCredentials: exchangeStateData.verifiableCredentials
                }
              )
              setCheckCredentialState(CheckCredentialState.ReadDids)
            }

            setExchangeStateData({ ...exchangeStateData })
            console.log('break')
            break
          }

          case CheckCredentialState.ReadDids: {
            console.log('[Step] ReadDids')

            // Use the full objects for selectedCredentials, fallback to cached
            let { selectedCredentials } = exchangeStateData

            // fallback: use verifiableCredentials if selectedCredentials are empty
            if (!selectedCredentials || selectedCredentials.length === 0) {
              selectedCredentials = exchangeStateData.verifiableCredentials
            }
            // fallback: use cachedCredentials if still empty
            if (!selectedCredentials || selectedCredentials.length === 0) {
              selectedCredentials = cachedCredentials
            }

            // Log what you have
            console.log(
              '[Step] selectedCredentials after fallback:',
              selectedCredentials
            )

            if (!selectedCredentials || selectedCredentials.length === 0) {
              toast.error('You must select at least one credential to present')
              console.log('stop 1')
              setCheckCredentialState(CheckCredentialState.Stop)
              break
            }

            // Save as objects (not ids)
            ssiWalletCache.cacheCredentials(asset.id, selectedCredentials)
            setCachedCredentials(selectedCredentials)

            exchangeStateData.dids = await getWalletDids(
              selectedWallet.id,
              sessionToken.token
            )
            console.log('[Step] resolved DIDs:', exchangeStateData.dids)

            exchangeStateData.selectedDid =
              exchangeStateData.dids.length > 0
                ? exchangeStateData.dids[0].did
                : ''

            setExchangeStateData({ ...exchangeStateData })
            setShowDidDialog(true)
            break
          }

          case CheckCredentialState.ResolveCredentials: {
            console.log('[Step] ResolveCredentials')
            const resolvedPresentationRequest =
              await resolvePresentationRequest(
                selectedWallet?.id,
                exchangeStateData.openid4vp,
                sessionToken.token
              )

            try {
              console.log('before here')
              const result = await sendPresentationRequest(
                selectedWallet?.id,
                exchangeStateData.selectedDid,
                resolvedPresentationRequest,
                // Now pass just the ids:
                exchangeStateData.selectedCredentials.map(
                  (cred) => cred.parsedDocument.id
                ),
                sessionToken.token
              )
              console.log('[Step] sendPresentationRequest result:', result)
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
            setExchangeStateData(newExchangeStateData())
            console.log('stop 2')
            setCheckCredentialState(CheckCredentialState.Stop)
            break
          }

          case CheckCredentialState.AbortSelection: {
            console.log('[Step] AbortSelection')
            setExchangeStateData(newExchangeStateData())
            console.log('stop 3')
            setCheckCredentialState(CheckCredentialState.Stop)
            break
          }
        }
      } catch (error: any) {
        console.log('[Error] handleCredentialExchange', error)
        if (error?.message) {
          toast.error(
            `SSI credential validation was not succesful: ${error.message}`
          )
        } else {
          toast.error(
            'An error occurred during SSI credential validation. Please check the console'
          )
        }
        handleResetWalletCache()
      }
    }

    handleCredentialExchange().catch((err) => {
      console.log('[Error] handleCredentialExchange.catch', err)
      setExchangeStateData(newExchangeStateData())
      console.log('stop 4')
      setCheckCredentialState(CheckCredentialState.Stop)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkCredentialState])

  function handleAcceptCredentialSelection(selectedCredentials: any[]) {
    console.log(
      '[Action] handleAcceptCredentialSelection:',
      selectedCredentials
    )
    exchangeStateData.selectedCredentials = selectedCredentials
    setExchangeStateData({ ...exchangeStateData })
    setCheckCredentialState(CheckCredentialState.ReadDids)
  }

  function handleAcceptDidSelection(selectedDid: SsiWalletDid) {
    console.log('[Action] handleAcceptDidSelection:', selectedDid)
    exchangeStateData.selectedDid = selectedDid.did
    setExchangeStateData({ ...exchangeStateData })
    setCheckCredentialState(CheckCredentialState.ResolveCredentials)
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
          Check Credentials
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

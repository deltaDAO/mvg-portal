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
import { useEffect, useState } from 'react'
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
import appConfig from 'app.config.cjs'

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

export function AssetActionCheckCredentials({
  asset,
  service,
  onVerified
}: {
  asset: Asset
  service: Service
  onVerified?: () => void
}) {
  console.log('AssetActionCheckCredentials component rendered')
  const { address: accountId } = useAccount()

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
    clearVerifierSessionCache()
    setCachedCredentials([])
  }

  // Debug logging for SSI wallet state
  useEffect(() => {
    console.log('SSI Wallet Debug State:')
    console.log('- selectedWallet:', selectedWallet)
    console.log('- sessionToken:', sessionToken)
    console.log('- checkCredentialState:', checkCredentialState)
    console.log('- appConfig.ssiEnabled:', appConfig.ssiEnabled)
  }, [selectedWallet, sessionToken, checkCredentialState])

  // Test useEffect to see if useEffect works at all
  useEffect(() => {
    console.log(
      'TEST: useEffect is working, checkCredentialState changed to:',
      checkCredentialState
    )
  }, [checkCredentialState])

  useEffect(() => {
    console.log(
      'useEffect triggered with checkCredentialState:',
      checkCredentialState
    )
    async function handleCredentialExchange() {
      try {
        console.log(
          'handleCredentialExchange called with state:',
          checkCredentialState
        )
        switch (checkCredentialState) {
          case CheckCredentialState.StartCredentialExchange: {
            console.log('Starting credential presentation request...')
            console.log('Asset:', asset)
            console.log('AccountId:', accountId)
            console.log('Service ID:', service.id)
            let presentationResult
            try {
              presentationResult = await requestCredentialPresentation(
                asset,
                accountId,
                service.id
              )
              console.log('Presentation result:', presentationResult)
            } catch (error) {
              console.error('Error in requestCredentialPresentation:', error)
              throw error
            }
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

            // Check if we have a valid presentation result
            if (!presentationResult || !presentationResult.openid4vc) {
              console.error('No presentation result or openid4vc URL received')
              console.log('Full presentation result:', presentationResult)
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
        if (error.message) {
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

    handleCredentialExchange().catch((error) => {
      setExchangeStateData(newExchangeStateData())
      setCheckCredentialState(CheckCredentialState.Stop)

      if (error?.data?.message) {
        LoggerInstance.error(error?.data?.message)
      } else if (error?.message) {
        LoggerInstance.error(error?.message)
      }

      toast.error('An error occurred')
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
      {!showVpDialog && !showDidDialog && (
        <div className={styles.buttonWrapper}>
          <Button
            type="button"
            onClick={() => {
              console.log('Check Credentials button clicked')
              console.log('selectedWallet:', selectedWallet)
              console.log('selectedWallet?.id:', selectedWallet?.id)
              console.log('checkCredentialState:', checkCredentialState)
              setCheckCredentialState(
                CheckCredentialState.StartCredentialExchange
              )
            }}
            disabled={!selectedWallet?.id}
            style="publish"
          >
            Check Credentials
          </Button>
        </div>
      )}
    </div>
  )
}

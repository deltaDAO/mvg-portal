/* eslint-disable camelcase */
import Button from '@components/@shared/atoms/Button'
import { useSsiWallet } from '@context/SsiWallet'
import { LoggerInstance } from '@oceanprotocol/lib'
import { requestCredentialPresentation } from '@utils/wallet/policyServer'
import {
  extractURLSearchParams,
  requestPresentationDefinition,
  matchCredentialForPresentationDefinition,
  getWalletDids,
  resolvePresentationRequest,
  usePresentationRequest
} from '@utils/wallet/ssiWallet'
import { useEffect, useState } from 'react'
import { AssetExtended } from 'src/@types/AssetExtended'
import { SsiVerifiableCredential, SsiWalletDid } from 'src/@types/SsiWallet'
import { VpSelector } from '../VpSelector'
import { DidSelector } from '../DidSelector'

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
}

function newExchangeStateData(): ExchangeStateData {
  return {
    openid4vp: '',
    verifiableCredentials: [],
    sessionId: '',
    selectedCredentials: [],
    dids: [],
    selectedDid: ''
  }
}

export function AssetActionCheckCredentials({
  asset
}: {
  asset: AssetExtended
}) {
  const [checkCredentialState, setCheckCredentialState] =
    useState<CheckCredentialState>(CheckCredentialState.Stop)

  const [exchangeStateData, setExchangeStateData] = useState<ExchangeStateData>(
    newExchangeStateData()
  )

  const [showVpDialog, setShowVpDialog] = useState<boolean>(false)
  const [showDidDialog, setShowDidDialog] = useState<boolean>(false)

  const {
    verifierSessionId,
    setVerifierSessionId,
    selectedWallet,
    selectedKey
  } = useSsiWallet()

  useEffect(() => {
    async function handleCredentialExchange() {
      switch (checkCredentialState) {
        case CheckCredentialState.StartCredentialExchange: {
          console.log(CheckCredentialState.StartCredentialExchange)
          exchangeStateData.openid4vp = await requestCredentialPresentation(
            asset
          )

          const searchParams = extractURLSearchParams(
            exchangeStateData.openid4vp
          )
          const { presentation_definition_uri, state } = searchParams
          exchangeStateData.sessionId = state

          const presentationDefinition = await requestPresentationDefinition(
            presentation_definition_uri
          )

          exchangeStateData.verifiableCredentials =
            await matchCredentialForPresentationDefinition(
              selectedWallet?.id,
              presentationDefinition
            )

          setShowVpDialog(true)
          setExchangeStateData(exchangeStateData)
          break
        }

        case CheckCredentialState.ReadDids: {
          console.log(CheckCredentialState.ReadDids)
          exchangeStateData.selectedCredentials =
            exchangeStateData.verifiableCredentials.map((credential) => {
              return credential.id
            })

          exchangeStateData.dids = await getWalletDids(selectedWallet.id)
          exchangeStateData.selectedDid =
            exchangeStateData.dids.length > 0
              ? exchangeStateData.dids[0].did
              : ''

          setShowDidDialog(true)
          setExchangeStateData(exchangeStateData)
          break
        }

        case CheckCredentialState.ResolveCredentials: {
          console.log(CheckCredentialState.ResolveCredentials)
          const resolvedPresentationRequest = await resolvePresentationRequest(
            selectedWallet?.id,
            exchangeStateData.openid4vp
          )

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const result = await usePresentationRequest(
            selectedWallet?.id,
            exchangeStateData.selectedDid,
            resolvedPresentationRequest,
            exchangeStateData.selectedCredentials
          )

          if (result.success) {
            // setVerifierSessionId(exchangeStateData.sessionId)
            console.log('success')
          }

          setExchangeStateData(newExchangeStateData())
          setCheckCredentialState(CheckCredentialState.Stop)
          break
        }

        case CheckCredentialState.AbortSelection: {
          console.log(CheckCredentialState.AbortSelection)
          setVerifierSessionId(undefined)
          setExchangeStateData(newExchangeStateData())
          setCheckCredentialState(CheckCredentialState.Stop)
          break
        }
      }
    }

    handleCredentialExchange().catch((error) => {
      setVerifierSessionId(undefined)
      setExchangeStateData(newExchangeStateData())
      setCheckCredentialState(CheckCredentialState.Stop)
      LoggerInstance.error(error)
    })
  }, [checkCredentialState, setCheckCredentialState])

  return (
    <div style={{ textAlign: 'left', marginTop: '2%' }}>
      <div style={{ textAlign: 'center' }}>
        <VpSelector
          setShowDialog={setShowVpDialog}
          showDialog={showVpDialog}
          acceptSelection={() =>
            setCheckCredentialState(CheckCredentialState.ReadDids)
          }
          abortSelection={() =>
            setCheckCredentialState(CheckCredentialState.AbortSelection)
          }
          ssiVerifiableCredentials={exchangeStateData.verifiableCredentials}
        />
        <DidSelector
          setShowDialog={setShowDidDialog}
          showDialog={showDidDialog}
          acceptSelection={() =>
            setCheckCredentialState(CheckCredentialState.ResolveCredentials)
          }
          abortSelection={() =>
            setCheckCredentialState(CheckCredentialState.AbortSelection)
          }
        />
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
    </div>
  )
}

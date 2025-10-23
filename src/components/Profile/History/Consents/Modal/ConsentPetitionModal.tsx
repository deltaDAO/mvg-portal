import Loader from '@components/@shared/atoms/Loader'
import { useModalContext } from '@components/@shared/Modal'
import { useCreateAssetConsent, useHealthcheck } from '@hooks/useUserConsents'
import IconAlgorithm from '@images/algorithm.svg'
import IconTransaction from '@images/transaction.svg'
import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { Suspense, useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import AssetInput from './Components/AssetInput'
import RequestsList from './Components/RequestsList'
import Sections from './Components/Sections'
import { useNetwork } from 'wagmi'

interface Props {
  asset: Asset
}

function ConsentPetitionModal({ asset }: Props) {
  useHealthcheck()
  const { chain } = useNetwork()
  const { closeModal } = useModalContext()
  const { mutateAsync: createConsent } = useCreateAssetConsent()
  const [selected, setSelected] = useState<Asset>()

  const handleSubmit = useCallback(
    (reason: string, request: PossibleRequests) => {
      const consent = {
        chainId: chain.id,
        datasetDid: asset.id,
        algorithmDid: selected.id,
        request,
        reason
      }

      createConsent(consent, {
        onSuccess: () => {
          closeModal()
          toast.success('Consent petition created successfully')
        }
      })
    },
    [asset.id, chain.id, closeModal, createConsent, selected]
  )

  return (
    <Suspense fallback={<Loader />}>
      <Sections>
        <Sections.Section
          title="Algorithm"
          description="What algorithm do you want to access this asset with?"
          icon={<IconAlgorithm />}
        >
          <AssetInput asset={asset} setAlgorithm={setSelected} />
        </Sections.Section>
        {selected && (
          <Sections.Section
            title="Requests"
            description="Ask for what you need and provide a short reason"
            icon={<IconTransaction />}
          >
            <RequestsList
              dataset={asset}
              algorithm={selected}
              handleSubmit={handleSubmit}
            />
          </Sections.Section>
        )}
      </Sections>
    </Suspense>
  )
}

export default ConsentPetitionModal

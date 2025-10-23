import AssetProvider from '@context/Asset'
import { useAutoSigner } from '@hooks/useAutoSigner'
import { useCurrentConsent } from '@hooks/useCurrentConsent'
import { useListConsent } from '@hooks/useListConsent'
import IconCompute from '@images/compute.svg'
import IconLock from '@images/lock.svg'
import IconTransaction from '@images/transaction.svg'
import { isPending } from '@utils/consents/utils'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import ConsentResponse from '../Components/ConsentResponse'
import DetailedAsset from '../Components/DetailedAsset'
import Reason from '../Components/Reason'
import { FullRequests } from '../Components/Requests'
import Sections from '../Components/Sections'
import Solicitor from '../Components/Solicitor'
import styles from './index.module.css'

function InspectConsentsModal() {
  const { address } = useAccount()
  const { signer } = useAutoSigner()

  const [chainId, setChainId] = useState(0)
  const { currentConsent: consent } = useCurrentConsent()

  const {
    datasetQuery: { data: dataset },
    algorithmQuery: { data: algorithm }
  } = useListConsent(consent)

  useEffect(() => {
    const updateChainId = async () => {
      if (!signer) return
      setChainId(await signer.getChainId())
    }
    updateChainId()
  }, [signer])

  const isOwner = dataset.nft.owner === address
  const isInteractive = isOwner && isPending(consent)
  const isShowResponse = !isPending(consent) || isOwner

  const renderResponse = isShowResponse && (
    <ConsentResponse>
      {isInteractive ? (
        <AssetProvider did={dataset.id}>
          <ConsentResponse.InteractiveResponseForm
            chainId={chainId}
            consent={consent}
            dataset={dataset}
            algorithm={algorithm}
          />
        </AssetProvider>
      ) : (
        <>
          <Reason>{consent.response?.reason}</Reason>
          {consent.response &&
          Object.values(consent.response?.permitted).some((value) => value) ? (
            <ConsentResponse.ResponsePermissions
              permitted={consent.response?.permitted}
              dataset={dataset}
              algorithm={algorithm}
            >
              Grants permission to:
            </ConsentResponse.ResponsePermissions>
          ) : (
            <> </>
          )}
        </>
      )}
    </ConsentResponse>
  )

  return (
    <Sections>
      <Sections.Section
        icon={<IconCompute />}
        title="Assets"
        description="Assets involved in this consent, your dataset and the requested algorithm"
      >
        <DetailedAsset>
          <DetailedAsset.AssetInfo asset={dataset} />
        </DetailedAsset>
        <DetailedAsset>
          <DetailedAsset.AssetInfo asset={algorithm} />
        </DetailedAsset>
      </Sections.Section>
      <Sections.Section
        icon={<IconTransaction />}
        title="Requests"
        description="Requests made by the solicitor"
      >
        <Sections.Column className={styles.customGap}>
          <Solicitor
            address={consent.solicitor.address}
            createdAt={consent.created_at}
          />
          <Reason>{consent.reason}</Reason>
          <FullRequests
            requests={consent.request}
            dataset={dataset}
            algorithm={algorithm}
          >
            <span>Requests for:</span>
          </FullRequests>
        </Sections.Column>
      </Sections.Section>
      {isShowResponse && (
        <Sections.Section
          title="Response"
          icon={<IconLock></IconLock>}
          description={
            !isInteractive && <ConsentResponse.Status status={consent.status} />
          }
        >
          <Sections.Column className={styles.customGap}>
            {renderResponse}
          </Sections.Column>
        </Sections.Section>
      )}
    </Sections>
  )
}

export default InspectConsentsModal

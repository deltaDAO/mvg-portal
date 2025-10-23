import QueryBoundary from '@components/@shared/QueryBoundary'
import { useAccount } from 'wagmi'
import ConsentPetitionButton from './ConsentPetitionButton'
import IncomingPendingConsentsSimple from './IncomingPendingConsentsSimple'

interface Props {
  asset: AssetExtended
}

export default function AssetConsents({ asset }: Props) {
  const { address } = useAccount()

  if (address === asset.nft.owner) {
    return (
      <>
        <QueryBoundary text="Loading incoming consents">
          <IncomingPendingConsentsSimple asset={asset} />
        </QueryBoundary>
      </>
    )
  }

  if (!asset || asset.metadata?.algorithm) return null

  return (
    <QueryBoundary text="Checking connectivity">
      <ConsentPetitionButton asset={asset} />
    </QueryBoundary>
  )
}

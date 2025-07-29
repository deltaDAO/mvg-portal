import { ReactElement } from 'react'
import { AssetExtended } from 'src/@types/AssetExtended'

export default function Title({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  return (
    <div>
      <h1>
        Buy Dataset: {asset?.indexedMetadata?.nft?.name || 'Unknown Asset'}
      </h1>
    </div>
  )
}

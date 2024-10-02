import { ReactElement } from 'react'
import Button from '../atoms/Button'
import { downloadJSON } from '@utils/downloadJSON'

export default function DDODownloadButton({
  asset
}: {
  asset: any
}): ReactElement {
  return (
    <Button
      onClick={() => downloadJSON(asset, `${asset.metadata.name}_metadata`)}
      size="small"
    >
      Download DDO
    </Button>
  )
}

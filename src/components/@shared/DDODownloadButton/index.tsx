import { ReactElement } from 'react'
import Button from '../atoms/Button'

export default function DDODownloadButton({
  asset
}: {
  asset: any
}): ReactElement {
  const downloadJson = () => {
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(asset)], {
      type: 'application/json'
    })
    element.href = URL.createObjectURL(file)
    element.download = `${asset.metadata.name}_metadata.json`
    document.body.appendChild(element)
    element.click()
  }

  return <Button onClick={downloadJson}>Download DDO</Button>
}

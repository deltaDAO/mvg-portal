import { ReactElement } from 'react'
import Button from '../atoms/Button'

export default function DDODownloadButton({
  asset
}: {
  asset: any
}): ReactElement {
  // Download DDO as JSON
  const downloadJson = () => {
    const element = document.createElement('a') // Create a tag
    const file = new Blob([JSON.stringify(asset)], {
      type: 'application/json'
    }) // Create a file
    element.href = URL.createObjectURL(file) // Create a URL
    element.download = `${asset.metadata.name}_metadata.json` // Set the file name
    document.body.appendChild(element) // Append the tag to the body
    element.click() // Click the a element
  }

  return <Button onClick={downloadJson}>Download DDO</Button>
}

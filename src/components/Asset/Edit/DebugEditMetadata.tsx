import { Asset, Credentials, Metadata } from '@oceanprotocol/lib'
import { ReactElement, useEffect, useState } from 'react'
import DebugOutput from '@shared/DebugOutput'
import { MetadataEditForm } from './_types'
import { previewDebugPatch } from '@utils/ddo'
import { sanitizeUrl } from '@utils/url'
import {
  generateCredentials,
  transformConsumerParameters
} from '@components/Publish/_utils'

export default function DebugEditMetadata({
  values,
  asset
}: {
  values: MetadataEditForm
  asset: Asset
}): ReactElement {
  const [valuePreview, setValuePreview] = useState({})
  const [updatedAsset, setUpdatedAsset] = useState<Asset>()

  useEffect(() => {
    function transformValues() {
      const linksTransformed = values.links?.length &&
        values.links[0].valid && [sanitizeUrl(values.links[0].url)]

      const newMetadata: Metadata = {
        ...asset?.metadata,
        name: values.name,
        description: values.description,
        links: linksTransformed,
        author: values.author,
        tags: values.tags,
        license: values.license,
        additionalInformation: {
          ...asset?.metadata?.additionalInformation
        }
      }
      if (asset.metadata.type === 'algorithm') {
        newMetadata.algorithm.consumerParameters =
          !values.usesConsumerParameters
            ? undefined
            : transformConsumerParameters(values.consumerParameters)
      }

      const updatedCredentials: Credentials = generateCredentials(
        asset?.credentials,
        values?.allow,
        values?.deny
      )

      const tmpAsset: Asset = {
        ...asset,
        metadata: newMetadata,
        credentials: updatedCredentials
      }

      // delete custom helper properties injected in the market that will not be written on chain
      delete (tmpAsset as AssetExtended).accessDetails
      delete (tmpAsset as AssetExtended).datatokens
      delete (tmpAsset as AssetExtended).stats
      delete (tmpAsset as AssetExtended).offchain

      setUpdatedAsset(tmpAsset)
    }

    transformValues()
    setValuePreview(previewDebugPatch(values))
  }, [asset, values])

  return (
    <>
      <DebugOutput title="Collected Form Values" output={valuePreview} />
      <DebugOutput title="Transformed Asset Values" output={updatedAsset} />
    </>
  )
}

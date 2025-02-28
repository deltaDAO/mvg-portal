import { ReactElement, useEffect, useState } from 'react'
import DebugOutput from '@shared/DebugOutput'
import { MetadataEditForm } from './_types'
import { previewDebugPatch } from '@utils/ddo'
import { sanitizeUrl } from '@utils/url'
import {
  generateCredentials,
  transformConsumerParameters
} from '@components/Publish/_utils'
import { Asset } from 'src/@types/Asset'
import { Metadata } from 'src/@types/ddo/Metadata'
import { Credential } from 'src/@types/ddo/Credentials'
import { AssetExtended } from 'src/@types/AssetExtended'
import { convertLinks } from '@utils/links'

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
        ...asset?.credentialSubject?.metadata,
        name: values.name,
        description: {
          '@value': values.description,
          '@direction': '',
          '@language': ''
        },
        links: convertLinks(linksTransformed),
        author: values.author,
        tags: values.tags,
        license: values.license,
        additionalInformation: {
          ...asset?.credentialSubject?.metadata?.additionalInformation
        }
      }

      if (asset.credentialSubject?.metadata.type === 'algorithm') {
        newMetadata.algorithm.consumerParameters =
          !values.usesConsumerParameters
            ? undefined
            : transformConsumerParameters(values.consumerParameters)
      }

      const updatedCredentials: Credential = generateCredentials(
        values.credentials
      )

      const tmpAsset: Asset = {
        ...asset,
        credentialSubject: {
          ...asset.credentialSubject,
          metadata: newMetadata,
          credentials: updatedCredentials
        }
      }

      // delete custom helper properties injected in the market that will not be written on chain
      delete (tmpAsset as AssetExtended).accessDetails
      delete (tmpAsset as AssetExtended).views
      delete (tmpAsset as AssetExtended).offchain
      delete (tmpAsset as AssetExtended).credentialSubject.stats

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

import { Asset, Credentials, Metadata, Service } from '@oceanprotocol/lib'
import { ReactElement, useEffect, useState } from 'react'
import DebugOutput from '@shared/DebugOutput'
import { MetadataEditForm } from './_types'
import { mapTimeoutStringToSeconds, previewDebugPatch } from '@utils/ddo'
import { sanitizeUrl } from '@utils/url'
import {
  generateCredentials,
  transformConsumerParameters
} from '@components/Publish/_utils'

export default function DebugEditMetadata({
  values,
  asset
}: {
  values: Partial<MetadataEditForm>
  asset: Asset
}): ReactElement {
  const [valuePreview, setValuePreview] = useState({})
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
      ...asset?.metadata?.additionalInformation,
      gaiaXInformation: values.gaiaXInformation
    }
  }
  if (asset.metadata.type === 'algorithm') {
    newMetadata.algorithm.consumerParameters = !values.usesConsumerParameters
      ? undefined
      : transformConsumerParameters(values.consumerParameters)
  }

  const updatedService: Service = {
    ...asset?.services[0],
    timeout: mapTimeoutStringToSeconds(values.timeout)
  }
  if (values?.service?.consumerParameters) {
    updatedService.consumerParameters = transformConsumerParameters(
      values.service.consumerParameters
    )
  }

  const updatedCredentials: Credentials = generateCredentials(
    asset?.credentials,
    values?.allow,
    values?.deny
  )

  const updatedAsset: Asset = {
    ...asset,
    metadata: newMetadata,
    services: [updatedService],
    credentials: updatedCredentials
  }

  // delete custom helper properties injected in the market that will not be written on chain
  delete (updatedAsset as AssetExtended).accessDetails
  delete (updatedAsset as AssetExtended).datatokens
  delete (updatedAsset as AssetExtended).stats

  useEffect(() => {
    setValuePreview(previewDebugPatch(values, asset.chainId))
  }, [asset.chainId, values])

  return (
    <>
      <DebugOutput title="Collected Form Values" output={valuePreview} />
      <DebugOutput title="Transformed Asset Values" output={updatedAsset} />
    </>
  )
}

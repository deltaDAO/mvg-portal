import { LoggerInstance } from '@oceanprotocol/lib'
import { ReactElement, useEffect, useState } from 'react'
import DebugOutput from '@shared/DebugOutput'
import { useCancelToken } from '@hooks/useCancelToken'
import { transformComputeFormToServiceComputeOptions } from '@utils/compute'
import { ServiceEditForm } from './_types'
import {
  mapTimeoutStringToSeconds,
  normalizeFile,
  previewDebugPatch
} from '@utils/ddo'
import { getEncryptedFiles } from '@utils/provider'
import {
  generateCredentials,
  transformConsumerParameters
} from '@components/Publish/_utils'
import { Service } from 'src/@types/ddo/Service'
import { Asset } from 'src/@types/Asset'
import { Credential } from 'src/@types/ddo/Credentials'
import { State } from 'src/@types/ddo/State'
import { assetStateToNumber } from '@utils/assetState'

export default function DebugEditService({
  values,
  asset,
  service
}: {
  values: ServiceEditForm
  asset: Asset
  service: Service
}): ReactElement {
  const [valuePreview, setValuePreview] = useState({})
  const [updatedService, setUpdatedService] = useState<Service>()
  const newCancelToken = useCancelToken()

  useEffect(() => {
    async function transformValues() {
      let updatedFiles = service.files
      try {
        if (values.files[0]?.url) {
          const file = {
            nftAddress: asset.credentialSubject.nftAddress,
            datatokenAddress: service.datatokenAddress,
            files: [
              normalizeFile(
                values.files[0].type,
                values.files[0],
                asset.credentialSubject?.chainId
              )
            ]
          }

          const filesEncrypted = await getEncryptedFiles(
            file,
            asset.credentialSubject?.chainId,
            service.serviceEndpoint
          )
          updatedFiles = filesEncrypted
        }
      } catch (error) {
        LoggerInstance.error('Error encrypting files:', error.message)
      }
      const credentials: Credential = generateCredentials(values.credentials)
      const updatedService: Service = {
        ...service,
        name: values.name,
        description: {
          '@value': values.description,
          '@language': values.language,
          '@direction': values.direction
        },
        type: values.access,
        timeout: mapTimeoutStringToSeconds(values.timeout),
        state:
          values.state === undefined
            ? State.Active
            : assetStateToNumber(values.state),
        files: updatedFiles, // TODO: check if this works,
        credentials,
        ...(values.access === 'compute' &&
          asset.credentialSubject?.metadata?.type === 'dataset' && {
            compute: await transformComputeFormToServiceComputeOptions(
              values,
              service.compute,
              asset.credentialSubject?.chainId,
              newCancelToken()
            )
          })
      }
      if (values.consumerParameters) {
        updatedService.consumerParameters = transformConsumerParameters(
          values.consumerParameters
        )
      }
      setUpdatedService(updatedService)
    }

    transformValues()
    setValuePreview(previewDebugPatch(values))
  }, [values, asset, newCancelToken, service])

  return (
    <>
      <DebugOutput title="Collected Form Values" output={valuePreview} />
      <DebugOutput title="Transformed Service Values" output={updatedService} />
    </>
  )
}

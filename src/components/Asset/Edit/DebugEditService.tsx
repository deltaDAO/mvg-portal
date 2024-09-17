import { Asset, LoggerInstance, Service } from '@oceanprotocol/lib'
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
import { transformConsumerParameters } from '@components/Publish/_utils'

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
            nftAddress: asset.nftAddress,
            datatokenAddress: service.datatokenAddress,
            files: [
              normalizeFile(
                values.files[0].type,
                values.files[0],
                asset.chainId
              )
            ]
          }

          const filesEncrypted = await getEncryptedFiles(
            file,
            asset.chainId,
            service.serviceEndpoint
          )
          updatedFiles = filesEncrypted
        }
      } catch (error) {
        LoggerInstance.error('Error encrypting files:', error.message)
      }

      const updatedService: Service = {
        ...service,
        name: values.name,
        description: values.description,
        type: values.access,
        timeout: mapTimeoutStringToSeconds(values.timeout),
        files: updatedFiles, // TODO: check if this works
        ...(values.access === 'compute' && {
          compute: await transformComputeFormToServiceComputeOptions(
            values,
            service.compute,
            asset.chainId,
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

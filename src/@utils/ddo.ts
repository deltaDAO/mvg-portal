import FormEditMetadata from '@components/Asset/Edit/FormEditMetadata'
import {
  ComputeEditForm,
  MetadataEditForm
} from '@components/Asset/Edit/_types'
import { FormPublishData } from '@components/Publish/_types'
import {
  Arweave,
  Asset,
  DDO,
  GraphqlQuery,
  Ipfs,
  Service,
  Smartcontract,
  UrlFile
} from '@oceanprotocol/lib'

export function getServiceByName(
  ddo: Asset | DDO,
  name: 'access' | 'compute'
): Service {
  if (!ddo) return

  const service = ddo.services.filter((service) => service.type === name)[0]
  return service
}

export function getServiceById(ddo: Asset | DDO, serviceId: string): Service {
  if (!ddo) return

  const service = ddo.services.find((s) => s.id === serviceId)
  return service
}

export function mapTimeoutStringToSeconds(timeout: string): number {
  switch (timeout) {
    case 'Forever':
      return 0
    case '1 day':
      return 86400
    case '1 week':
      return 604800
    case '1 month':
      return 2630000
    case '1 year':
      return 31556952
    default:
      return 0
  }
}

function numberEnding(number: number): string {
  return number > 1 ? 's' : ''
}

export function secondsToString(numberOfSeconds: number): string {
  if (numberOfSeconds === 0) return 'Forever'

  const years = Math.floor(numberOfSeconds / 31536000)
  const months = Math.floor((numberOfSeconds %= 31536000) / 2630000)
  const weeks = Math.floor((numberOfSeconds %= 31536000) / 604800)
  const days = Math.floor((numberOfSeconds %= 604800) / 86400)
  const hours = Math.floor((numberOfSeconds %= 86400) / 3600)
  const minutes = Math.floor((numberOfSeconds %= 3600) / 60)
  const seconds = numberOfSeconds % 60

  return years
    ? `${years} year${numberEnding(years)}`
    : months
    ? `${months} month${numberEnding(months)}`
    : weeks
    ? `${weeks} week${numberEnding(weeks)}`
    : days
    ? `${days} day${numberEnding(days)}`
    : hours
    ? `${hours} hour${numberEnding(hours)}`
    : minutes
    ? `${minutes} minute${numberEnding(minutes)}`
    : seconds
    ? `${seconds} second${numberEnding(seconds)}`
    : 'less than a second'
}

export function normalizeFile(storageType: string, file: any, chainId: number) {
  let fileObj
  switch (storageType) {
    case 'ipfs': {
      fileObj = {
        type: storageType,
        hash: file[0]?.url || file?.url
      } as Ipfs
      break
    }
    case 'arweave': {
      fileObj = {
        type: storageType,
        transactionId: file[0]?.transactionId || file?.transactionId
      } as Arweave
      break
    }
    case 'graphql': {
      fileObj = {
        type: storageType,
        url: file[0]?.url || file?.url,
        query: file[0]?.query || file?.query
      } as GraphqlQuery
      break
    }
    case 'smartcontract': {
      // clean obj
      fileObj = {
        chainId,
        type: storageType,
        address: file[0]?.address || file?.address || file[0]?.url || file?.url,
        abi:
          file[0]?.abi || file?.abi
            ? JSON.parse(file[0]?.abi || file?.abi)
            : null
      } as Smartcontract
      break
    }
    default: {
      fileObj = {
        type: 'url',
        index: 0,
        url: file ? file[0]?.url || file?.url : null,
        method: 'get'
      } as UrlFile
      break
    }
  }
  return fileObj
}

export function previewDebugPatch(
  values: FormPublishData | Partial<MetadataEditForm> | ComputeEditForm
) {
  // handle file's object property dynamically
  // without braking Yup and type validation
  const buildValuesPreview = JSON.parse(JSON.stringify(values))
  const valuesService = buildValuesPreview.services
    ? buildValuesPreview.services[0]
    : buildValuesPreview
  normalizeFile(valuesService.files[0])

  return buildValuesPreview
}

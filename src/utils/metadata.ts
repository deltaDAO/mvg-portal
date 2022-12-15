import axios from 'axios'
import { toast } from 'react-toastify'
import isUrl from 'is-url-superb'
import {
  MetadataMarket,
  MetadataPublishFormDataset,
  MetadataPublishFormAlgorithm,
  ServiceSelfDescription
} from '../@types/MetaData'
import { toStringNoMS } from '.'
import AssetModel from '../models/Asset'
import slugify from '@sindresorhus/slugify'
import {
  DDO,
  MetadataAlgorithm,
  File,
  Logger,
  EditableMetadataLinks
} from '@oceanprotocol/lib'
import { complianceUri, complianceApiVersion } from '../../app.config'
import { isSanitizedUrl } from '../components/molecules/FormFields/URLInput/Input'
import { initialValues as initialValuesDataset } from '../models/FormPublish'
import { initialValues as initialValuesAlgorithm } from '../models/FormAlgoPublish'
import { publishFormKeys } from '../components/pages/Publish'

export function transformTags(value: string): string[] {
  const originalTags = value?.split(',')
  const transformedTags = originalTags?.map((tag) => slugify(tag).toLowerCase())
  return transformedTags
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

export function checkIfTimeoutInPredefinedValues(
  timeout: string,
  timeoutOptions: string[]
): boolean {
  if (timeoutOptions.indexOf(timeout) > -1) {
    return true
  }
  return false
}

function getAlgorithmComponent(
  image: string,
  containerTag: string,
  entrypoint: string,
  algorithmLanguace: string
): MetadataAlgorithm {
  return {
    language: algorithmLanguace,
    format: 'docker-image',
    version: '0.1',
    container: {
      entrypoint: entrypoint,
      image: image,
      tag: containerTag
    }
  }
}

function getAlgorithmFileExtension(fileUrl: string): string {
  const splitedFileUrl = fileUrl.split('.')
  return splitedFileUrl[splitedFileUrl.length - 1]
}

function sanitizeUrl(url: string): string {
  return url.replace(/javascript:/gm, '')
}

function sanitizeUrlArray<T extends File | EditableMetadataLinks>(
  array: T[]
): T[] {
  return [
    {
      ...array[0],
      url: sanitizeUrl(array[0].url)
    }
  ]
}

export function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase()
}

function getValidUrlArrayContent<T extends File | EditableMetadataLinks>(
  value: string | T[]
): T[] {
  return (
    typeof value !== 'string' && value?.length > 0 && sanitizeUrlArray(value)
  )
}

export function getComplianceApiVersion(context?: string[]): string {
  const latest = complianceApiVersion

  const allowedRegistryDomains = [
    'https://registry.gaia-x.eu/v2206',
    'https://registry.lab.gaia-x.eu/v2206'
  ]
  if (
    !context ||
    !context.length ||
    context.some(
      (e) => allowedRegistryDomains.findIndex((x) => e.startsWith(x)) !== -1
    )
  )
    return latest

  return '2204'
}

export async function signServiceSD(rawServiceSD: any): Promise<any> {
  if (!rawServiceSD) return
  try {
    const response = await axios.post(
      `${complianceUri}/v${getComplianceApiVersion()}/api/sign`,
      rawServiceSD
    )
    const signedServiceSD = {
      selfDescriptionCredential: { ...rawServiceSD },
      ...response.data
    }

    return signedServiceSD
  } catch (error) {
    Logger.error(error.message)
  }
}

export async function storeRawServiceSD(signedSD: {
  complianceCredentials: any
  selfDescriptionCredential: any
}): Promise<{
  verified: boolean
  storedSdUrl: string | undefined
}> {
  if (!signedSD) return { verified: false, storedSdUrl: undefined }

  const baseUrl = `${complianceUri}/v${getComplianceApiVersion()}/api/service-offering/verify/raw?store=true&verifyParticipant=false`
  try {
    const response = await axios.post(baseUrl, signedSD)
    if (response?.status === 409) {
      return {
        verified: false,
        storedSdUrl: undefined
      }
    }
    if (response?.status === 200) {
      return { verified: true, storedSdUrl: response.data.storedSdUrl }
    }

    return { verified: false, storedSdUrl: undefined }
  } catch (error) {
    Logger.error(error.message)
    return { verified: false, storedSdUrl: undefined }
  }
}

export async function verifyRawServiceSD(rawServiceSD: string): Promise<{
  verified: boolean
  complianceApiVersion?: string
  responseBody?: any
}> {
  if (!rawServiceSD) return { verified: false }

  const parsedServiceSD = JSON.parse(rawServiceSD)
  const complianceApiVersion = getComplianceApiVersion(
    parsedServiceSD?.selfDescriptionCredential?.['@context']
  )

  const versionedComplianceUri = `${complianceUri}/v${complianceApiVersion}/api`

  // skip participant verification for 22.04 service SDs
  const verifyParticipantOption = complianceApiVersion !== '2204'
  const baseUrl = `${versionedComplianceUri}/service-offering/verify/raw?verifyParticipant=false`

  try {
    const response = await axios.post(baseUrl, parsedServiceSD)
    if (response?.status === 409) {
      return {
        verified: false,
        responseBody: response.data.body
      }
    }
    if (response?.status === 200) {
      return { verified: true, complianceApiVersion }
    }

    return { verified: false }
  } catch (error) {
    Logger.error(error.message)
    return { verified: false }
  }
}

export async function getServiceSD(url: string): Promise<string> {
  if (!url) return

  try {
    const serviceSD = await axios.get(url)
    return JSON.stringify(serviceSD.data, null, 2)
  } catch (error) {
    Logger.error(error.message)
  }
}

export function getFormattedCodeString(parsedCodeBlock: any): string {
  const formattedString = JSON.stringify(parsedCodeBlock, null, 2)
  return `\`\`\`\n${formattedString}\n\`\`\``
}

export function updateServiceSelfDescription(
  ddo: DDO,
  serviceSelfDescription: ServiceSelfDescription
): DDO {
  const { raw, url } = serviceSelfDescription
  const metadataIndex = ddo.service.findIndex((e) => e.type === 'metadata')
  ddo.service[
    metadataIndex
  ].attributes.additionalInformation.serviceSelfDescription = { raw, url }

  return ddo
}

export async function getPublisherFromServiceSD(
  serviceSD: any
): Promise<string> {
  if (!serviceSD) return

  try {
    const parsedServiceSD =
      typeof serviceSD === 'string' ? JSON.parse(serviceSD) : serviceSD
    const providedBy =
      parsedServiceSD?.selfDescriptionCredential?.credentialSubject?.[
        'gx-service-offering:providedBy'
      ]
    const providedByUrl =
      typeof providedBy === 'string' ? providedBy : providedBy?.['@value']

    if (!isSanitizedUrl(providedByUrl)) return

    const response = await axios.get(providedByUrl)
    if (!response || response.status !== 200 || !response?.data) return

    const legalName =
      response.data?.selfDescriptionCredential?.credentialSubject?.[
        'gx-participant:legalName'
      ]
    const publisher =
      typeof legalName === 'string' ? legalName : legalName?.['@value']

    return publisher
  } catch (error) {
    Logger.error(error.message)
  }
}

export function getInitialPublishFormDatasetsValues(
  localStorageKey: publishFormKeys
): Partial<MetadataPublishFormDataset> {
  const initialValues =
    localStorageKey === publishFormKeys.FORM_NAME_DATASETS
      ? initialValuesDataset
      : initialValuesAlgorithm
  const localStorageValues =
    localStorage.getItem(localStorageKey) &&
    (JSON.parse(localStorage.getItem(localStorageKey))
      .initialValues as MetadataPublishFormDataset)

  return localStorageValues || initialValues
}

export function transformPublishFormToMetadata(
  {
    name,
    author,
    description,
    tags,
    links,
    termsAndConditions,
    noPersonalData,
    files,
    serviceSelfDescription
  }: Partial<MetadataPublishFormDataset>,
  ddo?: DDO
): MetadataMarket {
  const currentTime = toStringNoMS(new Date())

  const transformedLinks = getValidUrlArrayContent(links)

  const transformedServiceSelfDescription =
    typeof serviceSelfDescription === 'string'
      ? undefined
      : {
          url: serviceSelfDescription?.[0]?.url,
          raw: serviceSelfDescription?.[0]?.raw
        }

  const metadata: MetadataMarket = {
    main: {
      ...AssetModel.main,
      name,
      author,
      dateCreated: ddo ? ddo.created : currentTime,
      datePublished: '',
      files: getValidUrlArrayContent(files),
      license: 'https://market.oceanprotocol.com/terms'
    },
    additionalInformation: {
      ...AssetModel.additionalInformation,
      description,
      tags: transformTags(tags),
      links: transformedLinks,
      termsAndConditions,
      consent: {
        noPersonalData
      },
      serviceSelfDescription: transformedServiceSelfDescription
    }
  }

  return metadata
}

async function isDockerHubImageValid(
  image: string,
  tag: string
): Promise<boolean> {
  try {
    const response = await axios.post(
      `https://dockerhub-proxy.oceanprotocol.com`,
      {
        image,
        tag
      }
    )
    if (
      !response ||
      response.status !== 200 ||
      response.data.status !== 'success'
    ) {
      toast.error(
        'Could not fetch docker hub image info. Please check image name and tag and try again'
      )
      return false
    }

    return true
  } catch (error) {
    Logger.error(error.message)
    toast.error(
      'Could not fetch docker hub image info. Please check image name and tag and try again'
    )
    return false
  }
}

async function is3rdPartyImageValid(imageURL: string): Promise<boolean> {
  try {
    const response = await axios.head(imageURL)
    if (!response || response.status !== 200) {
      toast.error(
        'Could not fetch docker image info. Please check URL and try again'
      )
      return false
    }
    return true
  } catch (error) {
    Logger.error(error.message)
    toast.error(
      'Could not fetch docker image info. Please check URL and try again'
    )
    return false
  }
}

export async function validateDockerImage(
  dockerImage: string,
  tag: string
): Promise<boolean> {
  const isValid = isUrl(dockerImage)
    ? await is3rdPartyImageValid(dockerImage)
    : await isDockerHubImageValid(dockerImage, tag)
  return isValid
}

export function transformPublishAlgorithmFormToMetadata(
  {
    name,
    author,
    description,
    tags,
    image,
    containerTag,
    entrypoint,
    termsAndConditions,
    noPersonalData,
    files
  }: Partial<MetadataPublishFormAlgorithm>,
  ddo?: DDO
): MetadataMarket {
  const currentTime = toStringNoMS(new Date())
  const fileUrl = typeof files !== 'string' && sanitizeUrl(files[0].url)
  const algorithmLanguage = getAlgorithmFileExtension(fileUrl)
  const algorithm = getAlgorithmComponent(
    image,
    containerTag,
    entrypoint,
    algorithmLanguage
  )
  const metadata: MetadataMarket = {
    main: {
      ...AssetModel.main,
      name,
      type: 'algorithm',
      author,
      dateCreated: ddo ? ddo.created : currentTime,
      files: getValidUrlArrayContent(files),
      license: 'https://market.oceanprotocol.com/terms',
      algorithm
    },
    additionalInformation: {
      ...AssetModel.additionalInformation,
      description,
      tags: transformTags(tags),
      termsAndConditions,
      consent: {
        noPersonalData
      }
    }
  }

  return metadata
}

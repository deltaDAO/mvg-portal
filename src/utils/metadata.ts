import axios from 'axios'
import { toast } from 'react-toastify'
import isUrl from 'is-url-superb'
import {
  MetadataMarket,
  MetadataPublishFormDataset,
  MetadataPublishFormAlgorithm
} from '../@types/MetaData'
import { toStringNoMS } from '.'
import AssetModel from '../models/Asset'
import slugify from '@sindresorhus/slugify'
import {
  DDO,
  MetadataAlgorithm,
  File,
  Logger,
  EditableMetadata,
  EditableMetadataLinks
} from '@oceanprotocol/lib'

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

function getValidUrlArrayContent<T extends File | EditableMetadataLinks>(
  value: string | T[]
): T[] {
  return (
    typeof value !== 'string' && value?.length > 0 && sanitizeUrlArray(value)
  )
}

export async function verifySelfDescription(url: string): Promise<boolean> {
  if (!url) return false

  try {
    const response = await axios.post(
      'https://compliance.gaia-x.eu/api/v1/participant/verify',
      { url }
    )
    if (!response || response.status !== 200) {
      toast.error('Participant credential could not be verified.')
      return false
    }
    return true
  } catch (error) {
    Logger.error(error.message)
    toast.error(
      'There was an error trying to verify the provided self-description. Please check URL and try again'
    )
    return false
  }
}

export async function getSelfDescription(url: string): Promise<string> {
  if (!url) return

  try {
    const selfDescription = await axios.get(url)
    return JSON.stringify(selfDescription, null, 2)
  } catch (error) {
    Logger.error(error.message)
    toast.error('There was an error downloading the provided self-description.')
  }
}

export function transformPublishFormToMetadata(
  {
    name,
    author,
    description,
    tags,
    links,
    termsAndConditions,
    files,
    selfDescription
  }: Partial<MetadataPublishFormDataset>,
  ddo?: DDO
): MetadataMarket {
  const currentTime = toStringNoMS(new Date())

  const transformedLinks = getValidUrlArrayContent(links)

  const selfDescriptionUrl =
    typeof selfDescription === 'string' ? undefined : selfDescription[0].url

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
      selfDescription: selfDescriptionUrl
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
      termsAndConditions
    }
  }

  return metadata
}

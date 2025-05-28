import JSZipUtils from 'jszip-utils'
import JSZip from 'jszip'
import {
  RoadDamageImage,
  RoadDamageResult,
  RoadDamageResultWithImage
} from './_types'
import { CONFIDENCE_COLOR_MAP, ROAD_DAMAGE_RESULT_ZIP } from './_constants'
import { LoggerInstance } from '@oceanprotocol/lib'
import { RoadDamageUseCaseData } from '../../@context/UseCases/models/RoadDamage.model'
import randomColor from 'randomcolor'
import { createHash } from 'crypto'

export function getConfidenceColor(confidence: number) {
  // make sure array is sorted correctly for next find call
  const sorted = CONFIDENCE_COLOR_MAP.sort((a, b) => b.threshold - a.threshold)

  // return the first color found in sorted array where confidence > threshold
  return sorted.find((entry) => confidence > entry.threshold).color
}

export function getMapColor(inputDids: string[]): string {
  const joinedDids = inputDids.join()

  const seed = createHash('sha512').update(joinedDids).digest('base64')

  return randomColor({
    seed,
    luminosity: 'dark'
  })
}

export async function getResultBinaryData(url: string) {
  const resultData = await JSZipUtils.getBinaryContent(url)

  return resultData
}

export async function transformBinaryToRoadDamageResult(
  binary: any
): Promise<RoadDamageUseCaseData['result']> {
  let zip: JSZip
  let detectionsJSON: string

  const { detectionsFileName, imagesFolderName } = ROAD_DAMAGE_RESULT_ZIP

  try {
    zip = await JSZip.loadAsync(binary)

    LoggerInstance.log(`[RoadDamage]: unzipped result data:`, { zip })

    detectionsJSON = await zip.file(detectionsFileName).async('string')
  } catch (error) {
    LoggerInstance.error(
      `Could not unzip result. Format may mismatch the current configuration.`,
      error
    )
    return
  }

  let detections: RoadDamageResult[]
  try {
    detections = JSON.parse(detectionsJSON)
    console.dir(detections, { depth: null })
  } catch (error) {
    LoggerInstance.error(`Could parse result. Expected JSON file.`, error)
    return
  }

  const result: RoadDamageResultWithImage[] = []

  for (const detection of detections) {
    const { resultName, roadDamages } = detection
    const path = `${imagesFolderName}/${resultName}`

    try {
      const image: RoadDamageImage = {
        path,
        name: resultName,
        data: await zip.file(path).async('base64'),
        type: path.split('.').pop() // try getting filetype from image path
      }

      result.push({
        image,
        roadDamages
      })
    } catch (error) {
      LoggerInstance.error(
        `[RoadDamage]: could not load image at ${path}`,
        error
      )
    }
  }

  return result
}

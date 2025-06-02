import JSZipUtils from 'jszip-utils'
import JSZip from 'jszip'
// import {
//   RoadDamageImage,
//   RoadDamageResult,
//   RoadDamageResultWithImage
// } from './_types'

import { TEXT_ANALYSIS_RESULT_ZIP } from './_constants'
import { LoggerInstance } from '@oceanprotocol/lib'
import { TextAnalysisUseCaseData } from '../../@context/UseCases/models/TextAnalysis.model'

export async function getResultBinaryData(url: string) {
  const resultData = await JSZipUtils.getBinaryContent(url)

  return resultData
}

export async function transformBinaryToRoadDamageResult(
  binary: any
): Promise<TextAnalysisUseCaseData['result']> {
  let zip: JSZip
  let detectionsJSON: string

  const { detectionsFileName, imagesFolderName } = TEXT_ANALYSIS_RESULT_ZIP

  try {
    zip = await JSZip.loadAsync(binary)

    LoggerInstance.log(`[TextAnalysis]: unzipped result data:`, { zip })

    console.log(Object.keys(zip.files))

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

export interface RoadDamageMetadata {
  containedTypes: RoadDamageType[]
  amountOfRecords: number
  inputDataFormat: string
  outputDataFormat: 'json' | 'yaml'
  usedDataOntology: string
}

export interface RoadDamage {
  type: RoadDamageType
  damageClass: string
  lastObservation: string
  heading: string
  gpsCoordinates: GPSCoordinate
  confidence: number
}

export interface RoadDamageResult {
  resultName: string
  roadDamages: RoadDamage[]
}

export interface GPSCoordinate {
  lat: number
  lng: number
}

export type RoadDamageType = string

export interface RoadDamageImage {
  name: string
  path: string
  data: string
  type: string
}

/**
 * Used to display data in map view
 */
export interface RoadDamageResultWithImage {
  image: RoadDamageImage
  roadDamages: RoadDamage[]
}

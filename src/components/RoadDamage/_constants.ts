/**
 * Mapping of { chainId: useCaseAlgorithmDID }
 */
export const ROAD_DAMAGE_ALGO_DIDS = {
  32456:
    'did:op:926098d058b017dcf3736370f3c3d77e6046ca6622af111229accf5f9c83e308',
  32457:
    'did:op:60345a1cffaf69e978846858760f69ebe6688e3fa1b9a21f2cdb81b82c415049',
  100: 'did:op:aa8307d3ee38c3f200694479fbfad94b00c6d87293d0094d1ac46c9a4f7bed3c'
}

export const ROAD_DAMAGE_USECASE_NAME = 'roaddamage'

export const ROAD_DAMAGE_RESULT_ZIP = {
  fileName: 'result.zip',
  metadataFileName: 'metadata.json',
  detectionsFileName: 'detections.json',
  imagesFolderName: 'images'
}

export const CONFIDENCE_COLOR_MAP = [
  {
    threshold: 0.85,
    color: 'blue'
  },
  {
    threshold: 0.66,
    color: 'green'
  },
  {
    threshold: 0.5,
    color: 'orange'
  },
  {
    threshold: 0.33,
    color: 'firebrick'
  },
  {
    threshold: 0,
    color: 'grey'
  }
]

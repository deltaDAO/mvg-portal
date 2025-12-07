import { ComputeFlow, FormComputeData } from '../_types'

function isComputeFlow(value?: string): value is ComputeFlow {
  return value === 'dataset' || value === 'algorithm'
}

export function inferComputeFlow(
  values: Partial<FormComputeData>,
  isAlgorithmFallback?: boolean,
  assetType?: string
): ComputeFlow {
  if (isComputeFlow(values.flow)) {
    return values.flow
  }

  if (isComputeFlow(assetType)) {
    return assetType
  }

  if (typeof isAlgorithmFallback === 'boolean') {
    return isAlgorithmFallback ? 'algorithm' : 'dataset'
  }

  return values.algorithm ? 'dataset' : 'algorithm'
}

const baseStepsByFlow: Record<ComputeFlow, number> = {
  dataset: 6,
  algorithm: 6
}

export function getWizardTotalSteps(
  flow: ComputeFlow,
  hasUserParamsStep: boolean
): number {
  const baseSteps = baseStepsByFlow[flow]
  return hasUserParamsStep ? baseSteps + 1 : baseSteps
}

import { ComputeEnvironment } from '@oceanprotocol/lib'
import { FormComputeData } from '../_types'
import { ResourceType } from 'src/@types/ResourceType'

interface EnvSelectionResult {
  selectedComputeEnv?: ComputeEnvironment
  selectedResources?: ResourceType
}

export function getSelectedComputeEnvAndResources(
  computeEnvs: ComputeEnvironment[] | undefined,
  allResourceValues: {
    [envId: string]: ResourceType
  },
  formikValues: FormComputeData | Record<string, never>
): EnvSelectionResult {
  const selectedEnvId = (formikValues as FormComputeData)?.computeEnv?.id
  const selectedComputeEnv = computeEnvs?.find(
    (env) => env.id === selectedEnvId
  )
  const selectedResources = selectedEnvId
    ? (() => {
        const freeResources = allResourceValues[`${selectedEnvId}_free`]
        const paidResources = allResourceValues[`${selectedEnvId}_paid`]

        const mode = (formikValues as FormComputeData)?.mode || 'free'

        if (mode === 'paid' && paidResources) {
          return paidResources
        } else if (mode === 'free' && freeResources) {
          return freeResources
        }

        if (
          paidResources &&
          (paidResources.cpu > 0 ||
            paidResources.ram > 0 ||
            paidResources.disk > 0)
        ) {
          return paidResources
        } else if (freeResources) {
          return freeResources
        }
        return undefined
      })()
    : undefined

  return { selectedComputeEnv, selectedResources }
}

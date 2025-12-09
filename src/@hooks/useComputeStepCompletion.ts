import { useFormikContext } from 'formik'
import { FormComputeData } from '../components/DatasetComputeWizard/_types'

export function useComputeStepCompletion(isAlgorithmFlow?: boolean) {
  const { values } = useFormikContext<FormComputeData>()
  const hasUserParamsStep = Boolean(values.isUserParameters)
  const totalSteps = hasUserParamsStep ? 7 : 6

  function getSuccessClass(step: number): boolean {
    const environmentSelected = Boolean(values.computeEnv)
    const configSet =
      Number(values.cpu) > 0 &&
      Number(values.ram) > 0 &&
      Number(values.disk) > 0 &&
      Number(values.gpu) >= 0 &&
      Number(values.jobDuration) > 0
    const agreementsChecked = Boolean(
      values.termsAndConditions && values.acceptPublishingLicense
    )

    if (isAlgorithmFlow) {
      switch (step) {
        case 1:
          return Boolean(
            values.step1Completed || (values.datasets?.length ?? 0)
          )
        case 2:
          return Boolean(values.step2Completed)
        case 3:
          return Boolean(values.step3Completed)
        case 4:
          return Boolean(values.step4Completed)
        case 5:
          return Boolean(
            (values as unknown as { step5Completed?: boolean })?.step5Completed
          )
        case 6:
          return Boolean(
            (values as unknown as { step6Completed?: boolean })?.step6Completed
          )
        case 7:
          return hasUserParamsStep
            ? Boolean(
                (values as unknown as { step7Completed?: boolean })
                  ?.step7Completed
              )
            : false
        default:
          return false
      }
    }

    switch (step) {
      case 1:
        return Boolean(values.step1Completed || values.algorithm)
      case 2:
        return Boolean(
          values.step2Completed || values.algorithmServices?.length
        )
      case 3:
        return Boolean(values.step3Completed)
      case 4:
        return hasUserParamsStep
          ? Boolean(values.step4Completed)
          : Boolean(values.step4Completed || environmentSelected)
      case 5:
        return hasUserParamsStep
          ? Boolean(values.step5Completed || environmentSelected)
          : Boolean(
              (values as unknown as { step5Completed?: boolean })
                ?.step5Completed || configSet
            )
      case 6:
        return hasUserParamsStep
          ? Boolean(
              (values as unknown as { step6Completed?: boolean })
                ?.step6Completed || configSet
            )
          : Boolean(
              (values as unknown as { step6Completed?: boolean })
                ?.step6Completed ||
                (environmentSelected && configSet && agreementsChecked)
            )
      case 7:
        return hasUserParamsStep
          ? Boolean(
              (values as unknown as { step7Completed?: boolean })
                ?.step7Completed ||
                (environmentSelected && configSet && agreementsChecked)
            )
          : false
      default:
        return false
    }
  }

  function getLastCompletedStep() {
    let lastCompletedStep = 0
    for (let i = 1; i <= totalSteps; i++) {
      if (getSuccessClass(i)) {
        lastCompletedStep = i
      } else {
        break
      }
    }
    return lastCompletedStep
  }

  return {
    getSuccessClass,
    getLastCompletedStep,
    totalSteps
  }
}

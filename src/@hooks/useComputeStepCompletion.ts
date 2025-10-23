import { useFormikContext } from 'formik'
import { FormComputeData } from '../components/DatasetComputeWizard/_types'

export function useComputeStepCompletion(isAlgorithmFlow?: boolean) {
  const { values, errors } = useFormikContext<FormComputeData>()

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
      // 6-step algorithm flow: mark each step completed only when its dedicated flag is set
      switch (step) {
        case 1:
          return Boolean(values.step1Completed)
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
        default:
          return false
      }
    }

    // 6-step dataset flow: mark each step completed only when its dedicated flag is set
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
        return Boolean(values.step4Completed || environmentSelected)
      case 5:
        return Boolean(
          (values as unknown as { step5Completed?: boolean })?.step5Completed ||
            configSet
        )
      case 6:
        return Boolean(
          (values as unknown as { step6Completed?: boolean })?.step6Completed ||
            (environmentSelected && configSet && agreementsChecked)
        )
      default:
        return false
    }
  }

  function getLastCompletedStep(totalSteps: number) {
    let lastCompletedStep = 0
    for (let i = 0; i < totalSteps; i++) {
      if (getSuccessClass(i + 1)) {
        lastCompletedStep = i + 1
      } else {
        break
      }
    }
    return lastCompletedStep
  }

  return {
    getSuccessClass,
    getLastCompletedStep
  }
}

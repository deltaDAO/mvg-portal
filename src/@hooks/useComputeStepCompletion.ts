import { useFormikContext } from 'formik'
import { FormComputeData } from '../components/ComputeWizard/_types'

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

    // 4-step dataset flow
    switch (step) {
      case 1:
        return Boolean(values.step1Completed || values.algorithm)
      case 2:
        return environmentSelected
      case 3:
        return configSet
      case 4:
        return environmentSelected && configSet && agreementsChecked
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

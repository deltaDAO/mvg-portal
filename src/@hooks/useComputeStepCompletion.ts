import { useFormikContext } from 'formik'
import { FormComputeData } from '../components/ComputeWizard/_types'

export function useComputeStepCompletion() {
  const { values, errors } = useFormikContext<FormComputeData>()

  function getSuccessClass(step: number) {
    const isSuccessAlgorithm =
      values.algorithm !== null && values.algorithm !== undefined
    const isSuccessEnvironment =
      values.computeEnv !== null && values.computeEnv !== undefined
    const isSuccessConfiguration =
      values.cpu > 0 && values.ram > 0 && values.disk > 0 && values.gpu >= 0
    const isSuccessReview =
      values.step4Completed && values.algorithm && values.computeEnv

    const isSuccess =
      (step === 1 && isSuccessAlgorithm) ||
      (step === 2 && isSuccessEnvironment) ||
      (step === 3 && isSuccessConfiguration) ||
      (step === 4 && isSuccessReview)

    return isSuccess
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

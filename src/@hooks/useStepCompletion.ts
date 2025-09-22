import { useFormikContext } from 'formik'
import { FormPublishData } from '../components/Publish/_types'

export function useStepCompletion() {
  const { values, errors } = useFormikContext<FormPublishData>()

  function getSuccessClass(step: number) {
    const isSuccessMetadata = errors.metadata === undefined
    const isSuccessAccessPolicies =
      values.step2Completed && errors.credentials === undefined
    const isSuccessServices = errors.services === undefined
    const isSuccessPricing =
      values.step4Completed &&
      errors.pricing === undefined &&
      (values.pricing?.price >= 1 || values.pricing?.freeAgreement === true)

    const additionalDdosAreValid =
      values.additionalDdosPageVisited &&
      values.additionalDdos?.map((ddo) => ddo.data?.length > 0).every(Boolean)

    const isSuccessCustomDDO =
      values.step5Completed &&
      errors.additionalDdos === undefined &&
      additionalDdosAreValid

    const isSuccessPreview =
      values.step6Completed &&
      isSuccessMetadata &&
      isSuccessAccessPolicies &&
      isSuccessServices &&
      isSuccessPricing &&
      isSuccessCustomDDO &&
      values.previewPageVisited

    const isSuccessSubmission =
      values.submissionPageVisited &&
      values.feedback &&
      values.feedback['3'] &&
      values.feedback['3'].status === 'success'

    const isSuccess =
      (step === 1 && isSuccessMetadata) ||
      (step === 2 && isSuccessAccessPolicies) ||
      (step === 3 && isSuccessServices) ||
      (step === 4 && isSuccessPricing) ||
      (step === 5 && isSuccessCustomDDO) ||
      (step === 6 && isSuccessPreview) ||
      (step === 7 && isSuccessSubmission)

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

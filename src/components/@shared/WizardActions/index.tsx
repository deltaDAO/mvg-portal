import React, { FormEvent, ReactElement, RefObject } from 'react'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import { FormikContextType, useFormikContext } from 'formik'
import { FormComputeData } from '@components/ComputeWizard/_types'
import ButtonBuy from '@components/Asset/AssetActions/ButtonBuy'
import { getDatasetSteps } from '@components/ComputeWizard/_steps'

interface WizardActionsProps {
  disabled?: boolean
  action?: 'compute'
  submitButtonText?: string
  continueButtonText?: string
  scrollToRef?: RefObject<any>
  isContinueDisabled?: boolean
  rightAlignFirstStep?: boolean
  isSubmitDisabled?: boolean
  hasPreviousOrder?: boolean
  hasDatatoken?: boolean
  btSymbol?: string
  dtSymbol?: string
  dtBalance?: string
  assetType?: string
  assetTimeout?: string
  isConsumable?: boolean
  consumableFeedback?: string
  hasPreviousOrderSelectedComputeAsset?: boolean
  hasDatatokenSelectedComputeAsset?: boolean
  dtSymbolSelectedComputeAsset?: string
  dtBalanceSelectedComputeAsset?: string
  selectedComputeAssetType?: string
  isBalanceSufficient?: boolean
  isLoading?: boolean
  onClick?: (e: FormEvent<HTMLButtonElement>) => void
  stepText?: string
  type?: 'submit' | 'button'
  priceType?: string
  algorithmPriceType?: string
  isAlgorithmConsumable?: boolean
  isSupportedOceanNetwork?: boolean
  isAccountConnected?: boolean
  hasProviderFee?: boolean
  retry?: boolean
  computeWizard?: boolean
  extraFeesLoaded?: boolean
  isInitLoading?: boolean
  onInitCompute?: () => void
}

export default function WizardActions({
  submitButtonText,
  continueButtonText = 'Continue',
  scrollToRef,
  isContinueDisabled,
  rightAlignFirstStep = true,
  isSubmitDisabled = false,
  action,
  disabled,
  hasPreviousOrder,
  hasDatatoken,
  btSymbol,
  dtSymbol,
  dtBalance,
  assetType,
  assetTimeout,
  isConsumable,
  consumableFeedback,
  isBalanceSufficient,
  hasPreviousOrderSelectedComputeAsset,
  hasDatatokenSelectedComputeAsset,
  dtSymbolSelectedComputeAsset,
  dtBalanceSelectedComputeAsset,
  selectedComputeAssetType,
  stepText,
  isLoading,
  type,
  priceType,
  algorithmPriceType,
  isAlgorithmConsumable,
  hasProviderFee,
  retry,
  isSupportedOceanNetwork,
  isAccountConnected,
  computeWizard,
  extraFeesLoaded,
  isInitLoading,
  onInitCompute
}: WizardActionsProps): ReactElement {
  const {
    isValid,
    values,
    isSubmitting,
    setFieldValue
  }: FormikContextType<FormComputeData> = useFormikContext()

  const hasUserParamsStep = Boolean(values?.isUserParameters)
  const withoutDataset = Boolean(values?.withoutDataset)
  const steps = getDatasetSteps(hasUserParamsStep, withoutDataset)
  const totalSteps = steps.length
  const currentStep = values.user.stepCurrent
  const isLastStep = currentStep === totalSteps

  const handleAction = (action: 'next' | 'prev') => {
    const newStep = action === 'next' ? currentStep + 1 : currentStep - 1
    if (newStep >= 1 && newStep <= totalSteps) {
      setFieldValue('user.stepCurrent', newStep)
    }
    if (scrollToRef?.current) scrollToRef.current.scrollIntoView()
  }

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    setFieldValue(`step${currentStep}Completed`, true)
    handleAction('next')
  }

  const handlePrevious = (e: FormEvent) => {
    e.preventDefault()
    handleAction('prev')
  }

  const isFirstStep = currentStep === 1
  const actionsClassName =
    isFirstStep && rightAlignFirstStep ? styles.actionsRight : styles.actions

  const PurchaseButton = () => (
    <ButtonBuy
      action={action}
      disabled={disabled || !isValid}
      hasPreviousOrder={hasPreviousOrder}
      hasDatatoken={hasDatatoken}
      btSymbol={btSymbol}
      dtSymbol={dtSymbol}
      dtBalance={dtBalance}
      assetTimeout={assetTimeout}
      assetType={assetType}
      hasPreviousOrderSelectedComputeAsset={
        hasPreviousOrderSelectedComputeAsset
      }
      hasDatatokenSelectedComputeAsset={hasDatatokenSelectedComputeAsset}
      dtSymbolSelectedComputeAsset={dtSymbolSelectedComputeAsset}
      dtBalanceSelectedComputeAsset={dtBalanceSelectedComputeAsset}
      selectedComputeAssetType={selectedComputeAssetType}
      stepText={stepText}
      isLoading={isLoading}
      type="submit"
      priceType={priceType}
      algorithmPriceType={algorithmPriceType}
      isBalanceSufficient={isBalanceSufficient}
      isConsumable={isConsumable}
      consumableFeedback={consumableFeedback}
      isAlgorithmConsumable={isAlgorithmConsumable}
      isSupportedOceanNetwork={isSupportedOceanNetwork}
      hasProviderFee={hasProviderFee}
      retry={retry}
      isAccountConnected={isAccountConnected}
      computeWizard={computeWizard}
    />
  )

  const ComputeButton = () => {
    if (!extraFeesLoaded) {
      return (
        <Button
          style="gradient"
          onClick={onInitCompute}
          disabled={
            isInitLoading || disabled || !isValid || !isBalanceSufficient
          }
        >
          {isInitLoading ? 'Calculating...' : 'Calculate Extra Fees'}
        </Button>
      )
    }
    return <PurchaseButton />
  }

  return (
    <footer className={actionsClassName}>
      {currentStep > 1 && (
        <Button onClick={handlePrevious} disabled={isSubmitting}>
          Back
        </Button>
      )}
      {!isLastStep ? (
        <Button
          style="publish"
          onClick={handleNext}
          disabled={isContinueDisabled}
        >
          {continueButtonText}
        </Button>
      ) : (
        <ComputeButton />
      )}
    </footer>
  )
}

import { FormEvent, ReactElement, RefObject, useEffect } from 'react'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import { FormikContextType, useFormikContext } from 'formik'
import { FormPublishData } from '../_types'
import { wizardSteps } from '../_constants'
import SuccessConfetti from '@shared/SuccessConfetti'
import { useRouter } from 'next/router'
import Tooltip from '@shared/atoms/Tooltip'
import AvailableNetworks from '@components/Publish/AvailableNetworks'
import Info from '@images/info.svg'
import Loader from '@shared/atoms/Loader'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { isAddress } from 'ethers/lib/utils.js'
import isUrl from 'is-url-superb'

function isValidUrl(url: string): boolean {
  if (!url?.trim()) return false

  const trimmedUrl = url.trim()
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return false
  }

  return isUrl(trimmedUrl)
}

export default function Actions({
  scrollToRef,
  did
}: {
  scrollToRef: RefObject<any>
  did: string
}): ReactElement {
  const router = useRouter()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const {
    values,
    errors,
    isValid,
    isSubmitting,
    setFieldValue
  }: FormikContextType<FormPublishData> = useFormikContext()
  // async function handleActivation(e: FormEvent<HTMLButtonElement>) {
  //   // prevent accidentially submitting a form the button might be in
  //   e.preventDefault()

  //   await connect()
  // }

  function handleAction(action: string) {
    const currentStep: string = router.query.step as string
    router.push({
      pathname: `${router.pathname}`,
      query: { step: parseInt(currentStep) + (action === 'next' ? +1 : -1) }
    })
    scrollToRef.current.scrollIntoView()
  }

  function handleNext(e: FormEvent) {
    e.preventDefault()

    const { stepCurrent } = values.user
    const stepCompletions = {
      1: ['step1Completed'],
      2: ['step2Completed'],
      3: ['step3Completed'],
      4: ['step4Completed'],
      5: ['step5Completed'],
      6: ['step6Completed', 'previewPageVisited'],
      7: ['submissionPageVisited']
    }

    const fieldsToSet = stepCompletions[stepCurrent] || []
    fieldsToSet.forEach((field) => setFieldValue(field, true))

    if (values.user.stepCurrent === 2) {
      const processAddress = (
        inputValue: string,
        fieldName: 'allow' | 'deny'
      ) => {
        const trimmedValue = inputValue?.trim()
        if (
          !trimmedValue ||
          trimmedValue.length < 40 ||
          !trimmedValue.startsWith('0x')
        ) {
          return
        }

        try {
          if (isAddress(trimmedValue)) {
            const lowerCaseAddress = trimmedValue.toLowerCase()
            const currentList = values.credentials[fieldName] || []

            if (!currentList.includes(lowerCaseAddress)) {
              console.log(
                `Auto-committing typed ${fieldName} address before navigation:`,
                lowerCaseAddress
              )
              const newList = [...currentList, lowerCaseAddress]
              setFieldValue(`credentials.${fieldName}`, newList)
              setFieldValue(`credentials.${fieldName}InputValue`, '')
            }
          }
        } catch (error) {
          console.log(
            `${fieldName} address validation error during auto-commit:`,
            error
          )
        }
      }

      processAddress(values.credentials.allowInputValue, 'allow')
      processAddress(values.credentials.denyInputValue, 'deny')
    }

    handleAction('next')
  }

  function handlePrevious(e: FormEvent) {
    e.preventDefault()
    handleAction('prev')
  }

  const hasValidAllowAddress = () => {
    // Check existing allow list
    if (values.credentials.allow?.length > 0) return true

    const typedValue = values.credentials.allowInputValue?.trim()
    if (!typedValue) return false

    // Check for wildcard
    if (typedValue === '*') return true

    // Check for valid address
    if (typedValue.length >= 40 && typedValue.startsWith('0x')) {
      try {
        return isAddress(typedValue)
      } catch (error) {
        console.log('Allow address validation error:', error)
      }
    }

    return false
  }

  const hasSSIButNoCredentialRequests = () => {
    // Early return if SSI not enabled
    if (!values.credentials?.enabled) return false

    const requestCredentials = values.credentials?.requestCredentials
    // Early return if no credential requests
    if (!requestCredentials?.length) return true

    // Check for invalid policies with early returns
    return requestCredentials.some((credential) => {
      const policies = credential?.policies
      if (!policies?.length) return false

      return policies.some((policy) => {
        if (!policy?.type) return false

        switch (policy.type) {
          case 'staticPolicy':
            return !policy.name?.trim()
          case 'parameterizedPolicy':
            return !policy.args?.length
          case 'customUrlPolicy': {
            return (
              !policy.name?.trim() ||
              !policy.policyUrl?.trim() ||
              !isValidUrl(policy.policyUrl) ||
              !policy.arguments?.length ||
              policy.arguments.some(
                (arg) => !arg.name?.trim() || !arg.value?.trim()
              )
            )
          }
          case 'customPolicy': {
            return (
              !policy.name?.trim() ||
              !policy.rules?.length ||
              policy.rules.some(
                (rule) =>
                  !rule.leftValue?.trim() ||
                  !rule.rightValue?.trim() ||
                  !rule.operator?.trim()
              )
            )
          }
          default:
            return false
        }
      })
    })
  }

  const isContinueDisabled = (() => {
    const { stepCurrent } = values.user
    const {
      step1Completed,
      step2Completed,
      step3Completed,
      step4Completed,
      step5Completed
    } = values

    const stepValidations = {
      1: () =>
        errors.metadata !== undefined ||
        (values.metadata.licenseTypeSelection === 'URL' &&
          !values.metadata.licenseUrl?.[0]?.valid) ||
        (values.metadata.licenseTypeSelection === 'Upload license file' &&
          !values.metadata.uploadedLicense),
      2: () =>
        !step1Completed ||
        errors.credentials !== undefined ||
        !hasValidAllowAddress() ||
        hasSSIButNoCredentialRequests(),
      3: () =>
        !step1Completed || !step2Completed || errors.services !== undefined,
      4: () =>
        !step1Completed ||
        !step2Completed ||
        !step3Completed ||
        errors.pricing !== undefined,
      5: () =>
        !step1Completed ||
        !step2Completed ||
        !step3Completed ||
        !step4Completed ||
        errors.additionalDdos !== undefined,
      6: () =>
        !step1Completed ||
        !step2Completed ||
        !step3Completed ||
        !step4Completed ||
        !step5Completed
    }

    return stepValidations[stepCurrent]?.() || false
  })()

  const hasSubmitError = [1, 2, 3].some(
    (index) => values.feedback?.[index]?.status === 'error'
  )

  const isMetadataPage = values.user.stepCurrent === 1
  const actionsClassName = isMetadataPage ? styles.actionsRight : styles.actions

  return (
    <footer className={actionsClassName}>
      {did ? (
        <SuccessConfetti
          success="Successfully published!"
          action={
            <Button style="publish" to={`/asset/${did}`}>
              View Asset
            </Button>
          }
        />
      ) : (
        <>
          {values.user.stepCurrent > 1 && (
            <Button onClick={handlePrevious} disabled={isSubmitting}>
              Back
            </Button>
          )}

          {values.user.stepCurrent < wizardSteps.length ? (
            <Button
              style="publish"
              onClick={handleNext}
              disabled={isContinueDisabled}
            >
              Continue
            </Button>
          ) : // !address ? (
          // <Button type="submit" style="primary" onClick={handleActivation}>
          //   Connect Wallet
          // </Button>
          // ) :
          !isSupportedOceanNetwork ? (
            <Tooltip content={<AvailableNetworks />}>
              <Button
                type="submit"
                style="publish"
                disabled
                className={styles.infoButton}
              >
                Unsupported Network <Info className={styles.infoIcon} />
              </Button>
            </Tooltip>
          ) : (
            <Button
              type="submit"
              style="publish"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <Loader variant="primary" />
              ) : hasSubmitError ? (
                'Retry'
              ) : (
                'Submit'
              )}
            </Button>
          )}
        </>
      )}
    </footer>
  )
}

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

    if (values.user.stepCurrent === 2) {
      const typedAllowValue = values.credentials.allowInputValue?.trim()
      if (
        typedAllowValue &&
        typedAllowValue.length >= 40 &&
        typedAllowValue.startsWith('0x')
      ) {
        try {
          const isValidAddress = isAddress(typedAllowValue)
          if (isValidAddress) {
            const lowerCaseAddress = typedAllowValue.toLowerCase()
            const currentAllowList = values.credentials.allow || []
            if (!currentAllowList.includes(lowerCaseAddress)) {
              console.log(
                'Auto-committing typed allow address before navigation:',
                lowerCaseAddress
              )
              const newAllowList = [...currentAllowList, lowerCaseAddress]
              setFieldValue('credentials.allow', newAllowList)
              setFieldValue('credentials.allowInputValue', '')
            }
          }
        } catch (error) {
          console.log(
            'Allow address validation error during auto-commit:',
            error
          )
        }
      }

      const typedDenyValue = values.credentials.denyInputValue?.trim()
      if (
        typedDenyValue &&
        typedDenyValue.length >= 40 &&
        typedDenyValue.startsWith('0x')
      ) {
        try {
          const isValidAddress = isAddress(typedDenyValue)
          if (isValidAddress) {
            const lowerCaseAddress = typedDenyValue.toLowerCase()
            const currentDenyList = values.credentials.deny || []
            if (!currentDenyList.includes(lowerCaseAddress)) {
              console.log(
                'Auto-committing typed deny address before navigation:',
                lowerCaseAddress
              )
              const newDenyList = [...currentDenyList, lowerCaseAddress]
              setFieldValue('credentials.deny', newDenyList)
              setFieldValue('credentials.denyInputValue', '')
            }
          }
        } catch (error) {
          console.log(
            'Deny address validation error during auto-commit:',
            error
          )
        }
      }
    }

    handleAction('next')
  }

  function handlePrevious(e: FormEvent) {
    e.preventDefault()
    handleAction('prev')
  }

  const hasValidAllowAddress = () => {
    if (values.credentials.allow && values.credentials.allow.length > 0) {
      return true
    }

    const typedValue = values.credentials.allowInputValue?.trim()
    if (typedValue) {
      if (typedValue === '*') {
        return true
      }

      if (typedValue.length >= 40 && typedValue.startsWith('0x')) {
        try {
          const isValidAddress = isAddress(typedValue)
          if (isValidAddress) {
            return true
          }
        } catch (error) {
          console.log('Allow address validation error:', error)
        }
      }
    }

    return true
  }

  const isContinueDisabled =
    (values.user.stepCurrent === 1 && errors.metadata !== undefined) ||
    (values.user.stepCurrent === 2 && errors.credentials !== undefined) ||
    (values.user.stepCurrent === 2 && !hasValidAllowAddress()) ||
    (values.user.stepCurrent === 3 && errors.services !== undefined) ||
    (values.user.stepCurrent === 4 && errors.pricing !== undefined) ||
    (values.user.stepCurrent === 5 && errors.additionalDdos !== undefined)

  const hasSubmitError =
    values.feedback?.[1].status === 'error' ||
    values.feedback?.[2].status === 'error' ||
    values.feedback?.[3].status === 'error'

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
                <Loader white />
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

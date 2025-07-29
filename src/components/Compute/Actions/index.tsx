import { ReactElement, useRef } from 'react'
import { useFormikContext } from 'formik'
import { useRouter } from 'next/router'
import Button from '@shared/atoms/Button'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

export default function Actions({
  scrollToRef,
  txHash
}: {
  scrollToRef: any
  txHash?: string
}): ReactElement {
  const router = useRouter()
  const { values, isSubmitting }: any = useFormikContext<FormComputeData>()

  const currentStep = values.user.stepCurrent
  const isLastStep = currentStep === 4

  function handleBack() {
    if (currentStep > 1) {
      const { did } = router.query
      router.push(`/asset/${did}/compute/${currentStep - 1}`)
    } else {
      const { did } = router.query
      router.push(`/asset/${did}`)
    }
  }

  function handleContinue() {
    if (currentStep < 4) {
      const { did } = router.query
      router.push(`/asset/${did}/compute/${currentStep + 1}`)
    }
  }

  function handleSubmit() {
    if (scrollToRef?.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.actions}>
      <Button style="text" onClick={handleBack} disabled={isSubmitting}>
        Back
      </Button>
      {isLastStep ? (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={styles.primaryAction}
        >
          {isSubmitting ? 'Processing...' : 'Buy'}
        </Button>
      ) : (
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          className={styles.primaryAction}
        >
          Continue
        </Button>
      )}
    </div>
  )
}

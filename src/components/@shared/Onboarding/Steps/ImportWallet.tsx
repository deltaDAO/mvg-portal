import { ReactElement, useEffect, useState } from 'react'
import { OnboardingStep } from '..'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import content from '../../../../../content/onboarding/steps/importAutomationWallet.json'
import Import from '@components/Header/UserPreferences/Automation/Import'
import { useAutomation } from '@context/Automation/AutomationProvider'
import Decrypt from '@components/Header/UserPreferences/Automation/Decrypt'
import Alert from '@components/@shared/atoms/Alert'

export default function ImportWallet(): ReactElement {
  const { title, subtitle, body, image }: OnboardingStep = content
  const { autoWallet, hasValidEncryptedWallet } = useAutomation()
  const [needsImport, setNeedsImport] = useState<boolean>(
    !hasValidEncryptedWallet
  )

  useEffect(() => {
    setNeedsImport(!hasValidEncryptedWallet)
  }, [hasValidEncryptedWallet])

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image}>
        {autoWallet ? (
          <Alert text={content.buttonSuccess} state="success" />
        ) : needsImport ? (
          <Import />
        ) : (
          <Decrypt />
        )}
      </StepBody>
    </div>
  )
}

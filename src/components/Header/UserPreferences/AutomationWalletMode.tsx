import { ChangeEvent, ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Input from '@shared/FormInput'
import { AUTOMATION_MODES } from '../../../@context/Automation/AutomationProvider'

export default function AutomationWalletMode(): ReactElement {
  const { automationWalletMode, setAutomationWalletMode } = useUserPreferences()

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setAutomationWalletMode(event.target.value as AUTOMATION_MODES)
  }

  return (
    <Input
      label="Automation Wallet Mode"
      help="Set the viewing mode for your automation wallet"
      name="automation-wallet-mode"
      type="boxSelection"
      options={[
        {
          name: AUTOMATION_MODES.ADVANCED,
          title: AUTOMATION_MODES.ADVANCED,
          checked: automationWalletMode === AUTOMATION_MODES.ADVANCED
        },
        {
          name: AUTOMATION_MODES.SIMPLE,
          title: AUTOMATION_MODES.SIMPLE,
          checked: automationWalletMode === AUTOMATION_MODES.SIMPLE
        }
      ]}
      onChange={handleChange}
    />
  )
}

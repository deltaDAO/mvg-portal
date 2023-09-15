import React, { ChangeEvent, ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Input from '@shared/FormInput'

export enum AUTOMATION_WALLET_MODES {
  ADVANCED = 'advanced',
  SIMPLE = 'simple'
}

export default function AutomationWalletMode(): ReactElement {
  const { automationWalletMode, setAutomationWalletMode } = useUserPreferences()

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setAutomationWalletMode(event.target.value)
  }

  return (
    <Input
      label="Automation Wallet Mode"
      help="Set the viewing mode for your automation wallet"
      name="automation-wallet-mode"
      type="boxSelection"
      options={[
        {
          name: AUTOMATION_WALLET_MODES.ADVANCED,
          title: AUTOMATION_WALLET_MODES.ADVANCED,
          checked: automationWalletMode === AUTOMATION_WALLET_MODES.ADVANCED
        },
        {
          name: AUTOMATION_WALLET_MODES.SIMPLE,
          title: AUTOMATION_WALLET_MODES.SIMPLE,
          checked: automationWalletMode === AUTOMATION_WALLET_MODES.SIMPLE
        }
      ]}
      onChange={handleChange}
    />
  )
}

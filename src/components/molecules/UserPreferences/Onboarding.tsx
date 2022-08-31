import React, { ReactElement, useEffect, useState } from 'react'
import { useUserPreferences } from '../../../providers/UserPreferences'
import Input from '../../atoms/Input'

export default function Onboarding(): ReactElement {
  const [defaultChecked, setDefaultChecked] = useState<boolean>()
  const { showOnboardingModule, setShowOnboardingModule } = useUserPreferences()

  useEffect(() => {
    setDefaultChecked(showOnboardingModule === true)
  }, [showOnboardingModule])

  return (
    <Input
      label="Onboarding"
      help="Show the onboarding tutorial module on the homepage."
      name="onboarding"
      type="checkbox"
      options={['Show onboarding tutorial']}
      defaultChecked={defaultChecked}
      onChange={() => setShowOnboardingModule(!showOnboardingModule)}
    />
  )
}

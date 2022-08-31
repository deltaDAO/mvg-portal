import React, { ReactElement } from 'react'
import { useUserPreferences } from '../../../providers/UserPreferences'
import Input from '../../atoms/Input'

export default function Onboarding(): ReactElement {
  const { showOnboardingModule, setShowOnboardingModule } = useUserPreferences()

  return (
    <Input
      label="Onboarding"
      help="Show the onboarding tutorial module on the homepage."
      name="onboarding"
      type="checkbox"
      options={['Show onboarding tutorial']}
      checked={showOnboardingModule}
      onChange={() => setShowOnboardingModule(!showOnboardingModule)}
    />
  )
}

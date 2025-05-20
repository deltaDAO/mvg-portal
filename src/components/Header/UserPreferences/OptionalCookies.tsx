import { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Input from '@shared/FormInput'

export default function OptionalCookies(): ReactElement {
  const { allowOptionalCookies, setAllowOptionalCookies } = useUserPreferences()

  return (
    <Input
      label="Optional cookies"
      help="Allow optional cookies to be set in your browser."
      name="optional cookies"
      type="checkbox"
      options={['Allow optional cookies']}
      checked={allowOptionalCookies === true}
      onChange={() => setAllowOptionalCookies(!allowOptionalCookies)}
    />
  )
}

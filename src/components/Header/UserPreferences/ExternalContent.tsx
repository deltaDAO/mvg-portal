import { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Input from '@shared/FormInput'

export default function ExternalContent(): ReactElement {
  const { allowExternalContent, setAllowExternalContent } = useUserPreferences()

  return (
    <Input
      label="External content"
      help="Load content from external sources in the assets' description."
      name="external content"
      type="checkbox"
      options={['Allow external content']}
      checked={allowExternalContent === true}
      onChange={() => setAllowExternalContent(!allowExternalContent)}
    />
  )
}

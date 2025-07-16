import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { FormPublishData } from '../../Publish/_types'
import { PolicyEditor } from '@components/@shared/PolicyEditor'
import SectionContainer from '../SectionContainer/SectionContainer'
import Input from '@shared/FormInput'
import appConfig from 'app.config.cjs'

interface SSIPoliciesSectionProps {
  defaultPolicies: string[]
  fieldNamePrefix: string
  title?: string
  help?: string
  showEnableCheckbox?: boolean
  hideDefaultPolicies?: boolean
  isAsset?: boolean
}

export default function SSIPoliciesSection({
  defaultPolicies,
  fieldNamePrefix,
  title = 'SSI Policies',
  help = 'Self-sovereign identity (SSI) policies define verification requirements for asset consumers. Configure which credentials and verification policies are required to access this asset.',
  showEnableCheckbox = true,
  hideDefaultPolicies = false,
  isAsset = true
}: SSIPoliciesSectionProps): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormPublishData>()
  const [enabled, setEnabled] = useState(false)

  const getCredentialsPath = () => {
    if (fieldNamePrefix.includes('services')) {
      return `${fieldNamePrefix}.credentials`
    }
    return fieldNamePrefix
  }

  const credentialsPath = getCredentialsPath()

  const getCredentialsValue = () => {
    const pathParts = credentialsPath.split('.')
    let value = values

    for (const part of pathParts) {
      if (part.includes('[') && part.includes(']')) {
        const arrayMatch = part.match(/(.+)\[(\d+)\]/)
        if (arrayMatch) {
          const [, arrayName, index] = arrayMatch
          value = value?.[arrayName]?.[parseInt(index)]
        }
      } else {
        value = value?.[part]
      }
    }
    return value
  }

  const credentials = getCredentialsValue()

  // Auto-enable checkbox if policies exist
  useEffect(() => {
    const hasCurrentPolicies =
      (credentials as any)?.requestCredentials?.length > 0 ||
      (credentials as any)?.vcPolicies?.length > 0 ||
      (credentials as any)?.vpPolicies?.length > 0

    setEnabled(hasCurrentPolicies)
  }, [
    (credentials as any)?.requestCredentials,
    (credentials as any)?.vcPolicies,
    (credentials as any)?.vpPolicies
  ])

  if (!appConfig.ssiEnabled) {
    return null
  }

  return (
    <>
      {showEnableCheckbox && (
        <Input
          name="enableSSI"
          label="Enable SSI Policies"
          type="checkbox"
          options={['Enable SSI Policies']}
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
          hideLabel={true}
        />
      )}
      {(!showEnableCheckbox || enabled) && (
        <SectionContainer title={title} help={help}>
          <PolicyEditor
            credentials={credentials}
            setCredentials={(newCredentials) =>
              setFieldValue(credentialsPath, newCredentials)
            }
            name={credentialsPath}
            defaultPolicies={defaultPolicies}
            help="Self-sovereign identity (SSI) is used verify the consumer of an asset. Indicate which SSI policy is required for this asset (static, parameterized, custom URL, other)."
            isAsset={isAsset}
            buttonStyle="ocean"
            enabledView={true}
            hideDefaultPolicies={hideDefaultPolicies}
          />
        </SectionContainer>
      )}
    </>
  )
}

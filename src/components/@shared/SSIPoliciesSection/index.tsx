import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { FormPublishData } from '../../Publish/_types'
import { PolicyEditor } from '@components/@shared/PolicyEditor'
import SectionContainer from '../SectionContainer/SectionContainer'
import Input from '@shared/FormInput'
import appConfig from 'app.config.cjs'

const DEFAULT_TITLE = 'SSI Policies'
const DEFAULT_HELP =
  'Self-sovereign identity (SSI) policies define verification requirements for asset consumers. Configure which credentials and verification policies are required to access this asset.'
const POLICY_EDITOR_HELP =
  'Self-sovereign identity (SSI) is used verify the consumer of an asset. Indicate which SSI policy is required for this asset (static, parameterized, custom URL, other).'

interface SSIPoliciesSectionProps {
  defaultPolicies: string[]
  fieldNamePrefix: string
  title?: string
  help?: string
  showEnableCheckbox?: boolean
  hideDefaultPolicies?: boolean
  isAsset?: boolean
}

/**
 * SSIPoliciesSection - Manages SSI policy configuration for digital assets
 *
 * @param defaultPolicies - Pre-configured policy templates to apply when enabling SSI
 * @param fieldNamePrefix - Form field path prefix for credential storage
 * @param title - Section title (defaults to 'SSI Policies')
 * @param help - Help text for users (defaults to standard SSI description)
 * @param showEnableCheckbox - Whether to show enable/disable toggle
 * @param hideDefaultPolicies - Hide default policy options in PolicyEditor
 * @param isAsset - Whether this is for an asset vs service configuration
 */
export default function SSIPoliciesSection({
  defaultPolicies,
  fieldNamePrefix,
  title = DEFAULT_TITLE,
  help = DEFAULT_HELP,
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

    const isManuallyEnabled = (credentials as any)?.enabled === true

    if (hasCurrentPolicies && !isManuallyEnabled) {
      setEnabled(true)
    } else if (isManuallyEnabled) {
      setEnabled(true)
    } else {
      setEnabled(false)
    }
  }, [
    (credentials as any)?.requestCredentials,
    (credentials as any)?.vcPolicies,
    (credentials as any)?.vpPolicies,
    (credentials as any)?.enabled
  ])

  const handleToggleSSI = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)

    setFieldValue(`${credentialsPath}.enabled`, newEnabled)

    if (!newEnabled) {
      setFieldValue(`${credentialsPath}.requestCredentials`, [])
      setFieldValue(`${credentialsPath}.vcPolicies`, [])
      setFieldValue(`${credentialsPath}.vpPolicies`, [])
    }
  }

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
          onChange={handleToggleSSI}
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
            help={POLICY_EDITOR_HELP}
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

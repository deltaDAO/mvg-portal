import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { PolicyEditor } from '@components/@shared/PolicyEditor'
import SectionContainer from '@components/@shared/SectionContainer/SectionContainer'
import Input from '@shared/FormInput'
import appConfig from 'app.config.cjs'
import { CredentialForm } from '@components/@shared/PolicyEditor/types'

interface SSIPoliciesSectionProps {
  defaultPolicies: string[]
  isAsset?: boolean
  hideDefaultPolicies?: boolean
}

export default function SSIPoliciesSection({
  defaultPolicies,
  isAsset = true,
  hideDefaultPolicies = false
}: SSIPoliciesSectionProps): ReactElement {
  const { values, setFieldValue } = useFormikContext<{
    credentials: CredentialForm
  }>()

  const [enabled, setEnabled] = useState(false)
  const [originalCredentials, setOriginalCredentials] =
    useState<CredentialForm | null>(null)

  // Store original credentials when component mounts
  useEffect(() => {
    if (values.credentials && !originalCredentials) {
      setOriginalCredentials({ ...values.credentials })
    }
  }, [values.credentials, originalCredentials])

  useEffect(() => {
    const hasCurrentPolicies =
      values.credentials?.requestCredentials?.length > 0 ||
      values.credentials?.vcPolicies?.length > 0 ||
      values.credentials?.vpPolicies?.length > 0

    const isManuallyEnabled = values.credentials?.enabled === true

    if (hasCurrentPolicies && !isManuallyEnabled) {
      setEnabled(true)
    } else if (isManuallyEnabled) {
      setEnabled(true)
    } else {
      setEnabled(false)
    }
  }, [
    values.credentials?.requestCredentials,
    values.credentials?.vcPolicies,
    values.credentials?.vpPolicies,
    values.credentials?.enabled
  ])

  const handleToggleSSI = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)

    setFieldValue('credentials.enabled', newEnabled)

    if (!newEnabled) {
      setFieldValue('credentials.requestCredentials', [])
      setFieldValue('credentials.vcPolicies', [])
      setFieldValue('credentials.vpPolicies', [])
    } else if (originalCredentials) {
      // Restore original credentials when re-enabling
      setFieldValue(
        'credentials.requestCredentials',
        originalCredentials.requestCredentials || []
      )
      setFieldValue(
        'credentials.vcPolicies',
        originalCredentials.vcPolicies || []
      )
      setFieldValue(
        'credentials.vpPolicies',
        originalCredentials.vpPolicies || []
      )
    }
  }

  if (!appConfig.ssiEnabled) {
    return null
  }

  return (
    <>
      <Input
        name="enableSSI"
        label="Enable SSI Policies"
        type="checkbox"
        options={['Enable SSI Policies']}
        checked={enabled}
        onChange={handleToggleSSI}
        hideLabel={true}
      />
      {enabled && (
        <SectionContainer
          title="SSI Policies"
          help={`Self-sovereign identity (SSI) policies define verification requirements for ${
            isAsset ? 'asset' : 'service'
          } consumers. Configure which credentials and verification policies are required to access this ${
            isAsset ? 'asset' : 'service'
          }.`}
          // variant="publish"
        >
          <PolicyEditor
            credentials={values.credentials}
            setCredentials={(newCredentials) =>
              setFieldValue('credentials', newCredentials)
            }
            name="credentials"
            defaultPolicies={defaultPolicies}
            help={`Self-sovereign identity (SSI) is used to verify the consumer of a ${
              isAsset ? 'asset' : 'service'
            }. Indicate which SSI policy is required for this ${
              isAsset ? 'asset' : 'service'
            } (static, parameterized, custom URL, other).`}
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

import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { FormPublishData } from '../../_types'
import { PolicyEditor } from '@components/@shared/PolicyEditor'
import SectionContainer from '../../../@shared/SectionContainer/SectionContainer'
import Input from '@shared/FormInput'
import appConfig from 'app.config.cjs'

interface SSIPoliciesSectionProps {
  defaultPolicies: string[]
}

export default function SSIPoliciesSection({
  defaultPolicies
}: SSIPoliciesSectionProps): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormPublishData>()

  const [enabled, setEnabled] = useState(false)

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
          help="Self-sovereign identity (SSI) policies define verification requirements for asset consumers. Configure which credentials and verification policies are required to access this asset."
        >
          <PolicyEditor
            credentials={values.credentials}
            setCredentials={(newCredentials) =>
              setFieldValue('credentials', newCredentials)
            }
            name="credentials"
            defaultPolicies={defaultPolicies}
            help="Self-sovereign identity (SSI) is used verify the consumer of an asset. Indicate which SSI policy is required for this asset (static, parameterized, custom URL, other)."
            isAsset={true}
            buttonStyle="ocean"
            enabledView={true}
            hideDefaultPolicies={false}
          />
        </SectionContainer>
      )}
    </>
  )
}

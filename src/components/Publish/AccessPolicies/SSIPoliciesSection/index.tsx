import { ReactElement, useState } from 'react'
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
        onChange={() => setEnabled(!enabled)}
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
          />
        </SectionContainer>
      )}
    </>
  )
}

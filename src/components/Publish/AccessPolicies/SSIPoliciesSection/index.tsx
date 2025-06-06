import { ReactElement } from 'react'
import { useFormikContext } from 'formik'
import { FormPublishData } from '../../_types'
import { PolicyEditor } from '@components/@shared/PolicyEditor'
import SectionContainer from '../../../@shared/SectionContainer/SectionContainer'
import appConfig from 'app.config.cjs'

interface SSIPoliciesSectionProps {
  defaultPolicies: string[]
}

export default function SSIPoliciesSection({
  defaultPolicies
}: SSIPoliciesSectionProps): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormPublishData>()

  if (!appConfig.ssiEnabled) {
    return null
  }

  return (
    <SectionContainer title="Enable SSI Policies">
      <PolicyEditor
        label="SSI Policies"
        credentials={values.credentials}
        setCredentials={(newCredentials) =>
          setFieldValue('credentials', newCredentials)
        }
        name="credentials"
        defaultPolicies={defaultPolicies}
        help="Self-sovereign identity (SSI) is used verify the consumer of an asset. Indicate which SSI policy is required for this asset (static, parameterized, custom URL, other)."
        isAsset={true}
        buttonStyle="ocean"
      />
    </SectionContainer>
  )
}

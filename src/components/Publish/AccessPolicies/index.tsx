import { useFormikContext } from 'formik'
import { ReactElement } from 'react'
import { FormPublishData } from '../_types'
import AccessRulesSection from './AccessRulesSection'
import SSIPoliciesSection from './SSIPoliciesSection'

export function AccessPolicies(): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormPublishData>()

  // Removed default policy loading - users must manually select policies

  if (!values.accessPolicyPageVisited) {
    setFieldValue('accessPolicyPageVisited', true)
  }

  return (
    <>
      <AccessRulesSection />
      <SSIPoliciesSection
        defaultPolicies={[
          'signature',
          'not-before',
          'revoked-status-list',
          'expired',
          'signature_sd-jwt-vc'
        ]}
      />
    </>
  )
}

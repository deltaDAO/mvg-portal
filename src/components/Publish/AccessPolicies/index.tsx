import { useFormikContext } from 'formik'
import { ReactElement, useEffect, useState } from 'react'
import { FormPublishData } from '../_types'
import appConfig from 'app.config.cjs'
import { getDefaultPolicies } from '../_utils'
import { LoggerInstance } from '@oceanprotocol/lib'
import AccessRulesSection from './AccessRulesSection'
import SSIPoliciesSection from './SSIPoliciesSection'

export function AccessPolicies(): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormPublishData>()
  const [defaultPolicies, setDefaultPolicies] = useState<string[]>([])

  useEffect(() => {
    if (appConfig.ssiEnabled) {
      getDefaultPolicies()
        .then((policies) => {
          setDefaultPolicies(policies)
        })
        .catch((error) => {
          LoggerInstance.error(error)
          setDefaultPolicies([])
        })
    }

    if (values.accessPolicyPageVisited) {
      return
    }
    setFieldValue('accessPolicyPageVisited', true)
  }, [])

  return (
    <>
      <AccessRulesSection />
      <SSIPoliciesSection defaultPolicies={defaultPolicies} />
    </>
  )
}

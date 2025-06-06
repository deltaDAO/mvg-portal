import { useFormikContext } from 'formik'
import { ReactElement, useEffect, useState } from 'react'
import { FormPublishData } from '../_types'
import appConfig from 'app.config.cjs'
import { getDefaultPolicies } from '../_utils'
import { LoggerInstance } from '@oceanprotocol/lib'
import AccessRulesSection from './AccessRulesSection'
import SSIPoliciesSection from './SSIPoliciesSection'
import styles from './index.module.css'

export function AccessPolicies(): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormPublishData>()
  const [defaultPolicies, setDefaultPolicies] = useState<string[]>([])

  useEffect(() => {
    if (appConfig.ssiEnabled) {
      getDefaultPolicies()
        .then((policies) => {
          setFieldValue('credentials.vcPolicies', policies)
          setDefaultPolicies(policies)
        })
        .catch((error) => {
          LoggerInstance.error(error)
          setFieldValue('credentials.vcPolicies', [])
          setDefaultPolicies([])
        })
    }

    if (values.accessPolicyPageVisited) {
      return
    }
    setFieldValue('accessPolicyPageVisited', true)
  }, [])

  return (
    <div className={styles.accessPoliciesContainer}>
      <AccessRulesSection />
      <SSIPoliciesSection defaultPolicies={defaultPolicies} />
    </div>
  )
}

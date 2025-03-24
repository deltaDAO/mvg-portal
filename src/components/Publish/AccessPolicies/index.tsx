import { Field, useFormikContext } from 'formik'
import { ReactElement, useEffect, useState } from 'react'
import { FormPublishData } from '../_types'
import Input from '@components/@shared/FormInput'
import { PolicyEditor } from '@components/@shared/PolicyEditor'
import { getFieldContent } from '@utils/form'
import appConfig from 'app.config.cjs'
import { getDefaultPolicies } from '../_utils'
import { LoggerInstance } from '@oceanprotocol/lib'
import content from '../../../../content/publish/form.json'

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
    <>
      <Field
        {...getFieldContent('allow', content.credentials.fields)}
        component={Input}
        name="credentials.allow"
      />
      <Field
        {...getFieldContent('deny', content.credentials.fields)}
        component={Input}
        name="credentials.deny"
      />

      {appConfig.ssiEnabled ? (
        <PolicyEditor
          label="SSI Policies"
          credentials={values.credentials}
          setCredentials={(newCredentials) =>
            setFieldValue('credentials', newCredentials)
          }
          name="credentials"
          defaultPolicies={defaultPolicies}
        />
      ) : (
        <></>
      )}
    </>
  )
}

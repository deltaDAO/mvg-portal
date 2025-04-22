import { ReactElement, useEffect, useState } from 'react'
import { Field, Form, useFormikContext } from 'formik'
import Input from '@shared/FormInput'
import FormActions from './FormActions'
import { getFieldContent } from '@utils/form'
import consumerParametersContent from '../../../../content/publish/consumerParameters.json'
import { ServiceEditForm } from './_types'
import IconDownload from '@images/download.svg'
import IconCompute from '@images/compute.svg'
import FormEditComputeService from './FormEditComputeService'
import { defaultServiceComputeOptions } from './_constants'
import styles from './index.module.css'
import { Service } from 'src/@types/ddo/Service'
import { getDefaultPolicies } from '@components/Publish/_utils'
import appConfig from 'app.config.cjs'
import { PolicyEditor } from '@components/@shared/PolicyEditor'
import { LoggerInstance } from '@oceanprotocol/lib'

interface Language {
  code: string
  name: string
  direction: 'ltr' | 'rtl'
}

const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', direction: 'ltr' },
  { code: 'fr', name: 'French', direction: 'ltr' },
  { code: 'de', name: 'German', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', direction: 'ltr' },
  { code: 'ru', name: 'Russian', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', direction: 'rtl' },
  { code: 'he', name: 'Hebrew', direction: 'rtl' },
  { code: 'fa', name: 'Persian', direction: 'rtl' },
  { code: 'ur', name: 'Urdu', direction: 'rtl' },
  { code: 'hi', name: 'Hindi', direction: 'ltr' },
  { code: 'ro', name: 'Romanian', direction: 'ltr' },
  { code: 'it', name: 'Italian', direction: 'ltr' },
  { code: 'nl', name: 'Dutch', direction: 'ltr' },
  { code: 'tr', name: 'Turkish', direction: 'ltr' },
  { code: 'ko', name: 'Korean', direction: 'ltr' },
  { code: 'pl', name: 'Polish', direction: 'ltr' }
]

export default function FormEditService({
  data,
  chainId,
  service,
  accessDetails
}: {
  data: FormFieldContent[]
  chainId: number
  service: Service
  accessDetails: AccessDetails
}): ReactElement {
  const formUniqueId = service.id // because BoxSelection component is not a Formik component
  const { values, setFieldValue } = useFormikContext<ServiceEditForm>()
  const [defaultPolicies, setDefaultPolicies] = useState<string[]>([])

  const accessTypeOptionsTitles = getFieldContent('access', data).options

  const accessTypeOptions = [
    {
      name: `access-${formUniqueId}-download`,
      value: 'access',
      title: accessTypeOptionsTitles[0],
      icon: <IconDownload />,
      // BoxSelection component is not a Formik component
      // so we need to handle checked state manually.
      checked: values.access === 'access'
    },
    {
      name: `access-${formUniqueId}-compute`,
      value: 'compute',
      title: accessTypeOptionsTitles[1],
      icon: <IconCompute />,
      checked: values.access === 'compute'
    }
  ]

  const languageOptions = supportedLanguages
    .map((lang) => lang.name)
    .sort((a, b) => a.localeCompare(b))

  useEffect(() => {
    const languageName = values.language
    if (!languageName) return

    const selectedLanguage = supportedLanguages.find(
      (lang) => lang.name === languageName
    )
    if (selectedLanguage) {
      setFieldValue('direction', selectedLanguage.direction)
    }
  }, [values?.language, setFieldValue])
  useEffect(() => {
    if (
      !values.language ||
      values.language === '' ||
      values.language === undefined
    ) {
      setFieldValue('language', 'English')
      setFieldValue('direction', 'ltr')
    }
  }, [values.language, setFieldValue])

  useEffect(() => {
    if (appConfig.ssiEnabled) {
      getDefaultPolicies()
        .then((policies) => {
          const newVcPolicies = [
            ...new Set(policies.concat(values.credentials.vcPolicies))
          ]
          setFieldValue('credentials.vcPolicies', newVcPolicies)
          setDefaultPolicies(policies)
        })
        .catch((error) => {
          LoggerInstance.error(error)
          setFieldValue('credentials.vcPolicies', [])
          setDefaultPolicies([])
        })
    }
  }, [])

  return (
    <Form className={styles.form}>
      <Field {...getFieldContent('name', data)} component={Input} name="name" />
      <Field
        {...getFieldContent('description', data)}
        component={Input}
        name="description"
      />
      <Field
        {...getFieldContent('language', data)}
        component={Input}
        name="language"
        type="select"
        options={languageOptions}
      />
      <Field
        {...getFieldContent('direction', data)}
        component={Input}
        name="direction"
        readOnly
      />

      <Field
        {...getFieldContent('access', data)}
        component={Input}
        name="access"
        options={accessTypeOptions}
        disabled={true}
      />

      {values.access === 'compute' && (
        <FormEditComputeService
          chainId={chainId}
          serviceEndpoint={service.serviceEndpoint} // if we allow editing serviceEndpoint, we need to update it here
          serviceCompute={service.compute || defaultServiceComputeOptions}
        />
      )}

      <Field
        {...getFieldContent('price', data)}
        component={Input}
        name="price"
        disabled={accessDetails.type === 'free'}
      />

      <Field
        {...getFieldContent('paymentCollector', data)}
        component={Input}
        name="paymentCollector"
      />

      <Field
        {...getFieldContent('providerUrl', data)}
        component={Input}
        name="providerUrl"
        disabled={true} // TODO tied with files and compute - not editable now
      />

      <Field
        {...getFieldContent('files', data)}
        component={Input}
        name="files"
      />

      <Field
        {...getFieldContent('timeout', data)}
        component={Input}
        name="timeout"
      />

      <Field
        {...getFieldContent('state', data)}
        component={Input}
        name="state"
      />

      <Field
        {...getFieldContent('allow', data)}
        component={Input}
        name="credentials.allow"
      />
      <Field
        {...getFieldContent('deny', data)}
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
          defaultPolicies={defaultPolicies}
          name="credentials"
        />
      ) : (
        <></>
      )}

      <Field
        {...getFieldContent('usesConsumerParameters', data)}
        component={Input}
        name="usesConsumerParameters"
      />
      {values.usesConsumerParameters && (
        <Field
          {...getFieldContent(
            'consumerParameters',
            consumerParametersContent.consumerParameters.fields
          )}
          component={Input}
          name="consumerParameters"
        />
      )}
      <FormActions />
    </Form>
  )
}

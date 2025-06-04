import { ReactElement, useEffect, useState, useMemo } from 'react'
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
import { supportedLanguages } from '../languageType'

export default function FormEditService({
  data,
  chainId,
  service,
  accessDetails,
  assetType
}: {
  data: FormFieldContent[]
  chainId: number
  service: Service
  accessDetails: AccessDetails
  assetType: string
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

  const languageOptions = useMemo(() => {
    return supportedLanguages
      .map((lang) => lang.name)
      .sort((a, b) => a.localeCompare(b))
  }, [])

  useEffect(() => {
    if (!values.language || values.language === '') {
      setFieldValue('language', 'en')
      setFieldValue('direction', 'ltr')
    }
  }, [setFieldValue, values.language])

  const handleLanguageChange = (languageName: string) => {
    const selectedLanguage = supportedLanguages.find(
      (lang) => lang.name === languageName
    )

    if (selectedLanguage) {
      setFieldValue('language', selectedLanguage.code)
      setFieldValue('direction', selectedLanguage.direction)
    }
  }

  const getCurrentLanguageName = () => {
    if (!values.language) return ''

    const language = supportedLanguages.find(
      (lang) => lang.code === values.language
    )
    return language?.name || ''
  }

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
        value={getCurrentLanguageName()}
        onChange={(e) => handleLanguageChange(e.target.value)}
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

      {values.access === 'compute' && assetType === 'dataset' && (
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
          help="Self-sovereign identity (SSI) is used verify the consumer of an asset. Indicate which SSI policy is required for this asset (static, parameterized, custom URL, other)."
          enabledView={values.credentials.requestCredentials?.length > 0}
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

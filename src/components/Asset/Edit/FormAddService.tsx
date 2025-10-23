import { ReactElement, useEffect, useMemo, useState } from 'react'
import { Field, Form, useFormikContext } from 'formik'
import Input from '@shared/FormInput'
import FormActions from './FormActions'
import { getFieldContent } from '@utils/form'
import consumerParametersContent from '../../../../content/publish/consumerParameters.json'
import content from '../../../../content/publish/form.json'
import { ServiceEditForm } from './_types'
import IconDownload from '@images/download.svg'
import IconCompute from '@images/compute.svg'
import FormEditComputeService from './FormEditComputeService'
import { defaultServiceComputeOptions } from './_constants'
import { getDefaultPolicies } from '@components/Publish/_utils'
import appConfig from 'app.config.cjs'
import { LoggerInstance } from '@oceanprotocol/lib'
import { supportedLanguages } from '../languageType'
import ContainerForm from '@shared/atoms/ContainerForm'
import AccessRulesSection from '@components/Publish/AccessPolicies/AccessRulesSection'
import SSIPoliciesSection from './SSIPoliciesSection'

export default function FormAddService({
  data,
  chainId,
  assetType
}: {
  data: FormFieldContent[]
  chainId: number
  assetType: string
}): ReactElement {
  const { values, setFieldValue } = useFormikContext<ServiceEditForm>()
  const [defaultPolicies, setDefaultPolicies] = useState<string[]>([])

  const accessTypeOptionsTitles = getFieldContent('access', data).options

  useEffect(() => {
    if (!values.language || values.language === '') {
      setFieldValue('language', 'en')
      setFieldValue('direction', 'ltr')
    }
  }, [setFieldValue, values.language])

  const languageOptions = useMemo(() => {
    return supportedLanguages
      .map((lang) => lang.name)
      .sort((a, b) => a.localeCompare(b))
  }, [])

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

  const accessTypeOptions = [
    {
      name: 'access-download',
      value: 'access',
      title: accessTypeOptionsTitles[0],
      icon: <IconDownload />,
      // BoxSelection component is not a Formik component
      // so we need to handle checked state manually.
      checked: values.access === 'access'
    },
    {
      name: 'access-compute',
      value: 'compute',
      title: accessTypeOptionsTitles[1],
      icon: <IconCompute />,
      checked: values.access === 'compute'
    }
  ]

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
  }, [setFieldValue])

  return (
    <Form>
      <ContainerForm style="publish">
        <Field
          {...getFieldContent('name', data)}
          component={Input}
          name="name"
        />

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
        />

        {values.access === 'compute' && assetType === 'dataset' && (
          <FormEditComputeService
            chainId={chainId}
            serviceEndpoint={values.providerUrl.url}
            serviceCompute={defaultServiceComputeOptions}
          />
        )}

        <Field
          {...getFieldContent('price', data)}
          component={Input}
          name="price"
          min={1}
          step={0.01}
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
          disabled={true}
        />

        <Field
          {...getFieldContent('files', content.services.fields)}
          component={Input}
          name="files"
        />

        <Field
          {...getFieldContent('timeout', data)}
          component={Input}
          name="timeout"
        />

        <AccessRulesSection fieldPrefix="credentials" />

        <SSIPoliciesSection
          defaultPolicies={defaultPolicies}
          isAsset={false}
          hideDefaultPolicies={true}
        />

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
      </ContainerForm>
    </Form>
  )
}

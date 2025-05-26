import Input from '@shared/FormInput'
import { Field, useFormikContext } from 'formik'
import { ReactElement, useEffect, useState, useMemo } from 'react'
import IconDownload from '@images/download.svg'
import IconCompute from '@images/compute.svg'
import content from '../../../../content/publish/form.json'
import consumerParametersContent from '../../../../content/publish/consumerParameters.json'
import { getFieldContent } from '@utils/form'
import { FormPublishData } from '../_types'
import { useMarketMetadata } from '@context/MarketMetadata'
import { PolicyEditor } from '@components/@shared/PolicyEditor'
import { getDefaultPolicies } from '../_utils'
import { LoggerInstance } from '@oceanprotocol/lib'
import { supportedLanguages } from '@components/Asset/languageType'
import FormEditComputeService from '@components/Asset/Edit/FormEditComputeService'

const accessTypeOptionsTitles = getFieldContent(
  'access',
  content.services.fields
).options

export default function ServicesFields(): ReactElement {
  const { appConfig } = useMarketMetadata()
  const [defaultPolicies, setDefaultPolicies] = useState<string[]>([])

  // connect with Form state, use for conditional field rendering
  const { values, setFieldValue } = useFormikContext<FormPublishData>()

  // 1. Create display options (names) and maintain code mapping
  const languageOptions = useMemo(() => {
    return supportedLanguages
      .map((lang) => lang.name)
      .sort((a, b) => a.localeCompare(b))
  }, [])

  // 2. Set default language (English code 'en')
  useEffect(() => {
    if (!values.services?.[0]?.description?.language) {
      setFieldValue('services[0].description.language', 'en')
      setFieldValue('services[0].description.direction', 'ltr')
    }
  }, [setFieldValue, values.services])

  const handleLanguageChange = (languageName: string) => {
    const selectedLanguage = supportedLanguages.find(
      (lang) => lang.name === languageName
    )

    if (selectedLanguage) {
      setFieldValue('services[0].description.language', selectedLanguage.code)
      setFieldValue(
        'services[0].description.direction',
        selectedLanguage.direction
      )
    }
  }
  const getCurrentLanguageName = () => {
    const currentCode = values.services?.[0]?.description?.language
    if (!currentCode) return ''

    const language = supportedLanguages.find(
      (lang) => lang.code === currentCode
    )
    return language?.name || ''
  }

  // name and title should be download, but option value should be access, probably the best way would be to change the component so that option is an object like {name,value}
  const accessTypeOptions = [
    {
      name: 'download',
      value: accessTypeOptionsTitles[0].toLowerCase(),
      title: 'Download',
      icon: <IconDownload />,
      // BoxSelection component is not a Formik component
      // so we need to handle checked state manually.
      checked:
        values.services[0].access === accessTypeOptionsTitles[0].toLowerCase()
    },
    {
      name: accessTypeOptionsTitles[1].toLowerCase(),
      value: accessTypeOptionsTitles[1].toLowerCase(),
      title: accessTypeOptionsTitles[1],
      icon: <IconCompute />,
      checked:
        values.services[0].access === accessTypeOptionsTitles[1].toLowerCase()
    }
  ]

  // Auto-change access type based on algo privacy boolean.
  // Could be also done later in transformPublishFormToDdo().
  useEffect(() => {
    if (
      values.services[0].algorithmPrivacy === null ||
      values.services[0].algorithmPrivacy === undefined
    )
      return

    setFieldValue(
      'services[0].access',
      values.services[0].algorithmPrivacy === true ? 'compute' : 'access'
    )
  }, [values.services[0].algorithmPrivacy, setFieldValue])

  useEffect(() => {
    if (appConfig.ssiEnabled) {
      getDefaultPolicies()
        .then((policies) => {
          setFieldValue('services[0].credentials.vcPolicies', policies)
          setDefaultPolicies(policies)
        })
        .catch((error) => {
          LoggerInstance.error(error)
          setFieldValue('services[0].credentials.vcPolicies', [])
          setDefaultPolicies([])
        })
    }
  }, [])

  return (
    <>
      <div style={{ display: 'none' }}>
        <Field
          {...getFieldContent('dataTokenOptions', content.services.fields)}
          component={Input}
          name="services[0].dataTokenOptions"
        />
      </div>
      <Field
        {...getFieldContent('name', content.services.fields)}
        component={Input}
        name="services[0].name"
      />
      <Field
        {...getFieldContent('description', content.services.fields)}
        component={Input}
        name="services[0].description.value"
      />
      <Field
        {...getFieldContent('language', content.services.fields)}
        component={Input}
        name="services[0].description.language"
        type="select"
        options={languageOptions}
        value={getCurrentLanguageName()}
        onChange={(e) => handleLanguageChange(e.target.value)}
      />
      <Field
        {...getFieldContent('direction', content.services.fields)}
        component={Input}
        name="services[0].description.direction"
        readOnly
      />
      {values.metadata.type === 'algorithm' ? (
        <Field
          {...getFieldContent('algorithmPrivacy', content.services.fields)}
          component={Input}
          name="services[0].algorithmPrivacy"
        />
      ) : (
        <>
          <Field
            {...getFieldContent('access', content.services.fields)}
            component={Input}
            name="services[0].access"
            options={accessTypeOptions}
          />
          {values.services[0]?.access === 'compute' && (
            <FormEditComputeService
              chainId={values?.user?.chainId}
              serviceEndpoint={values.services[0].providerUrl.url}
              serviceCompute={values.services[0]?.computeOptions}
            />
          )}
        </>
      )}
      <Field
        {...getFieldContent('providerUrl', content.services.fields)}
        component={Input}
        name="services[0].providerUrl"
      />
      <Field
        {...getFieldContent('files', content.services.fields)}
        component={Input}
        name="services[0].files"
      />
      <Field
        {...getFieldContent('links', content.services.fields)}
        component={Input}
        name="services[0].links"
      />
      <Field
        {...getFieldContent('timeout', content.services.fields)}
        component={Input}
        name="services[0].timeout"
      />
      <Field
        {...getFieldContent('allow', content.credentials.fields)}
        component={Input}
        name="services[0].credentials.allow"
      />
      <Field
        {...getFieldContent('deny', content.credentials.fields)}
        component={Input}
        name="services[0].credentials.deny"
      />

      {appConfig.ssiEnabled ? (
        <PolicyEditor
          label="SSI Policies"
          credentials={values.services[0].credentials}
          setCredentials={(newCredentials) =>
            setFieldValue('services[0].credentials', newCredentials)
          }
          name="services[0].credentials"
          defaultPolicies={defaultPolicies}
          help="Self-sovereign identity (SSI) is used verify the consumer of an asset. Indicate which SSI policy is required for this asset (static, parameterized, custom URL, other)."
        />
      ) : (
        <></>
      )}

      <Field
        {...getFieldContent('usesConsumerParameters', content.services.fields)}
        component={Input}
        name="services[0].usesConsumerParameters"
      />

      {values.services[0].usesConsumerParameters && (
        <Field
          {...getFieldContent(
            'consumerParameters',
            consumerParametersContent.consumerParameters.fields
          )}
          component={Input}
          name="services[0].consumerParameters"
        />
      )}
    </>
  )
}

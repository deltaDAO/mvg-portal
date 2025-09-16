import Input from '@shared/FormInput'
import { Field, useFormikContext } from 'formik'
import { ReactElement, useEffect, useState, useMemo } from 'react'
import IconDownload from '@images/download2.svg'
import IconCompute from '@images/compute.svg'
import content from '../../../../content/publish/form.json'
import { getFieldContent } from '@utils/form'
import { FormPublishData } from '../_types'
import { useMarketMetadata } from '@context/MarketMetadata'
import { supportedLanguages } from '@components/Asset/languageType'
import FormEditComputeService from '@components/Asset/Edit/FormEditComputeService'
import AccessRulesSection from '../AccessPolicies/AccessRulesSection'
import ConsumerParametersSection from '../../@shared/ConsumerParametersSection'
import SSIPoliciesSection from '../../@shared/SSIPoliciesSection'

import SectionContainer from '../../@shared/SectionContainer/SectionContainer'

const accessTypeOptionsTitles = getFieldContent(
  'access',
  content.services.fields
).options

export default function ServicesFields(): ReactElement {
  const { appConfig } = useMarketMetadata()

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
      icon: <IconDownload fill="var(--publish-white)" />,
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
    if (values.metadata.type !== 'algorithm') return

    if (
      values.services[0].algorithmPrivacy === null ||
      values.services[0].algorithmPrivacy === undefined
    )
      return

    setFieldValue(
      'services[0].access',
      values.services[0].algorithmPrivacy === true ? 'compute' : 'access'
    )
  }, [values.services[0].algorithmPrivacy, values.metadata.type, setFieldValue])

  // Removed default policy loading - users must manually select policies

  return (
    <>
      <div style={{ display: 'none' }}>
        <Field
          {...getFieldContent('dataTokenOptions', content.services.fields)}
          component={Input}
          name="services[0].dataTokenOptions"
        />
      </div>

      <SectionContainer title="Service Data" required>
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
          selectStyle="serviceLanguage"
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
      </SectionContainer>

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

      <SectionContainer
        title="Service Configuration"
        required
        help="Configure essential settings for your service here. Upload relevant files using the appropriate field. Enter your service provider's URL and any associated links, and specify the timeout duration as needed. Ensure all details are accurately entered for optimal service performance."
      >
        {/* Card 1: File Upload Card */}
        <SectionContainer border padding="16px">
          <Field
            {...getFieldContent('files', content.services.fields)}
            component={Input}
            name="services[0].files"
          />
        </SectionContainer>

        {/* Card 2: Provider URL Card */}
        <SectionContainer border padding="16px">
          <Field
            {...getFieldContent('providerUrl', content.services.fields)}
            component={Input}
            name="services[0].providerUrl"
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
        </SectionContainer>
      </SectionContainer>

      <AccessRulesSection fieldPrefix="services[0].credentials" />

      <SSIPoliciesSection
        defaultPolicies={[]}
        fieldNamePrefix="services[0]"
        showEnableCheckbox={true}
        hideDefaultPolicies={true}
        isAsset={false}
      />

      <ConsumerParametersSection
        fieldNamePrefix="services[0]"
        type="publishConsumerParameters"
      />
    </>
  )
}

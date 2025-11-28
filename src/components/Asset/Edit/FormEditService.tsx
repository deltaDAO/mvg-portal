import { ReactElement, useEffect, useMemo } from 'react'
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
import { Service } from 'src/@types/ddo/Service'
import { FileInfo } from '@oceanprotocol/lib'
import { supportedLanguages } from '../languageType'
import ContainerForm from '@components/@shared/atoms/ContainerForm'
import SSIPoliciesSection from './SSIPoliciesSection'
import AccessRulesSection from '@components/Publish/AccessPolicies/AccessRulesSection'

export default function FormEditService({
  data,
  chainId,
  service,
  accessDetails,
  assetType,
  existingFileType
}: {
  data: FormFieldContent[]
  chainId: number
  service: Service
  accessDetails: AccessDetails
  assetType: string
  existingFileType?: string
}): ReactElement {
  const formUniqueId = service.id
  const { values, setFieldValue } = useFormikContext<ServiceEditForm>()

  type EditableFileInfo = FileInfo & { isEncrypted?: boolean }

  const computeExistingFileNotice = (file?: EditableFileInfo) => {
    if (!file) return true
    if (!file.url) return true
    return Boolean(file.isEncrypted)
  }

  const showExistingFileNotice = Boolean(
    existingFileType && computeExistingFileNotice(values.files?.[0])
  )

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
          disabled={true}
        />

        {values.access === 'compute' && assetType === 'dataset' && (
          <FormEditComputeService
            chainId={chainId}
            serviceEndpoint={service.serviceEndpoint} // if we allow editing serviceEndpoint, we need to update it here
            serviceCompute={service.compute || defaultServiceComputeOptions}
          />
        )}

        {accessDetails.type === 'free' ? (
          <Field
            {...getFieldContent('new-price', data)}
            component={Input}
            name="price"
            disabled={true}
          />
        ) : (
          <Field
            {...getFieldContent('price', data)}
            component={Input}
            name="price"
          />
        )}

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
          activeFileType={existingFileType}
          existingFilePlaceholder={
            existingFileType
              ? '[Encrypted file - URL not available for editing]'
              : undefined
          }
          showExistingFileNotice={showExistingFileNotice}
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

        <AccessRulesSection fieldPrefix="credentials" />

        <SSIPoliciesSection
          defaultPolicies={[]}
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

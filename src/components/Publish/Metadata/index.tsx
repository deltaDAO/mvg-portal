import { BoxSelectionOption } from '@shared/FormInput/InputElement/BoxSelection'
import Input from '@shared/FormInput'
import { Field, useField, useFormikContext } from 'formik'
import { ReactElement, useEffect } from 'react'
import content from '../../../../content/publish/form.json'
import consumerParametersContent from '../../../../content/publish/consumerParameters.json'
import { FormPublishData } from '../_types'
import IconDataset from '@images/dataset.svg'
import IconAlgorithm from '@images/algorithm.svg'
import { algorithmContainerPresets } from '../_constants'
import { getFieldContent } from '@utils/form'
import { deleteIpfsFile, uploadFileItemToIPFS } from '@utils/ipfs'
import { FileUpload } from '@components/@shared/FileUpload'
import Label from '@components/@shared/FormInput/Label'
import { FileItem } from '@utils/fileItem'
import { License } from 'src/@types/ddo/License'
import { RemoteObject } from 'src/@types/ddo/RemoteObject'
import { LoggerInstance } from '@oceanprotocol/lib'
import appConfig from 'app.config.cjs'
import { toast } from 'react-toastify'
import URLInput from '@shared/FormInput/InputElement/URLInput'
import Button from '@shared/atoms/Button'
import SectionContainer from './SectionContainer'
import styles from './index.module.css'

const assetTypeOptionsTitles = getFieldContent(
  'type',
  content.metadata.fields
).options

export default function MetadataFields(): ReactElement {
  // connect with Form state, use for conditional field rendering
  const { values, setFieldValue } = useFormikContext<FormPublishData>()

  const [field, meta] = useField('metadata.dockerImageCustomChecksum')

  // BoxSelection component is not a Formik component
  // so we need to handle checked state manually.
  const assetTypeOptions: BoxSelectionOption[] = [
    {
      name: assetTypeOptionsTitles[0].toLowerCase(),
      title: assetTypeOptionsTitles[0],
      checked: values.metadata.type === assetTypeOptionsTitles[0].toLowerCase(),
      icon: <IconDataset />
    },
    {
      name: assetTypeOptionsTitles[1].toLowerCase(),
      title: assetTypeOptionsTitles[1],
      checked: values.metadata.type === assetTypeOptionsTitles[1].toLowerCase(),
      icon: <IconAlgorithm />
    }
  ]

  // Populate the Docker image field with our presets in _constants,
  // transformPublishFormToDdo will do the rest.
  const dockerImageOptions: BoxSelectionOption[] =
    algorithmContainerPresets.map((preset) => ({
      name: `${preset.image}:${preset.tag}`,
      title: `${preset.image}:${preset.tag}`,
      checked: values.metadata.dockerImage === `${preset.image}:${preset.tag}`
    }))

  useEffect(() => {
    setFieldValue(
      'services[0].access',
      values.metadata.type === 'algorithm' ? 'compute' : 'access'
    )
    setFieldValue(
      'services[0].algorithmPrivacy',
      values.metadata.type === 'algorithm'
    )
  }, [values.metadata.type])

  dockerImageOptions.push({
    name: 'custom',
    title: 'Custom',
    checked: values.metadata.dockerImage === 'custom'
  })

  async function handleLicenseFileUpload(
    fileItem: FileItem,
    onError: () => void
  ) {
    try {
      const remoteSource = await uploadFileItemToIPFS(fileItem)
      const remoteObject: RemoteObject = {
        name: fileItem.name,
        fileType: fileItem.name.split('.').pop(),
        sha256: fileItem.checksum,
        additionalInformation: {},
        description: {
          '@value': '',
          '@direction': '',
          '@language': ''
        },
        displayName: {
          '@value': fileItem.name,
          '@language': '',
          '@direction': ''
        },
        mirrors: [remoteSource]
      }

      const license: License = {
        name: fileItem.name,
        licenseDocuments: [remoteObject]
      }

      setFieldValue('metadata.uploadedLicense', license)
    } catch (err) {
      toast.error('Could not upload file')
      LoggerInstance.error(err)
      setFieldValue('metadata.uploadedLicense', undefined)
      onError()
    }
  }

  // Resets license data after type change
  useEffect(() => {
    async function deleteRemoteFile() {
      if (values.metadata.uploadedLicense) {
        const ipfsHash =
          values.metadata.uploadedLicense?.licenseDocuments?.[0]?.mirrors?.[0]
            ?.ipfsCid
        if (appConfig.ipfsUnpinFiles && ipfsHash && ipfsHash.length > 0) {
          try {
            await deleteIpfsFile(ipfsHash)
          } catch (error) {
            LoggerInstance.error("Can't delete license file")
          }
        }

        await setFieldValue('metadata.uploadedLicense', undefined)
      }
    }

    if (values.metadata.licenseTypeSelection === 'Upload license file') {
      // Only set licenseUrl when explicitly selecting "Upload license file"
      setFieldValue('metadata.licenseUrl', [{ url: '', type: 'url' }])
    } else if (values.metadata.licenseTypeSelection !== '') {
      // Only delete remote file if a different option (not empty) is selected
      deleteRemoteFile()
    }
  }, [values.metadata.licenseTypeSelection])

  function handleLicenseUrlValidation(e: React.SyntheticEvent, url: string) {
    // For now, just update the field value - can add validation logic later
    setFieldValue('metadata.licenseUrl', [{ url, type: 'url', valid: true }])
  }

  return (
    <div>
      <Field
        {...getFieldContent('nft', content.metadata.fields)}
        component={Input}
        name="metadata.nft"
      />
      <Field
        {...getFieldContent('name', content.metadata.fields)}
        component={Input}
        name="metadata.name"
      />
      <Field
        {...getFieldContent('description', content.metadata.fields)}
        component={Input}
        name="metadata.description"
        rows={7}
      />
      <Field
        {...getFieldContent('tags', content.metadata.fields)}
        component={Input}
        name="metadata.tags"
      />
      <Field
        {...getFieldContent('author', content.metadata.fields)}
        component={Input}
        name="metadata.author"
      />

      <Field
        {...getFieldContent('type', content.metadata.fields)}
        component={Input}
        name="metadata.type"
        options={assetTypeOptions}
      />
      {values.metadata.type === 'dataset' && (
        <Field
          {...getFieldContent('dataSubjectConsent', content.metadata.fields)}
          component={Input}
          name="metadata.dataSubjectConsent"
        />
      )}

      {values.metadata.type === 'algorithm' && (
        <>
          <SectionContainer title="Docker configuration" required>
            <Field
              {...getFieldContent('dockerImage', content.metadata.fields)}
              component={Input}
              name="metadata.dockerImage"
              options={dockerImageOptions}
            />
            {values.metadata.dockerImage === 'custom' && (
              <>
                <Field
                  {...getFieldContent(
                    'dockerImageCustom',
                    content.metadata.fields
                  )}
                  component={Input}
                  name="metadata.dockerImageCustom"
                />
                <Field
                  {...getFieldContent(
                    'dockerImageChecksum',
                    content.metadata.fields
                  )}
                  component={Input}
                  name="metadata.dockerImageCustomChecksum"
                  disabled={
                    values.metadata.dockerImageCustomChecksum && !meta.touched
                  }
                />
                <Field
                  {...getFieldContent(
                    'dockerImageCustomEntrypoint',
                    content.metadata.fields
                  )}
                  component={Input}
                  name="metadata.dockerImageCustomEntrypoint"
                />
              </>
            )}
          </SectionContainer>

          {/* Custom Parameters Section */}
          <SectionContainer title="Custom Parameters">
            <Field
              {...getFieldContent(
                'usesConsumerParameters',
                content.metadata.fields
              )}
              component={Input}
              name="metadata.usesConsumerParameters"
            />
            {values.metadata.usesConsumerParameters && (
              <div className={styles.customParametersContent}>
                <Field
                  {...getFieldContent(
                    'consumerParameters',
                    consumerParametersContent.consumerParameters.fields
                  )}
                  component={Input}
                  name="metadata.consumerParameters"
                  type="publishConsumerParameters"
                />
              </div>
            )}
          </SectionContainer>
        </>
      )}

      {/*
       Licensing and Terms
      */}
      <SectionContainer title="License">
        <div className={styles.licenseDropdownWrapper}>
          <Field
            {...getFieldContent(
              'licenseTypeSelection',
              content.metadata.fields
            )}
            component={Input}
            name="metadata.licenseTypeSelection"
          />
        </div>
        {values.metadata.licenseTypeSelection === 'Upload license file' && (
          <div className={styles.licenseUrlContainer}>
            <Label htmlFor="licenseFile">File *</Label>
            <div className={styles.licenseUrlWrapper}>
              <URLInput
                submitText="Validate"
                name="metadata.licenseUrl[0].url"
                placeholder="e.g. https://file.com/license.json"
                isLoading={false}
                handleButtonClick={handleLicenseUrlValidation}
                storageType="url"
                checkUrl={true}
                buttonStyle="publish"
              />
            </div>
          </div>
        )}
      </SectionContainer>

      <div className={styles.termsAndConditionsContainer}>
        <Field
          {...getFieldContent('termsAndConditions', content.metadata.fields)}
          component={Input}
          name="metadata.termsAndConditions"
        />
      </div>
    </div>
  )
}

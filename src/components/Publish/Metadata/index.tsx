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

  dockerImageOptions.push({ name: 'custom', title: 'Custom', checked: false })

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

    if (!values.metadata.useRemoteLicense) {
      deleteRemoteFile()
    } else {
      setFieldValue('metadata.licenseUrl', [{ url: '', type: 'url' }])
    }
  }, [values.metadata.useRemoteLicense])

  return (
    <>
      <Field
        {...getFieldContent('nft', content.metadata.fields)}
        component={Input}
        name="metadata.nft"
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

      {values.metadata.type === 'algorithm' && (
        <>
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
          <Field
            {...getFieldContent(
              'usesConsumerParameters',
              content.metadata.fields
            )}
            component={Input}
            name="metadata.usesConsumerParameters"
          />
          {values.metadata.usesConsumerParameters && (
            <Field
              {...getFieldContent(
                'consumerParameters',
                consumerParametersContent.consumerParameters.fields
              )}
              component={Input}
              name="metadata.consumerParameters"
            />
          )}
        </>
      )}

      {/*
       Licensing and Terms
      */}
      <Field
        {...getFieldContent('licenseTypeSelection', content.metadata.fields)}
        component={Input}
        name="metadata.useRemoteLicense"
      />
      {values.metadata.useRemoteLicense ? (
        <>
          <Label htmlFor="license">License *</Label>
          <FileUpload
            fileName={values.metadata?.uploadedLicense?.name}
            buttonLabel="Upload"
            setFileItem={handleLicenseFileUpload}
          ></FileUpload>
        </>
      ) : (
        <>
          <Field
            {...getFieldContent('license', content.metadata.fields)}
            component={Input}
            name="metadata.licenseUrl"
          />
        </>
      )}

      <Field
        {...getFieldContent('termsAndConditions', content.metadata.fields)}
        component={Input}
        name="metadata.termsAndConditions"
      />
    </>
  )
}

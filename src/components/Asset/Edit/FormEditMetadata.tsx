import { ReactElement, useEffect, useRef } from 'react'
import { Field, Form, useFormikContext } from 'formik'
import Input from '@shared/FormInput'
import FormActions from './FormActions'
import { useAsset } from '@context/Asset'
import { getFileInfo } from '@utils/provider'
import { getFieldContent } from '@utils/form'
import { isGoogleUrl } from '@utils/url'
import { MetadataEditForm } from './_types'
import content from '../../../../content/pages/editMetadata.json'
import consumerParametersContent from '../../../../content/publish/consumerParameters.json'
import IconDataset from '@images/dataset.svg'
import IconAlgorithm from '@images/algorithm.svg'
import { BoxSelectionOption } from '@components/@shared/FormInput/InputElement/BoxSelection'
import { FileUpload } from '@components/@shared/FileUpload'
import Label from '@components/@shared/FormInput/Label'
import { deleteIpfsFile, uploadFileItemToIPFS } from '@utils/ipfs'
import { FileItem } from '@utils/fileItem'
import { License } from '../../../@types/ddo/License'
import { RemoteObject } from '../../../@types/ddo/RemoteObject'
import SSIPoliciesSection from './SSIPoliciesSection'
import { AdditionalDdosFields } from '@components/@shared/AdditionalDdos'
import ContainerForm from '@components/@shared/atoms/ContainerForm'
import { LoggerInstance } from '@oceanprotocol/lib'
import appConfig from 'app.config.cjs'
import { toast } from 'react-toastify'
import AccessRulesSection from '@components/Publish/AccessPolicies/AccessRulesSection'

const { data } = content.form
const assetTypeOptionsTitles = getFieldContent('type', data).options

export default function FormEditMetadata(): ReactElement {
  const { asset } = useAsset()
  const { values, setFieldValue } = useFormikContext<MetadataEditForm>()
  const firstPageLoad = useRef<boolean>(true)

  // BoxSelection component is not a Formik component
  // so we need to handle checked state manually.
  const assetTypeOptions: BoxSelectionOption[] = [
    {
      name: assetTypeOptionsTitles[0].toLowerCase(),
      title: assetTypeOptionsTitles[0],
      checked: values.type === assetTypeOptionsTitles[0].toLowerCase(),
      icon: <IconDataset />
    },
    {
      name: assetTypeOptionsTitles[1].toLowerCase(),
      title: assetTypeOptionsTitles[1],
      checked: values.type === assetTypeOptionsTitles[1].toLowerCase(),
      icon: <IconAlgorithm />
    }
  ]

  useEffect(() => {
    const providerUrl = asset.credentialSubject?.services[0].serviceEndpoint
    let links = []
    if (asset?.credentialSubject?.metadata?.links) {
      links = Object.values(asset?.credentialSubject?.metadata?.links)
    }

    // if we have a sample file, we need to get the files' info before setting defaults links value
    links[0] &&
      getFileInfo(links[0], providerUrl, 'url').then((checkedFile) => {
        // set valid false if url is using google drive
        if (isGoogleUrl(links[0])) {
          setFieldValue('links', [
            {
              url: links[0],
              valid: false
            }
          ])
          return
        }
        // initiate link with values from asset metadata
        setFieldValue('links', [
          {
            url: links[0],
            type: 'url',
            ...checkedFile[0]
          }
        ])
      })
  }, [
    asset.credentialSubject?.metadata?.links,
    asset.credentialSubject?.services,
    setFieldValue
  ])

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

      setFieldValue('uploadedLicense', license)
    } catch (err) {
      toast.error('Could not upload file')
      LoggerInstance.error(err)
      setFieldValue('uploadedLicense', undefined)
      onError()
    }
  }

  // Resets license data after type change
  useEffect(() => {
    async function deleteRemoteFile() {
      if (values.uploadedLicense) {
        const ipfsHash =
          values.uploadedLicense?.licenseDocuments?.[0]?.mirrors?.[0]?.ipfsCid
        if (appConfig.ipfsUnpinFiles && ipfsHash && ipfsHash?.length > 0) {
          try {
            await deleteIpfsFile(ipfsHash)
          } catch (error) {
            LoggerInstance.error("Can't delete license file")
          }
        }
      }

      await setFieldValue('uploadedLicense', undefined)
    }

    if (firstPageLoad.current) {
      firstPageLoad.current = false
      return
    }

    if (!values.useRemoteLicense) {
      deleteRemoteFile()
    } else {
      setFieldValue('licenseUrl', [{ url: '', type: 'url' }])
    }
  }, [values.useRemoteLicense, setFieldValue, values.uploadedLicense])

  return (
    <Form>
      <ContainerForm style="publish">
        <Field
          {...getFieldContent('type', data)}
          component={Input}
          name="metadata.type"
          options={assetTypeOptions}
          disabled={true}
        />
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
          {...getFieldContent('links', data)}
          component={Input}
          name="links"
        />

        <Field
          {...getFieldContent('tags', data)}
          component={Input}
          name="tags"
        />

        <Field
          {...getFieldContent('author', data)}
          component={Input}
          name="author"
        />
        {asset.credentialSubject?.metadata?.type === 'algorithm' && (
          <>
            <Field
              {...getFieldContent('usesConsumerParameters', data)}
              component={Input}
              name="usesConsumerParameters"
            />
            {(values as unknown as MetadataEditForm).usesConsumerParameters && (
              <Field
                {...getFieldContent(
                  'consumerParameters',
                  consumerParametersContent.consumerParameters.fields
                )}
                component={Input}
                name="consumerParameters"
              />
            )}
          </>
        )}

        <AccessRulesSection fieldPrefix="credentials" />

        <SSIPoliciesSection
          defaultPolicies={[
            'signature',
            'not-before',
            'revoked-status-list',
            'expired',
            'signature_sd-jwt-vc'
          ]}
          isAsset={true}
          hideDefaultPolicies={false}
        />

        <Field
          {...getFieldContent('assetState', data)}
          component={Input}
          name="assetState"
        />

        <Field
          {...getFieldContent('licenseTypeSelection', content.form.data)}
          component={Input}
          name="useRemoteLicense"
        />

        {values.useRemoteLicense ? (
          <>
            <Label htmlFor="license">License *</Label>
            <FileUpload
              fileName={values.uploadedLicense?.name}
              buttonLabel="Upload"
              setFileItem={handleLicenseFileUpload}
            ></FileUpload>
          </>
        ) : (
          <>
            <Field
              {...getFieldContent('license', content.form.data)}
              component={Input}
              name="licenseUrl"
            />
          </>
        )}

        <AdditionalDdosFields />

        <FormActions />
      </ContainerForm>
    </Form>
  )
}

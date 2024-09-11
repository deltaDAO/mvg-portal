import { ReactElement, useEffect } from 'react'
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

const { data } = content.form
const assetTypeOptionsTitles = getFieldContent('type', data).options

export default function FormEditMetadata(): ReactElement {
  const { asset } = useAsset()
  const { values, setFieldValue } = useFormikContext<MetadataEditForm>()

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
    const providerUrl = asset.services[0].serviceEndpoint

    // if we have a sample file, we need to get the files' info before setting defaults links value
    asset?.metadata?.links?.[0] &&
      getFileInfo(asset.metadata.links[0], providerUrl, 'url').then(
        (checkedFile) => {
          // set valid false if url is using google drive
          if (isGoogleUrl(asset.metadata.links[0])) {
            setFieldValue('links', [
              {
                url: asset.metadata.links[0],
                valid: false
              }
            ])
            return
          }
          // initiate link with values from asset metadata
          setFieldValue('links', [
            {
              url: asset.metadata.links[0],
              type: 'url',
              ...checkedFile[0]
            }
          ])
        }
      )
  }, [])

  return (
    <Form>
      <Field
        {...getFieldContent('type', data)}
        component={Input}
        name="metadata.type"
        options={assetTypeOptions}
        disabled={true} // just for view purposes
      />

      <Field {...getFieldContent('name', data)} component={Input} name="name" />

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

      <Field {...getFieldContent('tags', data)} component={Input} name="tags" />

      {asset.metadata.type === 'algorithm' && (
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
      <Field
        {...getFieldContent('allow', data)}
        component={Input}
        name="allow"
      />
      <Field {...getFieldContent('deny', data)} component={Input} name="deny" />

      <Field
        {...getFieldContent('assetState', data)}
        component={Input}
        name="assetState"
      />

      <Field
        {...getFieldContent('license', data)}
        component={Input}
        name="license"
      />

      <FormActions />
    </Form>
  )
}

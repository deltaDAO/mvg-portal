import { ReactElement } from 'react'
import { Field, Form, useFormikContext } from 'formik'
import Input from '@shared/FormInput'
import FormActions from './FormActions'
import { getFieldContent } from '@utils/form'
import consumerParametersContent from '../../../../content/publish/consumerParameters.json'
import { Service } from '@oceanprotocol/lib'
import { ServiceEditForm } from './_types'
import IconDownload from '@images/download.svg'
import IconCompute from '@images/compute.svg'

export default function FormEditService({
  data,
  service,
  accessDetails
}: {
  data: FormFieldContent[]
  service: Service
  accessDetails: AccessDetails
}): ReactElement {
  const formUniqueId = service.id // because BoxSelection component is not a Formik component
  const { values, setFieldValue } = useFormikContext<ServiceEditForm>()

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

  const handleAccessChange = (value: string) => {
    setFieldValue('access', value)
  }

  return (
    <Form style={{ margin: 20 }}>
      <Field {...getFieldContent('name', data)} component={Input} name="name" />

      <Field
        {...getFieldContent('description', data)}
        component={Input}
        name="description"
      />

      <Field
        {...getFieldContent('access', data)}
        component={Input}
        name="access"
        options={accessTypeOptions}
        onChange={handleAccessChange} // because BoxSelection component is not a Formik component and we have could have multiple Formiks on 1 page
        disabled={true}
      />

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
        disabled={true} // TODO tied with files - not editable now
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

import { ReactElement } from 'react'
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

export default function FormAddService({
  data,
  chainId
}: {
  data: FormFieldContent[]
  chainId: number
}): ReactElement {
  const { values, setFieldValue } = useFormikContext<ServiceEditForm>()

  const accessTypeOptionsTitles = getFieldContent('access', data).options

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

  return (
    <Form className={styles.form}>
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
      />

      {values.access === 'compute' && (
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
        min={0} // override the value from edit form
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
        disabled={true} // TODO tied with providerUrl - not editable now
      />

      <Field
        {...getFieldContent('timeout', data)}
        component={Input}
        name="timeout"
      />

      <Field
        {...getFieldContent('allow', data)}
        component={Input}
        name="allow"
      />
      <Field {...getFieldContent('deny', data)} component={Input} name="deny" />

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

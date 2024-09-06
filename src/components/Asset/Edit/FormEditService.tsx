import { ReactElement } from 'react'
import { Field, Form, useFormikContext } from 'formik'
import Input from '@shared/FormInput'
import FormActions from './FormActions'
import { getFieldContent } from '@utils/form'
import consumerParametersContent from '../../../../content/publish/consumerParameters.json'
import Accordion from '@components/@shared/Accordion'
import { Service } from '@oceanprotocol/lib'
import { ServiceEditForm } from './_types'

export default function FormEditService({
  data,
  service,
  accessDetails
}: {
  data: FormFieldContent[]
  service: Service
  accessDetails: AccessDetails
}): ReactElement {
  const { values, setFieldValue } = useFormikContext<ServiceEditForm>()

  return (
    <Form style={{ margin: 20 }}>
      <Accordion title={service.name || service.id}>
        <div style={{ marginTop: 20 }}>
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

          {accessDetails.type === 'fixed' && (
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
        </div>
      </Accordion>
    </Form>
  )
}

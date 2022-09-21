import React, { ChangeEvent, ReactElement } from 'react'
import { Field, Form, FormikContextType, useFormikContext } from 'formik'
import Input from '../../../atoms/Input'
import { FormFieldProps } from '../../../../@types/Form'
import { MetadataPublishFormDataset } from '../../../../@types/MetaData'
import FormActions from './FormActions'
import styles from './FormEditEdgeMetadata.module.css'

export default function FormEditEdgeMetadata({
  data,
  setShowEdit
}: {
  data: FormFieldProps[]
  setShowEdit: (show: boolean) => void
}): ReactElement {
  const {
    validateField,
    setFieldValue
  }: FormikContextType<Partial<MetadataPublishFormDataset>> = useFormikContext()

  // Manually handle change events instead of using `handleChange` from Formik.
  // Workaround for default `validateOnChange` not kicking in
  function handleFieldChange(
    e: ChangeEvent<HTMLInputElement>,
    field: FormFieldProps
  ) {
    validateField(field.name)
    setFieldValue(field.name, e.target.value)
  }

  return (
    <Form className={styles.form}>
      {data.map((field: FormFieldProps) => (
        <Field
          key={field.name}
          options={field.options}
          {...field}
          component={Input}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFieldChange(e, field)
          }
        />
      ))}

      <FormActions setShowEdit={setShowEdit} />
    </Form>
  )
}

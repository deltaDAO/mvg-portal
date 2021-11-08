import axios from 'axios'
import { Field, Form, useFormikContext } from 'formik'
import { graphql, useStaticQuery } from 'gatsby'
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { vpStorageUri } from '../../../../../app.config'
import { FormContent, FormFieldProps } from '../../../../@types/Form'

import { useWeb3 } from '../../../../providers/Web3'
import Button from '../../../atoms/Button'
import Input from '../../../atoms/Input'
import styles from './Verify.module.css'

const query = graphql`
  query {
    content: file(relativePath: { eq: "pages/history.json" }) {
      childPagesJson {
        verify {
          data {
            name
            type
            placeholder
            label
            help
            required
          }
        }
      }
    }
  }
`

export default function VerifyForm({
  accountIdentifier
}: {
  accountIdentifier: string
}): ReactElement {
  const data = useStaticQuery(query)
  const content: FormContent = data.content.childPagesJson.verify

  const {
    status,
    setStatus,
    isValid,
    values,
    setErrors,
    setTouched,
    resetForm,
    validateField,
    setFieldValue
  } = useFormikContext()

  useEffect(() => {
    setErrors({})
    setTouched({})

    // setSubmitting(false)
  }, [setErrors, setTouched])

  const { accountId } = useWeb3()
  const [addOrUpdate, setAddOrUpdate] = useState('Add')
  useEffect(() => {
    axios.get(`${vpStorageUri}/vp/${accountId}`).then((res) => {
      console.log('Set value:', [{ url: res.data.data.vp }])
      if (res.data?.data?.vp) {
        setFieldValue('vp', [{ url: res.data.data.vp }])
        setAddOrUpdate('Update')
      }
    })
  }, [])

  // Manually handle change events instead of using `handleChange` from Formik.
  // Workaround for default `validateOnChange` not kicking in
  function handleFieldChange(
    e: ChangeEvent<HTMLInputElement>,
    field: FormFieldProps
  ) {
    const { value } = e.target
    validateField(field.name)
    setFieldValue(field.name, value)
  }

  console.log('acc:', accountId)
  console.log('valid:', isValid)
  console.log('status:', status)

  return (
    <Form onChange={() => status === 'empty' && setStatus(null)}>
      <h2 className={styles.title}>
        {addOrUpdate} Verifiable Presentation Registry
      </h2>

      {content.data.map(
        (field: FormFieldProps) =>
          field.advanced !== true && (
            <Field
              key={field.name}
              {...field}
              component={Input}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleFieldChange(e, field)
              }
            />
          )
      )}

      <Button
        style="primary"
        type="submit"
        disabled={
          !accountId ||
          accountIdentifier !== accountId ||
          !isValid ||
          status === 'empty'
        }
      >
        Submit
      </Button>
    </Form>
  )
}

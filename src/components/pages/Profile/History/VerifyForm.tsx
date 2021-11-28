import { Logger } from '@oceanprotocol/lib'
import axios from 'axios'
import { Field, Form, useFormikContext } from 'formik'
import { graphql, useStaticQuery } from 'gatsby'
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { FormContent, FormFieldProps } from '../../../../@types/Form'
import {
  RegistryApiResponse,
  VpDataBody
} from '../../../../@types/Verification'
import { useSiteMetadata } from '../../../../hooks/useSiteMetadata'

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

  const { vpRegistryUri } = useSiteMetadata().appConfig

  const {
    isValid,
    setErrors,
    setFieldValue,
    setStatus,
    setTouched,
    status,
    validateField
  } = useFormikContext()

  useEffect(() => {
    setErrors({})
    setTouched({})
  }, [setErrors, setTouched])

  const { accountId } = useWeb3()
  const [addOrUpdate, setAddOrUpdate] = useState('Add')
  useEffect(() => {
    const initFileData = async () => {
      try {
        const response: RegistryApiResponse<VpDataBody> = await axios.get(
          `${vpRegistryUri}/vp/${accountId}`
        )

        setFieldValue('file', [{ url: response.data.data.fileUrl }])
        setAddOrUpdate('Update')
      } catch (error) {
        setAddOrUpdate('Add')
        Logger.error(error.message)
      }
    }
    initFileData()
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

  return (
    <Form onChange={() => status === 'empty' && setStatus(null)}>
      <h2 className={styles.title}>
        {addOrUpdate} Verifiable Presentation Registry
      </h2>

      {content.data.map((field: FormFieldProps) => (
        <Field
          key={field.name}
          {...field}
          component={Input}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFieldChange(e, field)
          }
        />
      ))}

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

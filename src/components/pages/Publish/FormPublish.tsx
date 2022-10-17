import React, {
  ReactElement,
  useEffect,
  FormEvent,
  ChangeEvent,
  useState
} from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { useFormikContext, Field, Form, FormikContextType } from 'formik'
import Input from '../../atoms/Input'
import { FormContent, FormFieldProps } from '../../../@types/Form'
import { MetadataPublishFormDataset } from '../../../@types/MetaData'
import { initialValues as initialValuesDataset } from '../../../models/FormPublish'
import { ReactComponent as Download } from '../../../images/download.svg'
import { ReactComponent as Compute } from '../../../images/compute.svg'
import FormTitle from './FormTitle'
import FormActions from './FormActions'
import styles from './FormPublish.module.css'
import AdvancedSettings from '../../molecules/FormFields/AdvancedSettings'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'

const query = graphql`
  query {
    content: allFile(
      filter: { relativePath: { eq: "pages/publish/form-dataset.json" } }
    ) {
      edges {
        node {
          childPublishJson {
            title
            data {
              name
              placeholder
              label
              help
              type
              required
              sortOptions
              options
              disclaimer
              disclaimerValues
              advanced
              disclaimer
              disclaimerValues
            }
            warning
            walletDisclaimer
          }
        }
      }
    }
  }
`

export default function FormPublish(): ReactElement {
  const data = useStaticQuery(query)
  const content: FormContent = data.content.edges[0].node.childPublishJson

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
  }: FormikContextType<MetadataPublishFormDataset> = useFormikContext()

  const [computeTypeSelected, setComputeTypeSelected] = useState<boolean>(false)

  // reset form validation on every mount
  useEffect(() => {
    setErrors({})
    setTouched({})

    // setSubmitting(false)
  }, [setErrors, setTouched])

  const accessTypeOptions = [
    {
      name: 'Download',
      checked: false,
      title: 'Download',
      icon: <Download />
    },
    {
      name: 'Compute',
      checked: false,
      title: 'Compute',
      icon: <Compute />
    }
  ]

  const computeTypeOptions = ['1 day', '1 week', '1 month', '1 year']

  const { siteTitle } = useSiteMetadata()

  // Manually handle change events instead of using `handleChange` from Formik.
  // Workaround for default `validateOnChange` not kicking in
  function handleFieldChange(
    e: ChangeEvent<HTMLInputElement>,
    field: FormFieldProps
  ) {
    const value =
      field.type === 'checkbox' || field.type === 'terms'
        ? !JSON.parse(e.target.value)
        : e.target.value

    if (field.name === 'access' && value === 'Compute') {
      setComputeTypeSelected(true)
      if (values.timeout === 'Forever')
        setFieldValue('timeout', computeTypeOptions[0])
    } else {
      if (field.name === 'access' && value === 'Download') {
        setComputeTypeSelected(false)
      }
    }

    validateField(field.name)
    setFieldValue(field.name, value)
  }

  const resetFormAndClearStorage = (e: FormEvent<Element>) => {
    e.preventDefault()
    resetForm({
      values: initialValuesDataset as MetadataPublishFormDataset,
      status: 'empty'
    })
    setStatus('empty')
  }

  return (
    <Form
      className={styles.form}
      // do we need this?
      onChange={() => {
        status === 'empty' && setStatus(null)
        if (values.author !== siteTitle) values.author = siteTitle
      }}
    >
      <FormTitle title={content.title} />

      {content.data.map(
        (field: FormFieldProps) =>
          field.advanced !== true && (
            <Field
              key={field.name}
              {...field}
              options={
                field.type === 'boxSelection'
                  ? accessTypeOptions
                  : field.options
              }
              component={Input}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleFieldChange(e, field)
              }
              setStatus={setStatus}
            />
          )
      )}
      <AdvancedSettings
        content={content}
        handleFieldChange={handleFieldChange}
      />

      <FormActions
        status={status}
        isValid={isValid}
        resetFormAndClearStorage={resetFormAndClearStorage}
        walletDisclaimer={content.walletDisclaimer}
      />
    </Form>
  )
}

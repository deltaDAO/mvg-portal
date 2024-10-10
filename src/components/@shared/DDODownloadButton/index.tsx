import { ReactElement, useState } from 'react'
import Button from '../atoms/Button'
import Modal from '../atoms/Modal'
import Input from '../FormInput'
import { createServiceCredential } from './createJSON'
import { Field, Form, Formik } from 'formik'
import { getFieldContent } from '@utils/form'
import content from '../../../../content/asset/form.json'
import { initialValuesAsset, validationAsset } from './_validation'
import InputWithList from './inputWithList'
import styles from './index.module.css'

export default function DDODownloadButton({
  asset
}: {
  asset: object
}): ReactElement {
  const [openModal, setOpenModal] = useState(false)
  const [serviceCredentialList, setServiceCredentialList] = useState<
    { id: string }[]
  >([])
  const [dependencyCredentialsList, setDependencyCredentialsList] = useState<
    { id: string }[]
  >([])
  const handleSubmit = (values: object) => {
    const formData = {
      ...values,
      serviceCredentialList,
      dependencyCredentialsList
    }
    createServiceCredential(asset, formData)
    setOpenModal(false)
  }

  return (
    <>
      <Button
        className={styles.button}
        onClick={() => setOpenModal(true)}
        size="small"
      >
        Prepare Service Credential
      </Button>

      <Modal
        title="Prepare Service Credential"
        isOpen={openModal}
        onToggleModal={() => {
          setOpenModal(false)
          setServiceCredentialList([])
          setDependencyCredentialsList([])
        }}
      >
        <Formik
          initialValues={initialValuesAsset}
          validationSchema={validationAsset}
          onSubmit={(values: object) => {
            handleSubmit(values)
          }}
        >
          <Form>
            <Field
              {...getFieldContent('didweb', content.metadata.fields)}
              component={Input}
              name="didweb"
            />
            <Field
              {...getFieldContent(
                'credentialHostingPath',
                content.metadata.fields
              )}
              component={Input}
              name="credentialHostingPath"
            />
            <Field
              {...getFieldContent(
                'pathToParticipantCredential',
                content.metadata.fields
              )}
              component={Input}
              name="pathToParticipantCredential"
            />
            <InputWithList
              fieldname="knownDependencyCredentials"
              setList={setDependencyCredentialsList}
              list={dependencyCredentialsList}
            />
            <InputWithList
              fieldname="knownAggregatedServiceCredentials"
              setList={setServiceCredentialList}
              list={serviceCredentialList}
            />
            <Button type="submit">Download</Button>
          </Form>
        </Formik>
      </Modal>
    </>
  )
}

import { ReactElement, useState } from 'react'
import Button from '../atoms/Button'
import Modal from '../atoms/Modal'
import Input from '../FormInput'
import { createServiceCredential, DDOData } from './createJSON'
import { Field, Form, Formik } from 'formik'
import { getFieldContent } from '@utils/form'
import content from '../../../../content/DDOtoServiceCredential/serviceCredentialForm.json'
import { initialValuesAsset, validationAsset } from './_validation'
import InputWithList from './inputWithList'
import styles from './index.module.css'

interface values {
  didweb: string
  credentialHostingPath: string
  pathToParticipantCredential: string
  knownDependencyCredentials: string
  knownAggregatedServiceCredentials: string
}

export default function DDODownloadButton({
  asset
}: {
  asset: DDOData
}): ReactElement {
  const [openModal, setOpenModal] = useState(false)
  const [serviceCredentialList, setServiceCredentialList] = useState<
    { id: string }[]
  >([])
  const [dependencyCredentialsList, setDependencyCredentialsList] = useState<
    { id: string }[]
  >([])
  const clearLists = () => {
    setOpenModal(false)
    setServiceCredentialList([])
    setDependencyCredentialsList([])
  }
  const handleSubmit = (values: values) => {
    const formData = {
      ...values,
      serviceCredentialList,
      dependencyCredentialsList
    }
    createServiceCredential(asset, formData)
    clearLists()
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
        title="Prepare Gaia-X Service Credential"
        isOpen={openModal}
        onToggleModal={() => {
          clearLists()
        }}
      >
        <p>
          This manual export functionality will assist you to create Gaia-X
          Service Credentials for this service which can be added to this
          service for verification against the&nbsp;
          <Button
            style="text"
            href={'https://docs.gaia-x.eu/framework/?tab=clearing-house'}
          >
            Gaia-X Digital Clearing Houses (GXDCH)
          </Button>
          . Credentials should be signed and hosted by the service provider.
        </p>
        <Formik
          initialValues={initialValuesAsset}
          validationSchema={validationAsset}
          onSubmit={handleSubmit}
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

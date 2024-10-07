import { ReactElement, useState } from 'react'
import Button from '../atoms/Button'
import Modal from '../atoms/Modal'
import Input from '../FormInput'
import { createServiceCredential } from './createJSON'
import { ListItem } from '../atoms/Lists'

export default function DDODownloadButton({
  asset
}: {
  asset: any
}): ReactElement {
  const [openModal, setOpenModal] = useState(false)
  const [serviceCredential, setServiceCredential] = useState<string>()
  const [serviceCredentialList, setServiceCredentialList] = useState<
    { id: string }[]
  >([])
  const [dependencyCredentials, setDependencyCredentials] = useState<string>()
  const [dependencyCredentialsList, setDependencyCredentialsList] = useState<
    { id: string }[]
  >([])
  // add credential to the credentiallist
  const addCredential = (e, credential, setCredential, setlist, list) => {
    if (credential.trim()) {
      setlist([...list, { id: credential }])
      setCredential('')
    }
  }
  return (
    <>
      <Button onClick={() => setOpenModal(true)} size="small">
        Prepare Service Credential
      </Button>
      <Modal
        title="test"
        isOpen={openModal}
        onToggleModal={() => {
          setOpenModal(false)
          setServiceCredentialList([])
          setDependencyCredentialsList([])
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            formData.append(
              'serviceCredential',
              JSON.stringify(serviceCredentialList)
            )
            formData.append(
              'dependencyCredentials',
              JSON.stringify(dependencyCredentialsList)
            )
            createServiceCredential(asset, formData)
            setOpenModal(false)
          }}
        >
          <Input name="didweb" label="did:web" type="text" required />
          <Input
            name="credentialHostingPath"
            label="Credential Hosting path"
            type="text"
            required
          />
          <Input
            name="pathToParticipantCredential"
            label="path to the participant credential"
            type="text"
            required
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              width: '100%'
            }}
          >
            <Input
              label="known dependency credentials"
              type="text"
              value={dependencyCredentials}
              onChange={(e) => {
                setDependencyCredentials((e.target as HTMLInputElement).value)
              }}
            />
            <Button
              onClick={(e) =>
                addCredential(
                  e,
                  dependencyCredentials,
                  setDependencyCredentials,
                  setDependencyCredentialsList,
                  dependencyCredentialsList
                )
              }
              type="button"
              size="small"
            >
              +
            </Button>
          </div>
          {dependencyCredentialsList.length > 0 && (
            <div>
              <h3>known dependency credentials</h3>
              <ul style={{ paddingBottom: '30px' }}>
                {dependencyCredentialsList?.map((credential) => (
                  <ListItem key={credential.id}>{credential.id}</ListItem>
                ))}
              </ul>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Input
              label="known aggregated service credentials"
              type="text"
              value={serviceCredential}
              onChange={(e) => {
                setServiceCredential((e.target as HTMLInputElement).value)
              }}
            />
            <Button
              onClick={(e) =>
                addCredential(
                  e,
                  serviceCredential,
                  setServiceCredential,
                  setServiceCredentialList,
                  serviceCredentialList
                )
              }
              type="button"
              size="small"
            >
              +
            </Button>
          </div>
          {serviceCredentialList.length > 0 && (
            <div>
              <h3>known aggregated service credentials</h3>
              <ul style={{ paddingBottom: '30px' }}>
                {serviceCredentialList?.map((credential) => (
                  <ListItem key={credential.id}>{credential.id}</ListItem>
                ))}
              </ul>
            </div>
          )}

          <Button type="submit">Download</Button>
        </form>
      </Modal>
    </>
  )
}

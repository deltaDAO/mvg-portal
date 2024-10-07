import { ReactElement, useState } from 'react'
import Button from '../atoms/Button'
import Modal from '../atoms/Modal'
import Input from '../FormInput'
import { createServiceCredential } from './createJSON'
import { ListItem } from '../atoms/Lists'
import styles from './index.module.css'

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
  // delete credential from the list
  const deleteCredential = (index, setList, list) => {
    list.splice(index, 1)
    setList([...list])
  }
  return (
    <>
      <Button onClick={() => setOpenModal(true)} size="small">
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
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              width: '100%'
            }}
          >
            <div className={`${styles.credential_input}`}>
              <Input
                label="known dependency credentials"
                type="text"
                value={dependencyCredentials}
                onChange={(e) => {
                  setDependencyCredentials((e.target as HTMLInputElement).value)
                }}
              />
            </div>

            <Button
              className={`${styles.credential_margin_bottom}`}
              onClick={(e) =>
                addCredential(
                  e,
                  dependencyCredentials,
                  setDependencyCredentials,
                  setDependencyCredentialsList,
                  dependencyCredentialsList
                )
              }
            >
              add
            </Button>
          </div>
          {dependencyCredentialsList.length > 0 && (
            <div>
              <h5>known dependency credentials</h5>
              <ul className={`${styles.credential_margin_bottom}`}>
                {dependencyCredentialsList?.map((credential, index) => (
                  <ListItem key={credential.id}>
                    <span style={{ marginRight: '10px' }}>{credential.id}</span>

                    <Button
                      size="small"
                      style="text"
                      onClick={() =>
                        deleteCredential(
                          index,
                          setDependencyCredentialsList,
                          dependencyCredentialsList
                        )
                      }
                    >
                      delete
                    </Button>
                  </ListItem>
                ))}
              </ul>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap'
            }}
          >
            <div className={`${styles.credential_input}`}>
              <Input
                label="known aggregated service credentials"
                type="text"
                value={serviceCredential}
                onChange={(e) => {
                  setServiceCredential((e.target as HTMLInputElement).value)
                }}
              />
            </div>
            <Button
              className={`${styles.credential_margin_bottom}`}
              onClick={(e) =>
                addCredential(
                  e,
                  serviceCredential,
                  setServiceCredential,
                  setServiceCredentialList,
                  serviceCredentialList
                )
              }
            >
              add
            </Button>
          </div>
          {serviceCredentialList.length > 0 && (
            <div>
              <h5>known aggregated service credentials</h5>
              <ul style={{ paddingBottom: '30px' }}>
                {serviceCredentialList?.map((credential, index) => (
                  <ListItem key={credential.id}>
                    <span style={{ marginRight: '10px' }}>{credential.id}</span>

                    <Button
                      size="small"
                      style="text"
                      onClick={() =>
                        deleteCredential(
                          index,
                          setServiceCredentialList,
                          serviceCredentialList
                        )
                      }
                    >
                      delete
                    </Button>
                  </ListItem>
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

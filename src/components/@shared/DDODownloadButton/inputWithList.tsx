import { getFieldContent } from '@utils/form'
import content from '../../../../content/DDOtoServiceCredential/serviceCredentialForm.json'
import { Field, useFormikContext } from 'formik'
import Input from '../FormInput'
import Button from '../atoms/Button'
import { useState } from 'react'
import styles from './index.module.css'
import { ListItem } from '../atoms/Lists'

export default function InputWithList({
  fieldname,
  setList,
  list
}: {
  fieldname: string
  setList: (list: { id: string }[]) => void
  list: { id: string }[]
}) {
  const [serviceCredential, setServiceCredential] = useState<string>()
  const { setFieldValue, errors } = useFormikContext()
  // add credential to the credentiallist
  const addCredential = () => {
    if (serviceCredential.trim() && !errors[fieldname]) {
      setList([...list, { id: serviceCredential }])
      setServiceCredential('')
    }
  }
  // delete credential from the list
  const deleteCredential = (index: number) => {
    const filteredList = list.filter((_, i) => i !== index)
    setList([...filteredList])
  }
  return (
    <>
      <div className={styles.credential_input_div}>
        <div className={`${styles.credential_input}`}>
          <Field
            {...getFieldContent(fieldname, content.metadata.fields)}
            value={serviceCredential}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setServiceCredential((e.target as HTMLInputElement).value)
              setFieldValue(fieldname, (e.target as HTMLInputElement).value)
            }}
            component={Input}
            name={fieldname}
          />
        </div>

        <Button
          className={`${styles.credential_margin_bottom}`}
          onClick={addCredential}
          disabled={errors[fieldname] || !serviceCredential}
        >
          add
        </Button>
      </div>
      {list.length > 0 && (
        <>
          <h5 className={`${styles.credential_margin_bottom}`}>
            {fieldname === 'knownDependencyCredentials'
              ? 'Known dependency credentials'
              : 'Known aggregated service credentials'}
          </h5>
          <ul className={`${styles.credential_margin_bottom}`}>
            {list.map((item, index) => (
              <ListItem key={index}>
                <span style={{ marginRight: '10px' }}>{item.id}</span>
                <Button
                  type="button"
                  style="text"
                  onClick={() => deleteCredential(index)}
                >
                  delete
                </Button>
              </ListItem>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

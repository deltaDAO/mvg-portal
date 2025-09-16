import { useField, useFormikContext } from 'formik'
import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import PublishButton from '../../../PublishButton'
import DeleteButton from '../../../DeleteButton/DeleteButton'
import styles from './index.module.css'
import { isAddress } from 'ethers/lib/utils.js'
import { toast } from 'react-toastify'
import InputGroup from '../../InputGroup'
import InputElement from '..'
import { InputProps } from '../..'

interface CredentialProps extends InputProps {
  buttonStyle?: 'primary' | 'ghost' | 'text' | 'publish' | 'ocean'
}

export default function Credentials(props: CredentialProps) {
  const [field] = useField(props.name)
  const { setFieldValue } = useFormikContext()
  const [addressList, setAddressList] = useState<string[]>(field.value || [])
  const [value, setValue] = useState('')

  const hasWildcard = addressList.includes('*')

  useEffect(() => {
    const isExternalUpdate =
      JSON.stringify(field.value) !== JSON.stringify(addressList)

    if (isExternalUpdate) {
      setAddressList(field.value || [])
    }
  }, [field.value, addressList])

  useEffect(() => {
    setFieldValue(props.name, addressList)
  }, [addressList, setFieldValue, props.name])

  function handleDeleteAddress(value: string) {
    const newInput = addressList.filter((input) => input !== value)
    setAddressList(newInput)
    setFieldValue(props.name, newInput)
  }

  function handleAddValue(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()

    if (!(value === '*' || isAddress(value))) {
      toast.error('Wallet address is invalid')
      return
    }

    if (addressList.includes(value.toLowerCase())) {
      toast.error('Wallet address already added into the list')
      return
    }

    setAddressList((addressList) => [...addressList, value.toLowerCase()])
    setValue('')
  }

  function handleAddAll(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    setAddressList(['*'])
    setValue('')
  }

  return (
    <div>
      <InputGroup>
        <InputElement
          name="address"
          placeholder={props.placeholder}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
          disabled={hasWildcard}
        />
        <PublishButton
          icon="add"
          text="ADD"
          buttonStyle="primary"
          onClick={handleAddValue}
          disabled={hasWildcard}
          type="button"
        />
        {!hasWildcard && (
          <PublishButton
            icon="add"
            text="ADD ALL"
            buttonStyle="primary"
            onClick={handleAddAll}
            type="button"
          />
        )}
      </InputGroup>

      <div>
        {addressList.length > 0 &&
          addressList.map((value, i) => (
            <div className={styles.addressListContainer} key={value}>
              <InputGroup>
                <InputElement
                  name={`address[${i}]`}
                  value={value === '*' ? 'All Wallets (*)' : value}
                  disabled
                />
                <DeleteButton onClick={() => handleDeleteAddress(value)} />
              </InputGroup>
            </div>
          ))}
      </div>
    </div>
  )
}

import { useField } from 'formik'
import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import Button from '../../../atoms/Button'
import PublishButton from '../../../PublishButton'
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
  const [field, meta, helpers] = useField(props.name)
  const [addressList, setAddressList] = useState<string[]>(field.value || [])
  const [value, setValue] = useState('')
  const { buttonStyle = 'ocean' } = props

  const hasWildcard = addressList.includes('*')

  useEffect(() => {
    helpers.setValue(addressList)
  }, [addressList])

  function handleDeleteAddress(value: string) {
    const newInput = addressList.filter((input) => input !== value)
    setAddressList(newInput)
    helpers.setValue(newInput)
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
                <Button
                  style={buttonStyle}
                  size="small"
                  onClick={(e: React.SyntheticEvent) => {
                    e.preventDefault()
                    handleDeleteAddress(value)
                  }}
                >
                  Remove
                </Button>
              </InputGroup>
            </div>
          ))}
      </div>
    </div>
  )
}

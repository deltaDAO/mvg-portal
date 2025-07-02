import { useField } from 'formik'
import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import Button from '../../../atoms/Button'
import styles from './index.module.css'
import { isAddress } from 'ethers/lib/utils.js'
import { toast } from 'react-toastify'
import InputGroup from '../../InputGroup'
import InputElement from '..'
import { InputProps } from '../..'

export default function Credentials(props: InputProps) {
  const [field, meta, helpers] = useField(props.name)
  const [addressList, setAddressList] = useState<string[]>(field.value || [])
  const [value, setValue] = useState('')

  const hasWildcard = addressList.includes('*')

  useEffect(() => {
    const isExternalUpdate =
      JSON.stringify(field.value) !== JSON.stringify(addressList)

    if (isExternalUpdate) {
      setAddressList(field.value || [])
    }
  }, [field.value])

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
        <Button
          style="primary"
          size="small"
          onClick={handleAddValue}
          disabled={hasWildcard}
        >
          Add
        </Button>
        {!hasWildcard && (
          <Button style="primary" size="small" onClick={handleAddAll}>
            Add All
          </Button>
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
                  style="primary"
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

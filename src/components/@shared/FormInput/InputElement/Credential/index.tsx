import { useField } from 'formik'
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import Button from '../../../atoms/Button'
import styles from './index.module.css'
import { isAddress } from 'web3-utils'
import { toast } from 'react-toastify'
import InputGroup from '../../InputGroup'
import InputElement from '..'
import { InputProps } from '../..'

export default function Credentials(props: InputProps) {
  const [field, meta, helpers] = useField(props.name)
  const [arrayInput, setArrayInput] = useState<string[]>(field.value || [])
  const [value, setValue] = useState('')

  useEffect(() => {
    helpers.setValue(arrayInput)
  }, [arrayInput])

  function handleDeleteChip(value: string) {
    const newInput = arrayInput.filter((input) => input !== value)
    setArrayInput(newInput)
    helpers.setValue(newInput)
  }

  function handleAddValue(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (!isAddress(value)) {
      toast.error('Wallet address is invalid')
      return
    }
    if (arrayInput.includes(value.toLowerCase())) {
      toast.error('Wallet address already added into list')
      return
    }
    setArrayInput((arrayInput) => [...arrayInput, value.toLowerCase()])
    setValue('')
  }

  return (
    <div className={styles.credential}>
      <InputGroup>
        <InputElement
          name="address"
          placeholder={props.placeholder}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
        />
        <Button
          style="primary"
          size="small"
          onClick={(e: FormEvent<HTMLButtonElement>) => handleAddValue(e)}
        >
          Add
        </Button>
      </InputGroup>
      <div className={styles.scroll}>
        {arrayInput &&
          arrayInput.map((value, i) => {
            return (
              <div className={styles.addedAddressesContainer} key={value}>
                <InputGroup>
                  <InputElement name={`address[${i}]`} value={value} disabled />
                  <Button
                    style="primary"
                    size="small"
                    onClick={(e: React.SyntheticEvent) => {
                      e.preventDefault()
                      handleDeleteChip(value)
                    }}
                    disabled={false}
                  >
                    remove
                  </Button>
                </InputGroup>
              </div>
            )
          })}
      </div>
    </div>
  )
}

import { useFormikContext } from 'formik'
import { ReactElement, useState } from 'react'
import Input from '@components/@shared/FormInput'
import SectionContainer from '../../../@shared/SectionContainer/SectionContainer'
import Button from '@components/@shared/atoms/Button'
import InputGroup from '@components/@shared/FormInput/InputGroup'
import InputElement from '@components/@shared/FormInput/InputElement'
import { FormPublishData } from '../../_types'
import { isAddress } from 'ethers/lib/utils.js'
import { toast } from 'react-toastify'
import styles from './index.module.css'
import DeleteIcon from '@images/delete.svg'
import AddIcon from '@images/add_param.svg'
import Label from '../../../@shared/FormInput/Label'
import ContainerForm from '../../../@shared/atoms/ContainerForm'
import Tooltip from '@shared/atoms/Tooltip'
import Markdown from '@shared/Markdown'

export default function AccessRulesSection(): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormPublishData>()
  const [allowInputValue, setAllowInputValue] = useState('')
  const [denyInputValue, setDenyInputValue] = useState('')
  const [allowDropdownValue, setAllowDropdownValue] = useState(
    'Allow specific addresses'
  )
  const [denyDropdownValue, setDenyDropdownValue] = useState(
    'Please select an option'
  )

  const allowList = values.services?.[0]?.credentials?.allow || []
  const denyList = values.services?.[0]?.credentials?.deny || []

  const handleAddAllowAddress = (e: React.FormEvent) => {
    e.preventDefault()

    if (allowDropdownValue === 'Please select an option') {
      toast.error('Please select an option for Allow ETH Address')
      return
    }

    if (!allowInputValue.trim()) {
      toast.error('Please enter an address')
      return
    }

    if (!(allowInputValue === '*' || isAddress(allowInputValue))) {
      toast.error('Wallet address is invalid')
      return
    }

    if (allowList.includes(allowInputValue.toLowerCase())) {
      toast.error('Wallet address already added to the allow list')
      return
    }

    const newAllowList = [...allowList, allowInputValue.toLowerCase()]
    setFieldValue('services[0].credentials.allow', newAllowList)
    setAllowInputValue('')
  }

  const handleDeleteAllowAddress = (addressToDelete: string) => {
    const newAllowList = allowList.filter(
      (address) => address !== addressToDelete
    )
    setFieldValue('services[0].credentials.allow', newAllowList)
  }

  const handleAddDenyAddress = (e: React.FormEvent) => {
    e.preventDefault()

    if (denyDropdownValue === 'Please select an option') {
      toast.error('Please select an option for Deny ETH Address')
      return
    }

    if (!denyInputValue.trim()) {
      toast.error('Please enter an address')
      return
    }

    if (!(denyInputValue === '*' || isAddress(denyInputValue))) {
      toast.error('Wallet address is invalid')
      return
    }

    if (denyList.includes(denyInputValue.toLowerCase())) {
      toast.error('Wallet address already added to the deny list')
      return
    }

    const newDenyList = [...denyList, denyInputValue.toLowerCase()]
    setFieldValue('services[0].credentials.deny', newDenyList)
    setDenyInputValue('')
  }

  const handleDeleteDenyAddress = (addressToDelete: string) => {
    const newDenyList = denyList.filter(
      (address) => address !== addressToDelete
    )
    setFieldValue('services[0].credentials.deny', newDenyList)
  }

  return (
    <SectionContainer title="Access Rules" gap="16px">
      <ContainerForm>
        <div>
          <Label htmlFor="allowDropdown">
            Allow ETH Address
            <Tooltip
              content={
                <Markdown text="Web3 wallet addresses are used to control access to registered assets. Indicate specific wallet addresses to allow access to the asset, or allow access to all wallets by clicking 'add all'." />
              }
            />
          </Label>

          <Input
            name="allowDropdown"
            type="select"
            selectStyle="publish"
            size="default"
            options={['Allow specific addresses', 'Please select an option']}
            value={allowDropdownValue}
            onChange={(e) =>
              setAllowDropdownValue((e.target as HTMLSelectElement).value)
            }
          />
        </div>

        <InputGroup>
          <InputElement
            name="allowAddress"
            placeholder="e.g. 0xea9889df0f0f9f7f4f6fsdffa3a5a6a7aa"
            value={allowInputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAllowInputValue(e.target.value)
            }
          />
          <Button
            type="button"
            onClick={() => {
              setAllowInputValue('')
              setFieldValue('services[0].credentials.allow', [])
            }}
            disabled={allowList.length === 0 && !allowInputValue.trim()}
            style="outlined"
          >
            <DeleteIcon /> Delete
          </Button>
        </InputGroup>

        <Button style="gradient" onClick={handleAddAllowAddress} type="button">
          <AddIcon /> Add new address
        </Button>

        {allowList.length > 0 && (
          <div className={styles.addressList}>
            {allowList.map((address, index) => (
              <InputGroup key={`allow-${index}`}>
                <InputElement
                  name={`allowAddress-${index}`}
                  value={address === '*' ? 'All Wallets (*)' : address}
                  disabled
                />
                <Button
                  type="button"
                  onClick={() => handleDeleteAllowAddress(address)}
                  style="outlined"
                >
                  <DeleteIcon /> Delete
                </Button>
              </InputGroup>
            ))}
          </div>
        )}
      </ContainerForm>

      <ContainerForm gap="16px">
        <div>
          <Label htmlFor="denyDropdown">
            Deny ETH Address
            <Tooltip
              content={
                <Markdown text="Web3 wallet addresses are used to control access to registered assets. Indicate specific wallet addresses to deny access to the asset, or deny access to all wallets by clicking 'add all'." />
              }
            />
          </Label>

          <Input
            name="denyDropdown"
            type="select"
            selectStyle="publish"
            options={['Please select an option', 'Deny specific addresses']}
            hideLabel
            value={denyDropdownValue}
            onChange={(e) =>
              setDenyDropdownValue((e.target as HTMLSelectElement).value)
            }
          />
        </div>

        {denyDropdownValue !== 'Please select an option' && (
          <>
            <InputGroup>
              <InputElement
                name="denyAddress"
                placeholder="e.g. 0xea9889df0f0f9f7f4f6fsdffa3a5a6a7aa"
                value={denyInputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDenyInputValue(e.target.value)
                }
              />
              <Button
                type="button"
                onClick={() => {
                  setDenyInputValue('')
                  setFieldValue('services[0].credentials.deny', [])
                }}
                disabled={denyList.length === 0 && !denyInputValue.trim()}
                style="outlined"
              >
                <DeleteIcon /> Delete
              </Button>
            </InputGroup>

            <Button
              style="gradient"
              onClick={handleAddDenyAddress}
              type="button"
            >
              <AddIcon /> Add new address
            </Button>

            {denyList.length > 0 && (
              <div className={styles.addressList}>
                {denyList.map((address, index) => (
                  <InputGroup key={`deny-${index}`}>
                    <InputElement
                      name={`denyAddress-${index}`}
                      value={address === '*' ? 'All Wallets (*)' : address}
                      disabled
                    />
                    <Button
                      type="button"
                      onClick={() => handleDeleteDenyAddress(address)}
                      style="outlined"
                    >
                      <DeleteIcon /> Delete
                    </Button>
                  </InputGroup>
                ))}
              </div>
            )}
          </>
        )}
      </ContainerForm>
    </SectionContainer>
  )
}

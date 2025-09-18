import { useFormikContext } from 'formik'
import { ReactElement, useState, useEffect } from 'react'
import Input from '@components/@shared/FormInput'
import SectionContainer from '../../../@shared/SectionContainer/SectionContainer'
import Button from '@components/@shared/atoms/Button'
import InputGroup from '@components/@shared/FormInput/InputGroup'
import InputElement from '@components/@shared/FormInput/InputElement'
import { FormPublishData } from '../../_types'
import { isAddress } from 'ethers/lib/utils.js'
import { toast } from 'react-toastify'
import styles from './index.module.css'
import DeleteButton from '@components/@shared/DeleteButton/DeleteButton'
import AddIcon from '@images/add_param.svg'
import Label from '../../../@shared/FormInput/Label'
import ContainerForm from '../../../@shared/atoms/ContainerForm'
import Tooltip from '@shared/atoms/Tooltip'
import Markdown from '@shared/Markdown'

interface AccessRulesSectionProps {
  fieldPrefix?: string
}

export default function AccessRulesSection({
  fieldPrefix = 'credentials'
}: AccessRulesSectionProps = {}): ReactElement {
  const { values, setFieldValue } = useFormikContext<any>()
  const [allowInputValue, setAllowInputValue] = useState(
    values.credentials?.allowInputValue || ''
  )
  const [denyInputValue, setDenyInputValue] = useState(
    values.credentials?.denyInputValue || ''
  )
  const [allowDropdownValue, setAllowDropdownValue] = useState(
    'Please select an option'
  )
  const [denyDropdownValue, setDenyDropdownValue] = useState(
    'Please select an option'
  )

  const getFieldValue = (field: string) => {
    if (fieldPrefix === 'credentials') {
      return values.credentials?.[field] || []
    } else if (fieldPrefix === 'services[0].credentials') {
      return values.services?.[0]?.credentials?.[field] || []
    }
    return []
  }

  const allowList = getFieldValue('allow')
  const denyList = getFieldValue('deny')

  const hasAllowAll = allowList.includes('*')
  const hasDenyAll = denyList.includes('*')

  useEffect(() => {
    if (allowDropdownValue === 'Allow all addresses') {
      if (!allowList.includes('*')) {
        setFieldValue(`${fieldPrefix}.allow`, ['*'])
      }
      setAllowInputValue('')
    }
  }, [allowDropdownValue, allowList, setFieldValue])

  useEffect(() => {
    if (denyDropdownValue === 'Deny all addresses') {
      if (!denyList.includes('*')) {
        setFieldValue(`${fieldPrefix}.deny`, ['*'])
      }
      setDenyInputValue('')
      if (fieldPrefix === 'credentials') {
        setFieldValue('credentials.denyInputValue', '')
      }
    }
  }, [denyDropdownValue, denyList, setFieldValue])

  useEffect(() => {
    if (hasAllowAll && allowDropdownValue !== 'Allow all addresses') {
      setAllowDropdownValue('Allow all addresses')
    } else if (
      !hasAllowAll &&
      allowList.length > 0 &&
      allowDropdownValue !== 'Allow specific addresses'
    ) {
      setAllowDropdownValue('Allow specific addresses')
    }
  }, [hasAllowAll, allowList.length, allowDropdownValue])

  useEffect(() => {
    if (hasDenyAll && denyDropdownValue !== 'Deny all addresses') {
      setDenyDropdownValue('Deny all addresses')
    } else if (
      !hasDenyAll &&
      denyList.length > 0 &&
      denyDropdownValue !== 'Deny specific addresses'
    ) {
      setDenyDropdownValue('Deny specific addresses')
    }
  }, [hasDenyAll, denyList.length, denyDropdownValue])

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
    setFieldValue(`${fieldPrefix}.allow`, newAllowList)
    setAllowInputValue('')
    if (fieldPrefix === 'credentials') {
      setFieldValue('credentials.allowInputValue', '')
    }
  }

  const handleDeleteAllowAddress = (addressToDelete: string) => {
    const newAllowList = allowList.filter(
      (address) => address !== addressToDelete
    )
    setFieldValue(`${fieldPrefix}.allow`, newAllowList)

    if (addressToDelete === '*') {
      setAllowDropdownValue('Please select an option')
    }
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
    setFieldValue(`${fieldPrefix}.deny`, newDenyList)
    setDenyInputValue('')
    if (fieldPrefix === 'credentials') {
      setFieldValue('credentials.denyInputValue', '')
    }
  }

  const handleDeleteDenyAddress = (addressToDelete: string) => {
    const newDenyList = denyList.filter(
      (address) => address !== addressToDelete
    )
    setFieldValue(`${fieldPrefix}.deny`, newDenyList)

    if (addressToDelete === '*') {
      setDenyDropdownValue('Please select an option')
    }
  }

  const handleAllowDropdownChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target
    setAllowDropdownValue(value)
  }

  const handleDenyDropdownChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target
    setDenyDropdownValue(value)
  }

  return (
    <SectionContainer title="Access Rules" gap="16px">
      <ContainerForm>
        <div>
          <Label htmlFor="allowDropdown">
            Allow ETH Address
            <Tooltip
              content={
                <Markdown text="Web3 wallet addresses are used to control access to registered assets. Indicate specific wallet addresses to allow access to the asset, or allow access to all wallets by selecting 'Allow all addresses'." />
              }
            />
          </Label>

          <Input
            name="allowDropdown"
            type="select"
            selectStyle="publish"
            size="default"
            options={
              hasAllowAll
                ? ['Allow all addresses']
                : [
                    'Please select an option',
                    'Allow specific addresses',
                    'Allow all addresses'
                  ]
            }
            value={allowDropdownValue}
            onChange={handleAllowDropdownChange}
            disabled={hasAllowAll}
          />
          {hasAllowAll && (
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                fontStyle: 'italic',
                marginTop: '8px'
              }}
            >
              All wallet addresses are allowed access.
            </div>
          )}
        </div>

        {allowDropdownValue === 'Allow specific addresses' && !hasAllowAll && (
          <>
            <InputElement
              name="allowAddress"
              placeholder="e.g. 0xea9889df0f0f9f7f4f6fsdffa3a5a6a7aa"
              value={allowInputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setAllowInputValue(e.target.value)
                if (fieldPrefix === 'credentials') {
                  setFieldValue('credentials.allowInputValue', e.target.value)
                }
              }}
            />
            <Button
              style="gradient"
              onClick={handleAddAllowAddress}
              type="button"
              disabled={!allowInputValue.trim()}
            >
              <AddIcon /> Add new address
            </Button>
          </>
        )}

        {allowList.length > 0 && (
          <div className={styles.addressList}>
            {allowList.map((address, index) => (
              <InputGroup key={`allow-${index}`}>
                <InputElement
                  name={`allowAddress-${index}`}
                  value={address === '*' ? 'All Wallets (*)' : address}
                  disabled
                />
                <DeleteButton
                  onClick={() => handleDeleteAllowAddress(address)}
                />
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
                <Markdown text="Web3 wallet addresses are used to control access to registered assets. Indicate specific wallet addresses to deny access to the asset, or deny access to all wallets by selecting 'Deny all addresses'." />
              }
            />
          </Label>

          <Input
            name="denyDropdown"
            type="select"
            selectStyle="publish"
            options={
              hasDenyAll
                ? ['Deny all addresses']
                : [
                    'Please select an option',
                    'Deny specific addresses',
                    'Deny all addresses'
                  ]
            }
            hideLabel
            value={denyDropdownValue}
            onChange={handleDenyDropdownChange}
            disabled={hasDenyAll}
          />
          {hasDenyAll && (
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                fontStyle: 'italic',
                marginTop: '8px'
              }}
            >
              All wallet addresses are denied access.
            </div>
          )}
        </div>

        {denyDropdownValue === 'Deny specific addresses' && !hasDenyAll && (
          <>
            <InputElement
              name="denyAddress"
              placeholder="e.g. 0xea9889df0f0f9f7f4f6fsdffa3a5a6a7aa"
              value={denyInputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDenyInputValue(e.target.value)
                if (fieldPrefix === 'credentials') {
                  setFieldValue('credentials.denyInputValue', e.target.value)
                }
              }}
            />
            <Button
              style="gradient"
              onClick={handleAddDenyAddress}
              type="button"
              disabled={!denyInputValue.trim()}
            >
              <AddIcon /> Add new address
            </Button>
          </>
        )}

        {denyList.length > 0 && (
          <div className={styles.addressList}>
            {denyList.map((address, index) => (
              <InputGroup key={`deny-${index}`}>
                <InputElement
                  name={`denyAddress-${index}`}
                  value={address === '*' ? 'All Wallets (*)' : address}
                  disabled
                />
                <DeleteButton
                  onClick={() => handleDeleteDenyAddress(address)}
                />
              </InputGroup>
            ))}
          </div>
        )}
      </ContainerForm>
    </SectionContainer>
  )
}

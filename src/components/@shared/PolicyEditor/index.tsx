import { getFieldContent } from '@utils/form'
import { Field } from 'formik'
import cs from 'classnames'
import { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import Input from '../FormInput'
import Button from '../atoms/Button'
import {
  CustomPolicy,
  CustomUrlPolicy,
  ParameterizedPolicy,
  PolicyEditorProps,
  PolicyType,
  RequestCredentialForm,
  StaticPolicy,
  VpPolicyType
} from './types'
import fields from './editor.json'
import Tooltip from '@shared/atoms/Tooltip'
import Markdown from '@shared/Markdown'
import CredentialCard from './CredentialCard/Card'
import StaticPolicyBlock from './PolicyBlocks/Static'
import AllowedIssuerPolicyBlock from './PolicyBlocks/AllowedIssuer'
import CustomUrlPolicyBlock from './PolicyBlocks/CustomUrl'
import CustomFieldPolicyBlock from './PolicyBlocks/CustomField'
import AdvancedOptions from './AdvancedOptions/Advanced'
import FieldRow from './FieldRow/Row'
import fieldRowStyles from './FieldRow/Row.module.css'
import DeleteButton from '../DeleteButton/DeleteButton'
import CustomPolicyBlock from './PolicyBlocks/Custom'

import AddIcon from '@images/add_param.svg'

interface PolicyViewProps {
  policy: PolicyType
  name: string
  index: number
  innerIndex: number
  onDeletePolicy: () => void
  onValueChange: () => void
  credentialType?: string
}

interface VpPolicyViewProps {
  policy: VpPolicyType
  name: string
  index: number
  onDeletePolicy: () => void
}

function PolicyView(props: PolicyViewProps): ReactElement {
  const { policy, onDeletePolicy, ...rest }: PolicyViewProps = props
  switch (policy?.type) {
    case 'staticPolicy':
      return (
        <StaticPolicyBlock
          {...rest}
          policy={policy}
          onDelete={onDeletePolicy}
        />
      )
    case 'parameterizedPolicy':
      return (
        <AllowedIssuerPolicyBlock
          {...rest}
          policy={policy}
          onDelete={onDeletePolicy}
          onValueChange={rest.onValueChange}
        />
      )
    case 'customUrlPolicy':
      return (
        <CustomUrlPolicyBlock
          {...rest}
          policy={policy}
          onDelete={onDeletePolicy}
          onValueChange={rest.onValueChange}
        />
      )
    case 'customPolicy':
      return (
        <CustomPolicyBlock
          {...rest}
          policy={policy}
          onDelete={onDeletePolicy}
          onValueChange={rest.onValueChange}
        />
      )
    default:
      return <></>
  }
}

function StaticVpPolicyView(props: VpPolicyViewProps): ReactElement {
  const { index, onDeletePolicy, name }: VpPolicyViewProps = props
  return (
    <>
      <label>{{ ...getFieldContent('staticVpPolicy', fields) }.label}</label>
      <div className={`${styles.editorPanel} ${styles.marginBottom1em}`}>
        <div
          className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
        >
          <div className={`${styles.flexGrow}`}>
            <Field
              {...getFieldContent('name', fields)}
              component={Input}
              name={`${name}.vpPolicies[${index}].name`}
            />
          </div>
          <Button
            type="button"
            style="ghost"
            onClick={onDeletePolicy}
            className={`${styles.deleteButton} ${styles.marginBottomButton}`}
          >
            Delete
          </Button>
        </div>
      </div>
    </>
  )
}

function ArgumentVpPolicyView(props: VpPolicyViewProps): ReactElement {
  const { index, onDeletePolicy, name }: VpPolicyViewProps = props
  return (
    <>
      <label>{{ ...getFieldContent('argumentVpPolicy', fields) }.label}</label>
      <div className={`${styles.editorPanel} ${styles.marginBottom1em}`}>
        <div
          className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
        >
          <div
            className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100} ${styles.flexGrow}`}
          >
            <div className={styles.flexGrow}>
              <Field
                {...getFieldContent('policy', fields)}
                component={Input}
                name={`${name}.vpPolicies[${index}].policy`}
              />
            </div>
            <div className={styles.flexGrow}>
              <Field
                {...getFieldContent('args', fields)}
                component={Input}
                name={`${name}.vpPolicies[${index}].args`}
              />
            </div>
            <Button
              type="button"
              style="ghost"
              onClick={onDeletePolicy}
              className={`${styles.deleteButton} ${styles.marginBottomButton}`}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function VpPolicyView(props: VpPolicyViewProps): ReactElement {
  const { policy }: VpPolicyViewProps = props
  switch (policy?.type) {
    case 'staticVpPolicy':
      return StaticVpPolicyView(props)
    case 'argumentVpPolicy':
      return ArgumentVpPolicyView(props)
    default:
      return <></>
  }
}

export function PolicyEditor(props): ReactElement {
  const {
    credentials,
    setCredentials,
    name,
    label,
    help,
    defaultPolicies = [],
    enabledView = false,
    isAsset = false,
    buttonStyle = 'primary',
    hideDefaultPolicies = false
  }: PolicyEditorProps = props

  const [enabled, setEnabled] = useState(enabledView)
  const [editAdvancedFeatures, setEditAdvancedFeatures] = useState(false)
  const [holderBinding, setHolderBinding] = useState(true)
  const [requireAllTypes, setRequireAllTypes] = useState(true)
  const [maximumCredentials, setMaximumCredentials] = useState('1')
  const [limitMaxCredentials, setLimitMaxCredentials] = useState(false)
  const [minimumCredentials, setMinimumCredentials] = useState('1')
  const [limitMinCredentials, setLimitMinCredentials] = useState(false)

  const [defaultPolicyStates, setDefaultPolicyStates] = useState({
    'not-before': !hideDefaultPolicies,
    expired: false,
    'revoked-status-list': !hideDefaultPolicies,
    signature: !hideDefaultPolicies,
    'signature_sd-jwt-vc': false
  })

  const allPolicies = [
    'signature',
    'not-before',
    'revoked-status-list',
    'expired',
    'signature_sd-jwt-vc'
  ]

  function getPolicyDescription(policy: string): string {
    const descriptions = {
      signature:
        'Verifies the cryptographic signature of the credential to ensure authenticity.',
      'not-before':
        "Checks that the current time is after the credential's valid-from date.",
      expired:
        'Verifies that the credential has not expired based on its expiration date.',
      'revoked-status-list':
        'Checks against revocation lists to ensure the credential has not been revoked.',
      'signature_sd-jwt-vc':
        'Verifies selective disclosure JWT verifiable credential signatures.'
    }
    return descriptions[policy] || 'Policy verification rule.'
  }

  const filteredDefaultPolicies = defaultPolicies.filter(
    (policy) => policy.length > 0
  )

  useEffect(() => {
    if (!enabled || !editAdvancedFeatures) return

    const updatedVpPolicies = [...(credentials.vpPolicies || [])]
    let changed = false

    if (
      holderBinding &&
      !updatedVpPolicies.some(
        (p) => p?.type === 'staticVpPolicy' && p?.name === 'holder-binding'
      )
    ) {
      updatedVpPolicies.push({ type: 'staticVpPolicy', name: 'holder-binding' })
      changed = true
    }

    if (
      requireAllTypes &&
      !updatedVpPolicies.some(
        (p) =>
          p?.type === 'staticVpPolicy' && p?.name === 'presentation-definition'
      )
    ) {
      updatedVpPolicies.push({
        type: 'staticVpPolicy',
        name: 'presentation-definition'
      })
      changed = true
    }

    if (changed) {
      setCredentials({ ...credentials, vpPolicies: updatedVpPolicies })
    }
  }, [enabled, editAdvancedFeatures])

  function handlePolicyEditorToggle(value: boolean) {
    if (!value) {
      const updatedCredentials = {
        ...credentials,
        requestCredentials: [],
        vcPolicies: credentials.vcPolicies?.slice(0, 3) || [],
        vpPolicies: []
      }
      setCredentials(updatedCredentials)
    }
    setEnabled(value)
  }

  function handleNewRequestCredential() {
    const newRequestCredential: RequestCredentialForm = {
      format: '',
      type: '',
      policies: [],
      newPolicyType: 'staticPolicy'
    }
    credentials?.requestCredentials?.push(newRequestCredential)
    setCredentials(credentials)
  }

  function handleDeleteRequestCredential(index: number) {
    credentials.requestCredentials.splice(index, 1)
    setCredentials(credentials)
  }

  function handleNewStaticCustomPolicy(credential: RequestCredentialForm) {
    const policy: StaticPolicy = {
      type: 'staticPolicy',
      name: ''
    }
    credential?.policies?.push(policy)
    setCredentials(credentials)
  }

  function handleNewParameterizedCustomPolicy(
    credential: RequestCredentialForm
  ) {
    const policy: ParameterizedPolicy = {
      type: 'parameterizedPolicy',
      args: [],
      policy: 'allowed-issuer'
    }
    credential?.policies?.push(policy)
    setCredentials(credentials)
  }

  function handleNewCustomUrlPolicy(credential: RequestCredentialForm) {
    const policy: CustomUrlPolicy = {
      type: 'customUrlPolicy',
      arguments: [],
      policyUrl: '',
      name: ''
    }
    credential?.policies?.push(policy)
    setCredentials(credentials)
  }

  function handleNewCustomPolicy(credential: RequestCredentialForm) {
    const policy: CustomPolicy = {
      type: 'customPolicy',
      arguments: [],
      name: '',
      rules: []
    }
    credential?.policies?.push(policy)
    setCredentials(credentials)
  }

  function handleDeleteCustomPolicy(
    credential: RequestCredentialForm,
    index: number
  ) {
    credential?.policies?.splice(index, 1)
    setCredentials(credentials)
  }

  function handleNewStaticPolicy() {
    credentials?.vcPolicies?.push('')
    setCredentials(credentials)
  }

  function handleDeleteStaticPolicy(index: number) {
    credentials.vcPolicies.splice(index, 1)
    setCredentials(credentials)
  }

  const staticPolicyLabel = (index: number) => {
    const field = { ...getFieldContent('staticPolicy', fields) }
    if (index < filteredDefaultPolicies?.length) {
      field.label = `Default ${field.label}`
    }
    return field
  }

  function handleDeleteVpPolicy(index: number) {
    credentials.vpPolicies.splice(index, 1)
    setCredentials(credentials)
  }

  function handleHolderBindingToggle() {
    const newValue = !holderBinding

    setHolderBinding(newValue)

    const updatedVpPolicies = [...credentials.vpPolicies]

    if (newValue) {
      const exists = updatedVpPolicies.some(
        (p) => p?.type === 'staticVpPolicy' && p?.name === 'holder-binding'
      )
      if (!exists) {
        updatedVpPolicies.push({
          type: 'staticVpPolicy',
          name: 'holder-binding'
        })
      }
    } else {
      const filteredVpPolicies = updatedVpPolicies.filter(
        (p) => !(p?.type === 'staticVpPolicy' && p?.name === 'holder-binding')
      )
      setCredentials({ ...credentials, vpPolicies: filteredVpPolicies })
      return
    }

    setCredentials({ ...credentials, vpPolicies: updatedVpPolicies })
  }

  function handlePresentationDefinitionToggle() {
    const newValue = !requireAllTypes
    setRequireAllTypes(newValue)

    const updatedVpPolicies = [...credentials.vpPolicies]

    if (newValue) {
      const exists = updatedVpPolicies.some(
        (p) =>
          p?.type === 'staticVpPolicy' && p?.name === 'presentation-definition'
      )
      if (!exists) {
        updatedVpPolicies.push({
          type: 'staticVpPolicy',
          name: 'presentation-definition'
        })
      }
    } else {
      const filteredVpPolicies = updatedVpPolicies.filter(
        (p) =>
          !(
            p?.type === 'staticVpPolicy' &&
            p?.name === 'presentation-definition'
          )
      )
      setCredentials({ ...credentials, vpPolicies: filteredVpPolicies })
      return
    }

    setCredentials({ ...credentials, vpPolicies: updatedVpPolicies })
  }

  useEffect(() => {
    if (!enabled || !editAdvancedFeatures) return

    const updatedVpPolicies = [...(credentials.vpPolicies || [])]

    function upsertPolicy(policyName: string, argValue: string | number) {
      const index = updatedVpPolicies.findIndex(
        (p) => typeof p === 'object' && 'policy' in p && p.policy === policyName
      )

      if (index !== -1) {
        updatedVpPolicies[index] = {
          type: 'argumentVpPolicy',
          policy: policyName,
          args: argValue.toString()
        }
      } else {
        updatedVpPolicies.push({
          type: 'argumentVpPolicy',
          policy: policyName,
          args: argValue.toString()
        })
      }
    }

    function removePolicy(policyName: string) {
      const filtered = updatedVpPolicies.filter(
        (p) =>
          !(typeof p === 'object' && 'policy' in p && p.policy === policyName)
      )
      return filtered
    }

    let changed = false

    // Handle minimum
    if (limitMinCredentials) {
      upsertPolicy('minimum-credentials', minimumCredentials)
      changed = true
    } else {
      const filtered = removePolicy('minimum-credentials')
      if (filtered.length !== updatedVpPolicies.length) {
        updatedVpPolicies.length = 0
        updatedVpPolicies.push(...filtered)
        changed = true
      }
    }

    // Handle maximum
    if (limitMaxCredentials) {
      upsertPolicy('maximum-credentials', maximumCredentials)
      changed = true
    } else {
      const filtered = removePolicy('maximum-credentials')
      if (filtered.length !== updatedVpPolicies.length) {
        updatedVpPolicies.length = 0
        updatedVpPolicies.push(...filtered)
        changed = true
      }
    }

    if (changed) {
      setCredentials({ ...credentials, vpPolicies: updatedVpPolicies })
    }
  }, [
    enabled,
    editAdvancedFeatures,
    limitMinCredentials,
    limitMaxCredentials,
    minimumCredentials,
    maximumCredentials
  ])

  const ssiContent = enabled && (
    <>
      {/* Policies applied to all credentials section */}
      {enabled && !hideDefaultPolicies && (
        <div className={styles.defaultPoliciesSection}>
          <h3 className={styles.defaultPoliciesTitle}>
            Policies applied to all credentials
          </h3>
          <div className={styles.defaultPoliciesList}>
            {allPolicies.map((policy, index) => (
              <div key={policy} className={styles.defaultPolicyItem}>
                <label className={styles.policyLabel}>
                  <input
                    type="checkbox"
                    checked={defaultPolicyStates[policy]}
                    onChange={(e) =>
                      setDefaultPolicyStates((prev) => ({
                        ...prev,
                        [policy]: e.target.checked
                      }))
                    }
                    className={styles.checkbox}
                  />
                  <span className={styles.policyName}>{policy}</span>
                  <Tooltip
                    content={<Markdown text={getPolicyDescription(policy)} />}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${styles.container}`}>
        {credentials?.requestCredentials?.map((credential, index) => (
          <div className={`${styles.panelColumn}`} key={index}>
            <div className={styles.credentialCards}>
              <CredentialCard
                index={index}
                name={name}
                credential={credential}
                onDelete={() => handleDeleteRequestCredential(index)}
              >
                <div className={styles.policiesRow}>
                  <span className={styles.label}>Policies:</span>
                  <div className={styles.addPolicyContainer}>
                    <div className={styles.dropdownButtonWrapper}>
                      <select
                        onChange={(e) => {
                          const policyType = e.target.value
                          if (policyType === 'staticPolicy')
                            handleNewStaticCustomPolicy(credential)
                          else if (policyType === 'parameterizedPolicy')
                            handleNewParameterizedCustomPolicy(credential)
                          else if (policyType === 'customUrlPolicy')
                            handleNewCustomUrlPolicy(credential)
                          else if (policyType === 'customPolicy')
                            handleNewCustomPolicy(credential)
                          // Reset select after action
                          e.target.value = ''
                        }}
                        className={styles.addPolicyDropdown}
                        defaultValue=""
                      >
                        <option value="" disabled hidden>
                          Add policy
                        </option>
                        <option value="staticPolicy">Static Policy</option>
                        <option value="parameterizedPolicy">
                          Allowed Issuer
                        </option>
                        <option value="customUrlPolicy">
                          Custom URL Policy
                        </option>
                        <option value="customPolicy">Custom Policy</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  {credential?.policies?.length === 0 ? (
                    <div className={styles.noPolicies}>
                      No static policies defined.
                    </div>
                  ) : (
                    credential?.policies?.map((policy, innerIndex) => (
                      <PolicyView
                        key={innerIndex}
                        index={index}
                        innerIndex={innerIndex}
                        name={name}
                        policy={policy}
                        credentialType={credential.type}
                        onDeletePolicy={() =>
                          handleDeleteCustomPolicy(credential, innerIndex)
                        }
                        onValueChange={() => {
                          setCredentials(credentials)
                        }}
                      />
                    ))
                  )}
                </div>
              </CredentialCard>
            </div>
          </div>
        ))}

        <Button
          type="button"
          style="gradient"
          className={cs(styles.marginCenter)}
          onClick={handleNewRequestCredential}
        >
          <AddIcon /> New{' '}
          {{ ...getFieldContent('requestCredential', fields) }.label}
        </Button>
      </div>
      {isAsset && (
        <div className={`${styles.panelColumn} ${styles.marginBottom1em}`}>
          <div className={styles.checkboxWithTooltip}>
            <Input
              name="editAdvancedFeatures"
              label="Edit Advanced SSI Policy Features"
              type="checkbox"
              options={['Edit Advanced SSI Policy Features']}
              checked={editAdvancedFeatures}
              onChange={() => setEditAdvancedFeatures(!editAdvancedFeatures)}
              hideLabel={true}
              className={styles.advancedOptionsCheckbox}
            />
            <Tooltip
              content={
                <Markdown text="Enable advanced SSI policy features including holder binding, credential limits, and presentation requirements." />
              }
            />
          </div>
        </div>
      )}

      {editAdvancedFeatures && (
        <AdvancedOptions
          name={name}
          holderBinding={holderBinding}
          requireAllTypes={requireAllTypes}
          limitMinCredentials={limitMinCredentials}
          minCredentialsCount={minimumCredentials}
          limitMaxCredentials={limitMaxCredentials}
          maxCredentialsCount={maximumCredentials}
          onHolderBindingChange={handleHolderBindingToggle}
          onRequireAllTypesChange={handlePresentationDefinitionToggle}
          onLimitMinCredentialsChange={() =>
            setLimitMinCredentials(!limitMinCredentials)
          }
          onMinCredentialsCountChange={(value) => setMinimumCredentials(value)}
          onLimitMaxCredentialsChange={() =>
            setLimitMaxCredentials(!limitMaxCredentials)
          }
          onMaxCredentialsCountChange={(value) => setMaximumCredentials(value)}
        />
      )}
    </>
  )

  return ssiContent
}

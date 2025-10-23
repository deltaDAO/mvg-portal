import { getFieldContent } from '@utils/form'
import { Field } from 'formik'
import cs from 'classnames'
import { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import Input from '../FormInput'
import Button from '../atoms/Button'
import {
  ArgumentVpPolicy,
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
import AdvancedOptions from './AdvancedOptions/Advanced'
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

function ExternalEvpForwardVpPolicyView(
  props: VpPolicyViewProps
): ReactElement {
  const { index, onDeletePolicy, name }: VpPolicyViewProps = props
  return (
    <>
      <label>External EVP forward</label>
      <div className={`${styles.editorPanel} ${styles.marginBottom1em}`}>
        <div
          className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
        >
          <div className={`${styles.flexGrow}`}>
            <Field
              {...getFieldContent('policyUrl', fields)}
              component={Input}
              name={`${name}.vpPolicies[${index}].url`}
              placeholder="https://service.example.com/evp"
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

function VpPolicyView(props: VpPolicyViewProps): ReactElement {
  const { policy }: VpPolicyViewProps = props
  switch (policy?.type) {
    case 'staticVpPolicy':
      return StaticVpPolicyView(props)
    case 'argumentVpPolicy':
      return ArgumentVpPolicyView(props)
    case 'externalEvpForwardVpPolicy':
      return ExternalEvpForwardVpPolicyView(props)
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

  const [enabled, setEnabled] = useState(credentials.enabled || enabledView)
  const [editAdvancedFeatures, setEditAdvancedFeatures] = useState(
    credentials.advancedFeaturesEnabled ||
      (credentials.vpPolicies?.length ?? 0) > 0
  )
  const [holderBinding, setHolderBinding] = useState(() => {
    const hasHolderBinding = credentials.vpPolicies?.some(
      (p) => p?.type === 'staticVpPolicy' && p?.name === 'holder-binding'
    )
    return hasHolderBinding ?? true
  })
  const [requireAllTypes, setRequireAllTypes] = useState(() => {
    const hasPresentationDefinition = credentials.vpPolicies?.some(
      (p) =>
        p?.type === 'staticVpPolicy' && p?.name === 'presentation-definition'
    )
    return hasPresentationDefinition ?? true
  })
  const [maximumCredentials, setMaximumCredentials] = useState(() => {
    const maxCredsPolicy = credentials.vpPolicies?.find(
      (p) =>
        p?.type === 'argumentVpPolicy' && p?.policy === 'maximum-credentials'
    ) as ArgumentVpPolicy | undefined
    return maxCredsPolicy?.args || '1'
  })
  const [externalEvpForward, setExternalEvpForward] = useState(() => {
    return (
      credentials.vpPolicies?.some(
        (p) => p?.type === 'externalEvpForwardVpPolicy'
      ) ?? false
    )
  })
  const [externalEvpForwardUrl, setExternalEvpForwardUrl] = useState(() => {
    const p = credentials.vpPolicies?.find(
      (p) => p?.type === 'externalEvpForwardVpPolicy'
    ) as any
    return p?.url || credentials.externalEvpForwardUrl || ''
  })
  const [limitMaxCredentials, setLimitMaxCredentials] = useState(() => {
    const maxCredsPolicy = credentials.vpPolicies?.find(
      (p) =>
        p?.type === 'argumentVpPolicy' && p?.policy === 'maximum-credentials'
    ) as ArgumentVpPolicy | undefined
    return !!maxCredsPolicy
  })
  useEffect(() => {
    const p = credentials.vpPolicies?.find(
      (p) => p?.type === 'externalEvpForwardVpPolicy'
    ) as any
    setExternalEvpForward(!!p)
    setExternalEvpForwardUrl(p?.url || credentials.externalEvpForwardUrl || '')
  }, [credentials.vpPolicies, credentials.externalEvpForwardUrl])
  const [minimumCredentials, setMinimumCredentials] = useState(() => {
    const minCredsPolicy = credentials.vpPolicies?.find(
      (p) =>
        p?.type === 'argumentVpPolicy' && p?.policy === 'minimum-credentials'
    ) as ArgumentVpPolicy | undefined
    return minCredsPolicy?.args || '1'
  })
  const [limitMinCredentials, setLimitMinCredentials] = useState(() => {
    const minCredsPolicy = credentials.vpPolicies?.find(
      (p) =>
        p?.type === 'argumentVpPolicy' && p?.policy === 'minimum-credentials'
    ) as ArgumentVpPolicy | undefined
    return !!minCredsPolicy
  })
  const [hasUserSetEnabled, setHasUserSetEnabled] = useState(false)

  const [defaultPolicyStates, setDefaultPolicyStates] = useState(() => {
    const currentVcPolicies = credentials.vcPolicies || []
    const hasExistingPolicies = currentVcPolicies.length > 0

    // Initialize all policies as unchecked
    const initialState = {
      'not-before': currentVcPolicies.includes('not-before'),
      expired: currentVcPolicies.includes('expired'),
      'revoked-status-list': currentVcPolicies.includes('revoked-status-list'),
      signature: currentVcPolicies.includes('signature'),
      'signature_sd-jwt-vc': currentVcPolicies.includes('signature_sd-jwt-vc')
    }

    return initialState
  })

  // Update checkbox states when credentials change (e.g., when navigating between steps)
  useEffect(() => {
    const hasHolderBinding = credentials.vpPolicies?.some(
      (p) => p?.type === 'staticVpPolicy' && p?.name === 'holder-binding'
    )
    setHolderBinding(hasHolderBinding ?? true)

    const hasPresentationDefinition = credentials.vpPolicies?.some(
      (p) =>
        p?.type === 'staticVpPolicy' && p?.name === 'presentation-definition'
    )
    setRequireAllTypes(hasPresentationDefinition ?? true)

    const minCredsPolicy = credentials.vpPolicies?.find(
      (p) =>
        p?.type === 'argumentVpPolicy' && p?.policy === 'minimum-credentials'
    ) as ArgumentVpPolicy | undefined
    if (minCredsPolicy) {
      setLimitMinCredentials(true)
      setMinimumCredentials(minCredsPolicy.args || '1')
    } else {
      setLimitMinCredentials(false)
      setMinimumCredentials('1')
    }

    const maxCredsPolicy = credentials.vpPolicies?.find(
      (p) =>
        p?.type === 'argumentVpPolicy' && p?.policy === 'maximum-credentials'
    ) as ArgumentVpPolicy | undefined
    if (maxCredsPolicy) {
      setLimitMaxCredentials(true)
      setMaximumCredentials(maxCredsPolicy.args || '1')
    } else {
      setLimitMaxCredentials(false)
      setMaximumCredentials('1')
    }
  }, [credentials.vpPolicies])

  useEffect(() => {
    if (enabledView) {
      setEnabled(true)
    } else {
      const hasCurrentPolicies =
        credentials?.requestCredentials?.length > 0 ||
        credentials?.vcPolicies?.length > 0 ||
        credentials?.vpPolicies?.length > 0
      setEnabled(hasCurrentPolicies)
    }
  }, [
    enabledView,
    credentials?.requestCredentials?.length,
    credentials?.vcPolicies?.length,
    credentials?.vpPolicies?.length
  ])

  useEffect(() => {
    if (!credentials?.vpPolicies?.length) {
      return
    }

    if (!hasUserSetEnabled && !editAdvancedFeatures) {
      setEditAdvancedFeatures(true)
    }
  }, [credentials?.vpPolicies?.length, hasUserSetEnabled, editAdvancedFeatures])

  const allPolicies = hideDefaultPolicies ? [] : defaultPolicies

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
    const hasExistingCredentials =
      (credentials.vpPolicies && credentials.vpPolicies.length > 0) ||
      (credentials.requestCredentials &&
        credentials.requestCredentials.length > 0) ||
      (credentials.vcPolicies && credentials.vcPolicies.length > 0)

    const hasOnlyDefaultVcPolicies =
      credentials.vcPolicies?.length > 0 &&
      !credentials.vpPolicies?.length &&
      !credentials.requestCredentials?.length

    if (
      hasExistingCredentials &&
      !hasOnlyDefaultVcPolicies &&
      !credentials.enabled &&
      !hasUserSetEnabled
    ) {
      setEnabled(true)
      setCredentials({ ...credentials, enabled: true })
    }

    if (editAdvancedFeatures) {
      setHasUserSetEnabled(true)
    }

    if (!credentials.vpPolicies || credentials.vpPolicies.length === 0) {
      if (hasUserSetEnabled && editAdvancedFeatures) {
        setEditAdvancedFeatures(true)
        setHasUserSetEnabled(true)
      }
      return
    }

    if (!hasUserSetEnabled || editAdvancedFeatures) {
      setEditAdvancedFeatures(true)
    }
  }, [credentials.enabled, hasUserSetEnabled, editAdvancedFeatures])

  function handlePolicyEditorToggle(value: boolean) {
    setHasUserSetEnabled(true)
    if (!value) {
      const updatedCredentials = {
        ...credentials,
        enabled: false,
        requestCredentials: [],
        vcPolicies: [],
        vpPolicies: []
      }
      setCredentials(updatedCredentials)
      setEditAdvancedFeatures(false)
    } else {
      const updatedCredentials = {
        ...credentials,
        enabled: true
      }
      if (credentials.vpPolicies?.length) {
        updatedCredentials.vpPolicies = credentials.vpPolicies
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
    const updatedRequestCredentials = [...credentials.requestCredentials]
    updatedRequestCredentials.splice(index, 1)
    setCredentials({
      ...credentials,
      requestCredentials: updatedRequestCredentials
    })
  }

  function handleNewStaticCustomPolicy(credential: RequestCredentialForm) {
    const policy: StaticPolicy = {
      type: 'staticPolicy',
      name: ''
    }
    const updatedPolicies = [...(credential?.policies || []), policy]
    credential.policies = updatedPolicies
    setCredentials({ ...credentials })
  }

  function handleNewParameterizedCustomPolicy(
    credential: RequestCredentialForm
  ) {
    const policy: ParameterizedPolicy = {
      type: 'parameterizedPolicy',
      args: [],
      policy: 'allowed-issuer'
    }
    const updatedPolicies = [...(credential?.policies || []), policy]
    credential.policies = updatedPolicies
    setCredentials({ ...credentials })
  }

  function handleNewCustomUrlPolicy(credential: RequestCredentialForm) {
    const policy: CustomUrlPolicy = {
      type: 'customUrlPolicy',
      arguments: [],
      policyUrl: '',
      name: ''
    }
    const updatedPolicies = [...(credential?.policies || []), policy]
    credential.policies = updatedPolicies
    setCredentials({ ...credentials })
  }

  function handleNewCustomPolicy(credential: RequestCredentialForm) {
    const policy: CustomPolicy = {
      type: 'customPolicy',
      arguments: [],
      name: '',
      rules: []
    }
    const updatedPolicies = [...(credential?.policies || []), policy]
    credential.policies = updatedPolicies
    setCredentials({ ...credentials })
  }

  function handleDeleteCustomPolicy(
    credential: RequestCredentialForm,
    index: number
  ) {
    const updatedPolicies = [...(credential?.policies || [])]
    updatedPolicies.splice(index, 1)
    credential.policies = updatedPolicies
    setCredentials({ ...credentials })
  }

  function handleHolderBindingToggle() {
    const newValue = !holderBinding

    setHasUserSetEnabled(true)
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
    setHasUserSetEnabled(true)
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
    if (!enabled) return

    if (!editAdvancedFeatures) {
      if (
        Array.isArray(credentials.vpPolicies) &&
        credentials.vpPolicies.length === 0
      ) {
        const { vpPolicies, ...credentialsWithoutVpPolicies } = credentials
        setCredentials(credentialsWithoutVpPolicies)
      }
      return
    }

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

    if (holderBinding) {
      const exists = updatedVpPolicies.some(
        (p) => p?.type === 'staticVpPolicy' && p?.name === 'holder-binding'
      )
      if (!exists) {
        updatedVpPolicies.push({
          type: 'staticVpPolicy',
          name: 'holder-binding'
        })
        changed = true
      }
    } else {
      const filtered = updatedVpPolicies.filter(
        (p) => !(p?.type === 'staticVpPolicy' && p?.name === 'holder-binding')
      )
      if (filtered.length !== updatedVpPolicies.length) {
        updatedVpPolicies.length = 0
        updatedVpPolicies.push(...filtered)
        changed = true
      }
    }

    if (requireAllTypes) {
      const exists = updatedVpPolicies.some(
        (p) =>
          p?.type === 'staticVpPolicy' && p?.name === 'presentation-definition'
      )
      if (!exists) {
        updatedVpPolicies.push({
          type: 'staticVpPolicy',
          name: 'presentation-definition'
        })
        changed = true
      }
    } else {
      const filtered = updatedVpPolicies.filter(
        (p) =>
          !(
            p?.type === 'staticVpPolicy' &&
            p?.name === 'presentation-definition'
          )
      )
      if (filtered.length !== updatedVpPolicies.length) {
        updatedVpPolicies.length = 0
        updatedVpPolicies.push(...filtered)
        changed = true
      }
    }

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

    if (externalEvpForward) {
      const index = updatedVpPolicies.findIndex(
        (p) => p && (p as any).type === 'externalEvpForwardVpPolicy'
      )
      const newVal = {
        type: 'externalEvpForwardVpPolicy',
        url: externalEvpForwardUrl
      } as any
      if (index === -1) {
        updatedVpPolicies.push(newVal)
        changed = true
      } else {
        const curr = updatedVpPolicies[index] as any
        if (curr.url !== externalEvpForwardUrl) {
          updatedVpPolicies[index] = newVal
          changed = true
        }
      }
    } else {
      const filtered = updatedVpPolicies.filter(
        (p) => (p as any)?.type !== 'externalEvpForwardVpPolicy'
      )
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
    holderBinding,
    requireAllTypes,
    minimumCredentials,
    maximumCredentials,
    externalEvpForward,
    externalEvpForwardUrl
  ])

  useEffect(() => {
    if (!enabled) return

    const hasCompletedCredentials = credentials.requestCredentials?.some(
      (cred) => cred.type?.trim() && cred.format?.trim()
    )

    const selectedPolicies = Object.entries(defaultPolicyStates)
      .filter(([_, isSelected]) => isSelected)
      .map(([policyName, _]) => policyName)

    const currentVcPolicies = credentials.vcPolicies || []

    if (!hasCompletedCredentials) {
      if (currentVcPolicies.length > 0) {
        setCredentials({ ...credentials, vcPolicies: [] })
      }
      return
    }

    if (
      JSON.stringify(selectedPolicies.sort()) !==
      JSON.stringify(currentVcPolicies.sort())
    ) {
      setCredentials({ ...credentials, vcPolicies: selectedPolicies })
    }
  }, [
    defaultPolicyStates,
    enabled,
    credentials.requestCredentials,
    credentials.vcPolicies,
    setCredentials
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
              onChange={() => {
                const newValue = !editAdvancedFeatures
                setHasUserSetEnabled(true)
                setEditAdvancedFeatures(newValue)

                // Reset to initial values when re-enabling advanced features
                if (newValue) {
                  setHolderBinding(true)
                  setRequireAllTypes(true)
                  setLimitMinCredentials(false)
                  setLimitMaxCredentials(false)
                  setMinimumCredentials('1')
                  setMaximumCredentials('1')
                }

                setCredentials({
                  ...credentials,
                  advancedFeaturesEnabled: newValue
                })
              }}
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
          externalEvpForward={externalEvpForward}
          onExternalEvpForwardChange={() =>
            setExternalEvpForward(!externalEvpForward)
          }
          onExternalEvpForwardUrlChange={(value) =>
            setExternalEvpForwardUrl(value)
          }
        />
      )}
    </>
  )

  return ssiContent
}

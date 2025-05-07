import { getFieldContent } from '@utils/form'
import { Field } from 'formik'
import { ReactElement, useState } from 'react'
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

interface PolicyViewProps {
  policy: PolicyType
  name: string
  index: number
  innerIndex: number
  onDeletePolicy: () => void
  onValueChange: () => void
}

interface VpPolicyViewProps {
  policy: VpPolicyType
  name: string
  index: number
  onDeletePolicy: () => void
}

function StaticPolicyView(props: PolicyViewProps): ReactElement {
  const { index, innerIndex, name, onDeletePolicy }: PolicyViewProps = props
  return (
    <>
      <label>{{ ...getFieldContent('staticPolicy', fields) }.label}</label>
      <div className={`${styles.editorPanel} ${styles.marginBottom1em}`}>
        <div
          className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
        >
          <div className={`${styles.flexGrow}`}>
            <Field
              {...getFieldContent('name', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].name`}
            />
          </div>
          <Button
            type="button"
            style="primary"
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

function ParameterizedPolicyView(props: PolicyViewProps): ReactElement {
  const {
    policy,
    index,
    innerIndex,
    name,
    onDeletePolicy,
    onValueChange
  }: PolicyViewProps = props
  const parameterizedPolicy = policy as ParameterizedPolicy

  function newArgument(policy: ParameterizedPolicy): void {
    policy.args?.push('')
    onValueChange()
  }

  function deleteArgument(policy: ParameterizedPolicy, index: number) {
    policy.args?.splice(index, 1)
    onValueChange()
  }
  return (
    <>
      <label>
        {{ ...getFieldContent('parameterizedPolicy', fields) }.label}
      </label>
      <div className={`${styles.editorPanel} ${styles.marginBottom1em}`}>
        <div
          className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
        >
          <div className={`${styles.flexGrow}`}>
            <Field
              {...getFieldContent('policy', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].policy`}
            />
          </div>
          <Button
            type="button"
            style="primary"
            onClick={onDeletePolicy}
            className={`${styles.deleteButton} ${styles.marginBottomButton}`}
          >
            Delete
          </Button>
        </div>

        <Button
          type="button"
          className={`${styles.marginTopMinus2em} ${styles.marginBottom2em}`}
          style="primary"
          onClick={() => newArgument(parameterizedPolicy)}
        >
          New {{ ...getFieldContent('issuerDid', fields) }.label}
        </Button>
        {parameterizedPolicy?.args?.map((argument, argumentIndex) => (
          <div key={argumentIndex} className={styles.panelColumn}>
            <div
              className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100} ${styles.paddingLeft3em}`}
            >
              <div className={`${styles.flexGrow}`}>
                <Field
                  {...getFieldContent('issuerDid', fields)}
                  component={Input}
                  name={`${name}.requestCredentials[${index}].policies[${innerIndex}].args[${argumentIndex}]`}
                />
              </div>
              <Button
                type="button"
                style="primary"
                onClick={() =>
                  deleteArgument(parameterizedPolicy, argumentIndex)
                }
                className={`${styles.deleteButton} ${styles.marginBottomButton}`}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function CustomUrlPolicyView(props: PolicyViewProps): ReactElement {
  const {
    policy,
    index,
    innerIndex,
    name,
    onDeletePolicy,
    onValueChange
  }: PolicyViewProps = props

  const urlPolicy = policy as CustomUrlPolicy

  function newArgument(policy: CustomUrlPolicy): void {
    policy.arguments?.push({
      name: '',
      value: ''
    })
    onValueChange()
  }

  function deleteArgument(policy: CustomUrlPolicy, index: number) {
    policy.arguments.splice(index, 1)
    onValueChange()
  }

  return (
    <>
      <label>{{ ...getFieldContent('customUrlPolicy', fields) }.label}</label>
      <div className={`${styles.editorPanel} ${styles.marginBottom1em}`}>
        <div
          className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
        >
          <div className={`${styles.flexGrow}`}>
            <div
              className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
            >
              <div className={styles.flexGrow}>
                <Field
                  {...getFieldContent('name', fields)}
                  component={Input}
                  name={`${name}.requestCredentials[${index}].policies[${innerIndex}].name`}
                />
              </div>
              <Button
                type="button"
                style="primary"
                onClick={onDeletePolicy}
                className={`${styles.deleteButton} ${styles.marginBottomButton}`}
              >
                Delete
              </Button>
            </div>
            <Field
              {...getFieldContent('policyUrl', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].policyUrl`}
            />
          </div>
        </div>

        <Button
          type="button"
          className={`${styles.marginTopMinus2em} ${styles.marginBottom2em}`}
          style="primary"
          onClick={() => newArgument(urlPolicy)}
        >
          New {{ ...getFieldContent('argument', fields) }.label}
        </Button>
        {urlPolicy?.arguments?.map((argument, argumentIndex) => (
          <div key={argumentIndex} className={styles.panelColumn}>
            <div
              className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.paddingLeft3em}`}
            >
              <div className={styles.flexGrow}>
                <Field
                  {...getFieldContent('name', fields)}
                  component={Input}
                  name={`${name}.requestCredentials[${index}].policies[${innerIndex}].arguments[${argumentIndex}].name`}
                />
              </div>
              <div className={styles.flexGrow}>
                <Field
                  className={styles.flexGrow}
                  {...getFieldContent('value', fields)}
                  component={Input}
                  name={`${name}.requestCredentials[${index}].policies[${innerIndex}].arguments[${argumentIndex}].value`}
                />
              </div>
              <Button
                type="button"
                style="primary"
                onClick={() => deleteArgument(urlPolicy, argumentIndex)}
                className={`${styles.deleteButton} ${styles.marginBottomButton}`}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function CustomPolicyView(props: PolicyViewProps): ReactElement {
  const {
    policy,
    index,
    innerIndex,
    name,
    onDeletePolicy,
    onValueChange
  }: PolicyViewProps = props

  const customPolicy = policy as CustomPolicy

  function newRule(policy: CustomPolicy): void {
    policy.rules?.push({ leftValue: '', operator: '', rightValue: '' })
    onValueChange()
  }

  function deleteRule(policy: CustomPolicy, index: number) {
    policy.rules?.splice(index, 1)
    onValueChange()
  }

  return (
    <>
      <label>{{ ...getFieldContent('customPolicy', fields) }.label}</label>
      <div className={`${styles.editorPanel} ${styles.marginBottom1em}`}>
        <div
          className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
        >
          <div className={styles.flexGrow}>
            <Field
              {...getFieldContent('name', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].name`}
            />
          </div>
          <Button
            type="button"
            style="primary"
            onClick={onDeletePolicy}
            className={`${styles.deleteButton} ${styles.marginBottomButton}`}
          >
            Delete
          </Button>
        </div>

        <Button
          type="button"
          className={`${styles.marginTopMinus2em} ${styles.marginBottom2em}`}
          style="primary"
          onClick={() => newRule(customPolicy)}
        >
          New {{ ...getFieldContent('rule', fields) }.label}
        </Button>
        {customPolicy?.rules?.map((rule, ruleIndex) => (
          <div key={ruleIndex} className={styles.panelColumn}>
            <div
              className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100} ${styles.paddingLeft3em}`}
            >
              <div className={styles.flexGrow}>
                <Field
                  {...getFieldContent('leftValue', fields)}
                  component={Input}
                  name={`${name}.requestCredentials[${index}].policies[${innerIndex}].rules[${ruleIndex}].leftValue`}
                />
              </div>
              <Field
                {...getFieldContent('operator', fields)}
                component={Input}
                name={`${name}.requestCredentials[${index}].policies[${innerIndex}].rules[${ruleIndex}].operator`}
              />
              <div className={styles.flexGrow}>
                <Field
                  {...getFieldContent('rightValue', fields)}
                  component={Input}
                  name={`${name}.requestCredentials[${index}].policies[${innerIndex}].rules[${ruleIndex}].rightValue`}
                />
              </div>
              <Button
                type="button"
                style="primary"
                onClick={() => deleteRule(customPolicy, ruleIndex)}
                className={`${styles.deleteButton} ${styles.marginBottomButton}`}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function PolicyView(props: PolicyViewProps): ReactElement {
  const { policy }: PolicyViewProps = props
  switch (policy?.type) {
    case 'staticPolicy':
      return StaticPolicyView(props)
    case 'parameterizedPolicy':
      return ParameterizedPolicyView(props)
    case 'customUrlPolicy':
      return CustomUrlPolicyView(props)
    case 'customPolicy':
      return CustomPolicyView(props)
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
            style="primary"
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
              style="primary"
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
    isAsset = false
  }: PolicyEditorProps = props

  const [enabled, setEnabled] = useState(enabledView)
  const [editAdvancedFeatures, setEditAdvancedFeatures] = useState(false)
  const [holderBinding, setHolderBinding] = useState(true)
  const [requireAllTypes, setRequireAllTypes] = useState(true)
  const [maximumCredentials, setMaximumCredentials] = useState('1')
  const [limitMaxCredentials, setLimitMaxCredentials] = useState(false)
  const [minimumCredentials, setMinimumCredentials] = useState('1')
  const [limitMinCredentials, setLimitMinCredentials] = useState(false)

  const filteredDefaultPolicies = defaultPolicies.filter(
    (policy) => policy.length > 0
  )

  function handlePolicyEditorToggle(value: boolean) {
    if (!value) {
      const updatedCredentials = {
        ...credentials,
        requestCredentials: [],
        vcPolicies: [],
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
      policy: ''
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

  return (
    <>
      <div className={styles.enablePolicyToggle}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => handlePolicyEditorToggle(!enabled)}
          />
          Enable SSI Policy Editor
        </label>
      </div>
      {enabled && (
        <>
          <label className={styles.editorLabel}>
            {label} {help && <Tooltip content={<Markdown text={help} />} />}
          </label>
          <div className={`${styles.editorPanel} ${styles.marginBottom4em}`}>
            <div className={`${styles.panelColumn} ${styles.marginBottom2em}`}>
              <Button
                type="button"
                style="primary"
                className={styles.marginBottom1em}
                onClick={handleNewRequestCredential}
              >
                New {{ ...getFieldContent('requestCredential', fields) }.label}
              </Button>

              {credentials?.requestCredentials?.map((credential, index) => (
                <div
                  key={index}
                  className={`${styles.panelColumn} ${styles.item}`}
                >
                  <div
                    className={`${styles.paddingLeft1em} ${styles.paddingLeft1em} ${styles.paddingRight1em} ${styles.paddingTop1em}`}
                  >
                    <div
                      className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100} ${styles.flexGrow}`}
                    >
                      <div className={styles.flexGrow}>
                        <Field
                          {...getFieldContent('type', fields)}
                          component={Input}
                          name={`${name}.requestCredentials[${index}].type`}
                        />
                      </div>
                      <div className={styles.flexGrow}>
                        <Field
                          {...getFieldContent('format', fields)}
                          component={Input}
                          name={`${name}.requestCredentials[${index}].format`}
                        />
                      </div>
                      <Button
                        type="button"
                        style="primary"
                        onClick={() => handleDeleteRequestCredential(index)}
                        className={`${styles.deleteButton} ${styles.marginBottomButton}`}
                      >
                        Delete
                      </Button>
                    </div>
                    <div
                      className={`${styles.marginTopMinus2em} ${styles.panelRow} ${styles.alignItemsBaseline} ${styles.justifyContentSpaceBetween}`}
                    >
                      <div
                        className={`${styles.panelRow} ${styles.alignItemsBaseline}`}
                      >
                        <label>
                          {{ ...getFieldContent('newPolicy', fields) }.label}
                        </label>

                        <select
                          value={credential.newPolicyType || 'staticPolicy'}
                          onChange={(e) => {
                            credential.newPolicyType = e.target.value
                            setCredentials({ ...credentials })
                          }}
                          className={styles.selectDropdown}
                        >
                          <option value="staticPolicy">
                            {{ ...getFieldContent('static', fields) }.label}
                          </option>
                          <option value="parameterizedPolicy">
                            {
                              { ...getFieldContent('parameterized', fields) }
                                .label
                            }
                          </option>
                          <option value="customUrlPolicy">
                            {{ ...getFieldContent('customUrl', fields) }.label}
                          </option>
                          <option value="customPolicy">
                            {{ ...getFieldContent('custom', fields) }.label}
                          </option>
                        </select>

                        <Button
                          type="button"
                          style="primary"
                          className={styles.space}
                          onClick={() => {
                            if (credential.newPolicyType === 'staticPolicy')
                              handleNewStaticCustomPolicy(credential)
                            else if (
                              credential.newPolicyType === 'parameterizedPolicy'
                            )
                              handleNewParameterizedCustomPolicy(credential)
                            else if (
                              credential.newPolicyType === 'customUrlPolicy'
                            )
                              handleNewCustomUrlPolicy(credential)
                            else if (
                              credential.newPolicyType === 'customPolicy'
                            )
                              handleNewCustomPolicy(credential)
                          }}
                        >
                          Add Policy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.paddingLeft3em}>
                    {credential?.policies?.map((policy, innerIndex) => (
                      <div key={innerIndex} className={styles.panelColumn}>
                        <PolicyView
                          index={index}
                          innerIndex={innerIndex}
                          name={name}
                          policy={policy}
                          onDeletePolicy={() =>
                            handleDeleteCustomPolicy(credential, innerIndex)
                          }
                          onValueChange={() => {
                            setCredentials(credentials)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {credentials?.requestCredentials.length > 0 && (
              <>
                <div
                  className={`${styles.panelColumn} ${styles.marginBottom2em} ${styles.width100}`}
                >
                  {credentials?.vpPolicies?.map((policy, index) => (
                    <VpPolicyView
                      key={index}
                      index={index}
                      name={name}
                      policy={policy}
                      onDeletePolicy={() => handleDeleteVpPolicy(index)}
                    />
                  ))}
                </div>
                {isAsset && (
                  <div
                    className={`${styles.panelColumn} ${styles.marginBottom2em} ${styles.width100}`}
                  >
                    {credentials?.requestCredentials.length > 0 && (
                      <Button
                        type="button"
                        style="primary"
                        className={`${styles.marginBottom1em}`}
                        onClick={handleNewStaticPolicy}
                      >
                        New{' '}
                        {{ ...getFieldContent('staticPolicy', fields) }.label}
                      </Button>
                    )}

                    {credentials?.requestCredentials.length > 0 &&
                      credentials?.vcPolicies?.map((rule, index) => (
                        <div
                          key={index}
                          className={`${styles.panelColumn} ${styles.width100}`}
                        >
                          <div
                            className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100}`}
                          >
                            <div className={`${styles.flexGrow}`}>
                              <Field
                                key={index}
                                {...staticPolicyLabel(index)}
                                component={Input}
                                name={`${name}.vcPolicies[${index}]`}
                                readOnly={
                                  index < filteredDefaultPolicies?.length &&
                                  filteredDefaultPolicies.includes(
                                    credentials?.vcPolicies[index]
                                  ) &&
                                  credentials?.vcPolicies[index]?.length > 0
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              style="primary"
                              disabled={
                                index < filteredDefaultPolicies?.length &&
                                filteredDefaultPolicies.includes(
                                  credentials?.vcPolicies[index]
                                ) &&
                                credentials?.vcPolicies[index]?.length > 0
                              }
                              onClick={() => handleDeleteStaticPolicy(index)}
                              className={`${styles.deleteButton} ${styles.marginBottomButton}`}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
          {isAsset && (
            <div className={`${styles.panelColumn} ${styles.marginBottom1em}`}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editAdvancedFeatures}
                  onChange={() =>
                    setEditAdvancedFeatures(!editAdvancedFeatures)
                  }
                />
                Edit Advanced SSI Policy Features
                <Tooltip
                  content={
                    <Markdown
                      text={`The requested Verifiable Credentials are grouped in a Verifiable Presentation before being submitted for verification. This screen allows the user to set the policies applicable to the Verifiable Presentation.`}
                    />
                  }
                />
              </label>
            </div>
          )}

          {editAdvancedFeatures && (
            <div
              className={`${styles.editorPanel} ${styles.marginBottom2em} ${styles.marginTop1em}`}
            >
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={holderBinding}
                  onChange={() => setHolderBinding(!holderBinding)}
                />
                Credential(s) presenter same as credential(s) owner
                <Tooltip content={<Markdown text={`TO EDIT`} />} />
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={requireAllTypes}
                  onChange={() => setRequireAllTypes(!requireAllTypes)}
                />
                All requested credential types are necessary for verification
                <Tooltip content={<Markdown text={`TO EDIT`} />} />
              </label>

              <div
                className={`${styles.panelRow} ${styles.alignItemsCenter} ${styles.marginTop1em} ${styles.marginTop1em}`}
              >
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={limitMinCredentials}
                    onChange={() =>
                      setLimitMinCredentials(!limitMinCredentials)
                    }
                  />
                  Minimum number of credentials required
                  <Tooltip
                    content={
                      <Markdown
                        text={`Enable to limit min credentials required for verification.`}
                      />
                    }
                  />
                </label>

                {limitMinCredentials && (
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={minimumCredentials}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (!isNaN(value)) {
                        const clamped = Math.max(1, Math.min(100, value))
                        setMinimumCredentials(clamped.toString())
                      }
                    }}
                    className={`${styles.input} ${styles.numberInput}`}
                  />
                )}
              </div>

              <div
                className={`${styles.panelRow} ${styles.alignItemsCenter} ${styles.marginTop05em} ${styles.marginBottom2em}`}
              >
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={limitMaxCredentials}
                    onChange={() =>
                      setLimitMaxCredentials(!limitMaxCredentials)
                    }
                  />
                  Maximum number of credentials required
                  <Tooltip
                    content={
                      <Markdown
                        text={`Enable to limit max credentials required for verification.`}
                      />
                    }
                  />
                </label>

                {limitMaxCredentials && (
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maximumCredentials}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (!isNaN(value)) {
                        const clamped = Math.max(1, Math.min(100, value))
                        setMaximumCredentials(clamped.toString())
                      }
                    }}
                    className={`${styles.input} ${styles.numberInput}`}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

import { getFieldContent } from '@utils/form'
import { Field } from 'formik'
import { ReactElement } from 'react'
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
  StaticVpPolicy,
  ArgumentVpPolicy,
  VpPolicyType
} from './types'
import fields from './editor.json'

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

  function newArgument(policy: CustomPolicy): void {
    policy.arguments?.push({
      name: '',
      value: ''
    })
    onValueChange()
  }

  function deleteArgument(policy: CustomPolicy, index: number) {
    policy.arguments?.splice(index, 1)
    onValueChange()
  }

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
          onClick={() => newArgument(customPolicy)}
        >
          New {{ ...getFieldContent('argument', fields) }.label}
        </Button>
        <div className={styles.marginBottom2em}>
          {customPolicy?.arguments?.map((argument, argumentIndex) => (
            <div key={argumentIndex} className={styles.panelColumn}>
              <div
                className={`${styles.panelRow} ${styles.alignItemsEnd} ${styles.width100} ${styles.paddingLeft3em}`}
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
                    {...getFieldContent('value', fields)}
                    component={Input}
                    name={`${name}.requestCredentials[${index}].policies[${innerIndex}].arguments[${argumentIndex}].value`}
                  />
                </div>
                <Button
                  type="button"
                  style="primary"
                  onClick={() => deleteArgument(customPolicy, argumentIndex)}
                  className={`${styles.deleteButton} ${styles.marginBottomButton}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
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
    defaultPolicies = []
  }: PolicyEditorProps = props

  const filteredDefaultPolicies = defaultPolicies.filter(
    (policy) => policy.length > 0
  )

  function handleNewRequestCredential() {
    const newRequestCredential: RequestCredentialForm = {
      format: '',
      type: '',
      policies: []
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

  function handleNewStaticVpPolicy() {
    const policy: StaticVpPolicy = {
      type: 'staticVpPolicy',
      name: ''
    }
    credentials?.vpPolicies?.push(policy)
    setCredentials(credentials)
  }

  function handleNewVpPolicy() {
    const policy: ArgumentVpPolicy = {
      type: 'argumentVpPolicy',
      policy: '',
      args: ''
    }
    credentials?.vpPolicies?.push(policy)
    setCredentials(credentials)
  }

  function handleDeleteVpPolicy(index: number) {
    credentials.vpPolicies.splice(index, 1)
    setCredentials(credentials)
  }

  return (
    <>
      <label className={styles.editorLabel}>{label}</label>
      <div className={`${styles.editorPanel} ${styles.marginBottom4em}`}>
        <div
          className={`${styles.panelColumn} ${styles.marginBottom2em} ${styles.width100}`}
        >
          <Button
            type="button"
            style="primary"
            className={`${styles.marginBottom1em}`}
            onClick={handleNewStaticPolicy}
          >
            New {{ ...getFieldContent('staticPolicy', fields) }.label}
          </Button>

          {credentials?.vcPolicies?.map((rule, index) => (
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
            <div key={index} className={`${styles.panelColumn} ${styles.item}`}>
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
                    <Button
                      type="button"
                      style="primary"
                      className={`${styles.marginBottom1em} ${styles.space}`}
                      onClick={() => handleNewStaticCustomPolicy(credential)}
                    >
                      {{ ...getFieldContent('static', fields) }.label}
                    </Button>
                    <Button
                      type="button"
                      style="primary"
                      className={`${styles.marginBottom1em} ${styles.space}`}
                      onClick={() =>
                        handleNewParameterizedCustomPolicy(credential)
                      }
                    >
                      {{ ...getFieldContent('parameterized', fields) }.label}
                    </Button>
                    <Button
                      type="button"
                      style="primary"
                      className={`${styles.marginBottom1em} ${styles.space}`}
                      onClick={() => handleNewCustomUrlPolicy(credential)}
                    >
                      {{ ...getFieldContent('customUrl', fields) }.label}
                    </Button>
                    <Button
                      type="button"
                      style="primary"
                      className={`${styles.marginBottom1em} ${styles.space}`}
                      onClick={() => handleNewCustomPolicy(credential)}
                    >
                      {{ ...getFieldContent('custom', fields) }.label}
                    </Button>
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
            </div>
          ))}
        </div>

        <div
          className={`${styles.panelColumn} ${styles.marginBottom2em} ${styles.width100}`}
        >
          <div
            className={`${styles.panelRow} ${styles.marginBottom2em} ${styles.marginBottom1em}`}
          >
            <Button
              type="button"
              style="primary"
              onClick={handleNewStaticVpPolicy}
            >
              New {{ ...getFieldContent('staticVpPolicy', fields) }.label}
            </Button>

            <Button
              className={`${styles.space}`}
              type="button"
              style="primary"
              onClick={handleNewVpPolicy}
            >
              New {{ ...getFieldContent('argumentVpPolicy', fields) }.label}
            </Button>
          </div>

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
      </div>
    </>
  )
}

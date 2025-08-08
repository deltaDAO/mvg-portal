import { ReactElement } from 'react'
import { Field } from 'formik'
import Button from '../../atoms/Button'
import Input from '../../FormInput'
import { getFieldContent } from '@utils/form'
import styles from './Block.module.css'
import fields from '../editor.json'
import DeleteButton from '../../DeleteButton/DeleteButton'
import { credentialFieldOptions } from '../constant/credentialFields'

interface CustomPolicyBlockProps {
  name: string
  index: number
  innerIndex: number
  policy: any
  onDelete: () => void
  onValueChange: () => void
  credentialType?: string
}

export default function CustomPolicyBlock({
  name,
  index,
  innerIndex,
  policy,
  onDelete,
  onValueChange,
  credentialType
}: CustomPolicyBlockProps): ReactElement {
  function newRule() {
    if (!policy.rules) {
      policy.rules = []
    }
    policy.rules.push({ leftValue: '', operator: '', rightValue: '' })
    onValueChange()
  }

  function deleteRule(ruleIndex: number) {
    policy.rules.splice(ruleIndex, 1)
    onValueChange()
  }

  const credentialTypeValue = credentialType || 'id'
  const options = credentialFieldOptions[credentialTypeValue] || ['id']

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <Field
          {...getFieldContent('name', fields)}
          component={Input}
          name={`${name}.requestCredentials[${index}].policies[${innerIndex}].name`}
          required
        />
        <DeleteButton onClick={onDelete} />
      </div>

      <div className={styles.content}>
        {policy.rules?.map((rule, ruleIndex) => (
          <div key={ruleIndex} className={styles.ruleRow}>
            <div className={styles.fieldContainer}>
              <label htmlFor={`customPolicy.rules.${index}.leftValue`}>
                Credential field<span className={styles.required}>*</span>
              </label>
              <Field
                as="select"
                name={`${name}.requestCredentials[${index}].policies[${innerIndex}].rules[${ruleIndex}].leftValue`}
                className={styles.ruleInput}
                required
              >
                <option value="">Select field</option>
                {options.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </Field>
            </div>
            <Field
              {...getFieldContent('operator', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].rules[${ruleIndex}].operator`}
              className={styles.operatorInput}
            />
            <Field
              {...getFieldContent('rightValue', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].rules[${ruleIndex}].rightValue`}
              className={styles.ruleInput}
            />
            <DeleteButton onClick={() => deleteRule(ruleIndex)} />
          </div>
        ))}

        <Button
          type="button"
          style="gradient"
          onClick={newRule}
          className={styles.newArgument}
        >
          New rule
        </Button>
      </div>
    </div>
  )
}

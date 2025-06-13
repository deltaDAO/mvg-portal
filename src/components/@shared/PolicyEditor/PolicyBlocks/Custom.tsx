import { ReactElement } from 'react'
import { Field } from 'formik'
import Button from '../../atoms/Button'
import Input from '../../FormInput'
import { getFieldContent } from '@utils/form'
import styles from './Block.module.css'
import fields from '../editor.json'
import DeleteButton from '../../DeleteButton/DeleteButton'

interface CustomPolicyBlockProps {
  name: string
  index: number
  innerIndex: number
  policy: any
  onDelete: () => void
  onValueChange: () => void
}

export default function CustomPolicyBlock({
  name,
  index,
  innerIndex,
  policy,
  onDelete,
  onValueChange
}: CustomPolicyBlockProps): ReactElement {
  function newRule() {
    if (!policy.rules) {
      policy.rules = []
    }
    policy.rules.push({ leftValue: '', operator: '==', rightValue: '' })
    onValueChange()
  }

  function deleteRule(ruleIndex: number) {
    policy.rules.splice(ruleIndex, 1)
    onValueChange()
  }

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
            <Field
              {...getFieldContent('leftValue', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].rules[${ruleIndex}].leftValue`}
              className={styles.ruleInput}
            />
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

import { ReactElement } from 'react'
import { Field } from 'formik'
import Button from '../../atoms/Button'
import Input from '../../FormInput'
import { getFieldContent } from '@utils/form'
import styles from './Block.module.css'
import fields from '../editor.json'
import DeleteButton from '../../DeleteButton/DeleteButton'

interface CustomUrlPolicyBlockProps {
  name: string
  index: number
  innerIndex: number
  policy: any
  onDelete: () => void
  onValueChange: () => void
}

export default function CustomUrlPolicyBlock({
  name,
  index,
  innerIndex,
  policy,
  onDelete,
  onValueChange
}: CustomUrlPolicyBlockProps): ReactElement {
  function newArgument() {
    if (!policy.arguments) {
      policy.arguments = []
    }
    policy.arguments.push({ name: '', value: '' })
    onValueChange()
  }

  function deleteArgument(argIndex: number) {
    policy.arguments.splice(argIndex, 1)
    onValueChange()
  }

  return (
    <div className={styles.block}>
      <div className={`${styles.header}`}>
        <Field
          label="Custom URL Policy Name"
          placeholder="Enter policy name"
          component={Input}
          name={`${name}.requestCredentials[${index}].policies[${innerIndex}].name`}
          required
        />
        <DeleteButton onClick={onDelete} className={styles.deleteArgument} />
      </div>

      <div className={styles.content}>
        <Field
          {...getFieldContent('policyUrl', fields)}
          component={Input}
          name={`${name}.requestCredentials[${index}].policies[${innerIndex}].policyUrl`}
        />

        {/* Spacer to prevent overlap between Policy URL and arguments */}
        <div style={{ marginBottom: '16px' }} />

        {policy.arguments?.map((argument, argIndex) => (
          <div key={argIndex} className={styles.argumentRow}>
            <Field
              {...getFieldContent('name', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].arguments[${argIndex}].name`}
              className={styles.argumentInput}
            />
            <Field
              {...getFieldContent('value', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].arguments[${argIndex}].value`}
              className={styles.argumentInput}
            />
            <DeleteButton
              className={styles.deleteArgument}
              onClick={() => deleteArgument(argIndex)}
            />
          </div>
        ))}

        <Button
          type="button"
          style="gradient"
          onClick={newArgument}
          className={styles.newArgument}
        >
          New argument
        </Button>
      </div>
    </div>
  )
}

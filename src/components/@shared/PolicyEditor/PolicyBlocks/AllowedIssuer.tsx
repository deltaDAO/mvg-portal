import { ReactElement } from 'react'
import { Field } from 'formik'
import cs from 'classnames'
import Button from '../../atoms/Button'
import Input from '../../FormInput'
import { getFieldContent } from '@utils/form'
import styles from './Block.module.css'
import fields from '../editor.json'
import DeleteButton from '../../DeleteButton/DeleteButton'

interface AllowedIssuerPolicyBlockProps {
  name: string
  index: number
  innerIndex: number
  policy: any
  onDelete: () => void
  onValueChange: () => void
}

export default function AllowedIssuerPolicyBlock({
  name,
  index,
  innerIndex,
  policy,
  onDelete,
  onValueChange
}: AllowedIssuerPolicyBlockProps): ReactElement {
  function newArgument() {
    if (!policy.args) {
      policy.args = []
    }
    policy.args.push('')
    onValueChange()
  }

  function deleteArgument(argIndex: number) {
    policy.args.splice(argIndex, 1)
    onValueChange()
  }

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        {/* Hidden field to maintain form state */}
        <Field
          type="hidden"
          name={`${name}.requestCredentials[${index}].policies[${innerIndex}].policy`}
        />
        {/* Display field - always shows "allowed-issuer" */}
        <Input
          {...getFieldContent('policy', fields)}
          value="allowed-issuer"
          disabled
          required
        />
        <DeleteButton onClick={onDelete} />
      </div>

      <div className={styles.content}>
        {policy.args?.map((argument, argIndex) => (
          <div
            key={argIndex}
            className={cs(styles.argumentRow, styles.fullWidth)}
          >
            <Field
              {...getFieldContent('issuerDid', fields)}
              component={Input}
              name={`${name}.requestCredentials[${index}].policies[${innerIndex}].args[${argIndex}]`}
              className={styles.argumentInput}
            />
            <DeleteButton onClick={() => deleteArgument(argIndex)} />
          </div>
        ))}

        <Button
          type="button"
          style="gradient"
          onClick={newArgument}
          className={styles.newArgument}
        >
          New {getFieldContent('issuerDid', fields).label}
        </Button>
      </div>
    </div>
  )
}

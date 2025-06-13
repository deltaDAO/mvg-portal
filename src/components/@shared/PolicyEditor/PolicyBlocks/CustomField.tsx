import { ReactElement } from 'react'
import { Field } from 'formik'
import Input from '../../FormInput'
import Button from '../../atoms/Button'
import { getFieldContent } from '@utils/form'
import FieldRow from '../FieldRow/Row'
import styles from './Block.module.css'
import fields from '../editor.json'

interface CustomFieldPolicyProps {
  index: number
  innerIndex: number
  name: string
  onDelete: () => void
}

export default function CustomFieldPolicy({
  index,
  innerIndex,
  name,
  onDelete
}: CustomFieldPolicyProps): ReactElement {
  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <label className={styles.label}>
          {getFieldContent('customFieldPolicy', fields).label}
        </label>
        <Button type="button" style="outlined" onClick={onDelete}>
          Delete
        </Button>
      </div>

      <FieldRow>
        <Field
          {...getFieldContent('field', fields)}
          component={Input}
          name={`${name}.requestCredentials[${index}].policies[${innerIndex}].field`}
        />
        <Field
          {...getFieldContent('value', fields)}
          component={Input}
          name={`${name}.requestCredentials[${index}].policies[${innerIndex}].value`}
        />
      </FieldRow>
    </div>
  )
}

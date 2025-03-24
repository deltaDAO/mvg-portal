import Input from '@shared/FormInput'
import { Field, useFormikContext } from 'formik'
import { ReactElement } from 'react'
import content from '../../../../content/publish/form.json'
import styles from './index.module.css'
import { getFieldContent } from '@utils/form'
import Button from '@components/@shared/atoms/Button'
import { FormAdditionalDdo, FormPublishData } from '../../Publish/_types'
import { MetadataEditForm } from '@components/Asset/Edit/_types'

export function AdditionalDdosFields(): ReactElement {
  const { values, setFieldValue } = useFormikContext<
    FormPublishData | MetadataEditForm
  >()

  const handleNewDdo = async () => {
    if (!values.additionalDdos) {
      values.additionalDdos = []
    }

    const newDDO: FormAdditionalDdo = {
      data: '',
      type: ''
    }
    values.additionalDdos?.push(newDDO)
    await setFieldValue('additionalDdos', values.additionalDdos)
  }

  const handleDelete = async (index: number) => {
    values.additionalDdos.splice(index, 1)
    await setFieldValue('additionalDdos', values.additionalDdos)
  }

  return (
    <>
      <div className={styles.newDdoBtn}>
        <Button
          type="button"
          style="primary"
          onClick={handleNewDdo}
          title="To add a description of the asset relevant for other data ecosystems, use the button below"
        >
          Create Additional Asset Description
        </Button>
      </div>

      {values.additionalDdos?.map((ddo, index) => {
        return (
          <div key={`${index}`} className={styles.inputLine}>
            <div className={styles.ddoField}>
              <Field
                {...getFieldContent('ddoType', content.additionalDdos.fields)}
                component={Input}
                name={`additionalDdos[${index}].type`}
              />
              <Field
                {...getFieldContent(
                  'additionalCredential',
                  content.additionalDdos.fields
                )}
                component={Input}
                name={`additionalDdos[${index}].data`}
                rows={15}
              />
            </div>
            <div className={styles.deleteBtn}>
              <Button
                type="button"
                style={'primary'}
                onClick={() => handleDelete(index)}
              >
                Delete
              </Button>
            </div>
          </div>
        )
      })}
    </>
  )
}

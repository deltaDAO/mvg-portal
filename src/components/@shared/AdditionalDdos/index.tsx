import Input from '@shared/FormInput'
import { Field, useFormikContext } from 'formik'
import { ReactElement } from 'react'
import content from '../../../../content/publish/form.json'
import styles from './index.module.css'
import { getFieldContent } from '@utils/form'
import { FormAdditionalDdo, FormPublishData } from '../../Publish/_types'
import { MetadataEditForm } from '@components/Asset/Edit/_types'
import SectionContainer from '@shared/SectionContainer/SectionContainer'
import DeleteButton from '@shared/DeleteButton/DeleteButton'
import PublishButton from '@shared/PublishButton'

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

  const displayDdos = values.additionalDdos || []

  return (
    <>
      <SectionContainer
        title="Additional Asset Description"
        variant="default"
        help={content.additionalDdos.help}
        border={true}
      >
        {displayDdos.map((ddo, index) => {
          const canDelete = displayDdos.length > 0
          return (
            <SectionContainer key={`${index}`} classNames={styles.assetCard}>
              <div className={styles.header}>
                <h3 className={styles.title}>
                  Additional Asset Description #{index + 1}
                </h3>
              </div>
              <Field
                {...getFieldContent('ddoType', content.additionalDdos.fields)}
                component={Input}
                name={`additionalDdos[${index}].type`}
                variant="publish"
              />
              <Field
                {...getFieldContent(
                  'additionalCredential',
                  content.additionalDdos.fields
                )}
                component={Input}
                name={`additionalDdos[${index}].data`}
                rows={4}
                variant="publish"
              />
              {canDelete && (
                <div className={styles.deleteButtonContainer}>
                  <DeleteButton onClick={() => handleDelete(index)} />
                </div>
              )}
            </SectionContainer>
          )
        })}

        <div className={styles.createButtonContainer}>
          <PublishButton
            type="button"
            text="Create Additional Asset Description"
            buttonStyle="gradient"
            icon="add"
            onClick={handleNewDdo}
          />
        </div>
      </SectionContainer>
    </>
  )
}

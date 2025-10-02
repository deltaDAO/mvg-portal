import { ReactElement } from 'react'
import { Field } from 'formik'
import Input from '../../FormInput'
import styles from './Advanced.module.css'
import Tooltip from '@shared/atoms/Tooltip'
import Markdown from '@shared/Markdown'
import cs from 'classnames'

interface AdvancedOptionsProps {
  name: string
  holderBinding: boolean
  requireAllTypes: boolean
  limitMinCredentials: boolean
  minCredentialsCount: string
  limitMaxCredentials: boolean
  maxCredentialsCount: string
  onHolderBindingChange: () => void
  onRequireAllTypesChange: () => void
  onLimitMinCredentialsChange: () => void
  onMinCredentialsCountChange: (value: string) => void
  onLimitMaxCredentialsChange: () => void
  onMaxCredentialsCountChange: (value: string) => void
  externalEvpForward: boolean
  onExternalEvpForwardChange: () => void
  onExternalEvpForwardUrlChange: (value: string) => void
}

export default function AdvancedOptions({
  name,
  holderBinding,
  requireAllTypes,
  limitMinCredentials,
  minCredentialsCount,
  limitMaxCredentials,
  maxCredentialsCount,
  onHolderBindingChange,
  onRequireAllTypesChange,
  onLimitMinCredentialsChange,
  onMinCredentialsCountChange,
  onLimitMaxCredentialsChange,
  onMaxCredentialsCountChange,
  externalEvpForward,
  onExternalEvpForwardChange,
  onExternalEvpForwardUrlChange
}: AdvancedOptionsProps): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Advanced SSI Policy Features</h3>
        <Tooltip
          content={
            <Markdown text="Enable advanced features to customize your policy." />
          }
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.checkboxRow}>
          <Input
            name={`${name}.holderBinding`}
            type="checkbox"
            options={['Credential(s) presenter same as credential(s) owner']}
            checked={holderBinding}
            onChange={onHolderBindingChange}
            hideLabel={true}
          />
          <Tooltip
            content={
              <Markdown text="Ensures that the entity presenting the credential is the same as the entity to whom the credential was issued." />
            }
          />
        </div>

        <div className={styles.checkboxRow}>
          <Input
            name={`${name}.requireAllTypes`}
            type="checkbox"
            options={[
              'All requested credential types are necessary for verification'
            ]}
            checked={requireAllTypes}
            onChange={onRequireAllTypesChange}
            hideLabel={true}
          />
          <Tooltip
            content={
              <Markdown text="When enabled, all specified credential types must be presented for successful verification." />
            }
          />
        </div>

        <div className={styles.inputRow}>
          <div className={styles.checkboxWithTooltip}>
            <Input
              name={`${name}.limitMinCredentials`}
              type="checkbox"
              options={['Minimum number of credentials required']}
              checked={limitMinCredentials}
              onChange={onLimitMinCredentialsChange}
              hideLabel={true}
            />
            <Tooltip
              content={
                <Markdown text="Set the minimum number of credentials that must be presented for successful verification." />
              }
            />
          </div>
          {limitMinCredentials && (
            <Input
              name={`${name}.minCredentialsCount`}
              type="number"
              value={minCredentialsCount}
              onChange={(e) =>
                onMinCredentialsCountChange(
                  (e.target as HTMLInputElement).value
                )
              }
              min="1"
              max="100"
              placeholder="1"
              hideLabel={true}
              className={cs(
                styles.numberInput,
                !limitMinCredentials && styles.hidden
              )}
              disabled={!limitMinCredentials}
            />
          )}
        </div>

        <div className={styles.inputRow}>
          <div className={styles.checkboxWithTooltip}>
            <Input
              name={`${name}.limitMaxCredentials`}
              type="checkbox"
              options={['Maximum number of credentials required']}
              checked={limitMaxCredentials}
              onChange={onLimitMaxCredentialsChange}
              hideLabel={true}
            />
            <Tooltip
              content={
                <Markdown text="Set the maximum number of credentials that can be presented. Useful for limiting the scope of verification." />
              }
            />
          </div>
          {limitMaxCredentials && (
            <Input
              name={`${name}.maxCredentialsCount`}
              type="number"
              value={maxCredentialsCount}
              onChange={(e) =>
                onMaxCredentialsCountChange(
                  (e.target as HTMLInputElement).value
                )
              }
              min="1"
              max="100"
              placeholder="1"
              hideLabel={true}
              className={styles.numberInput}
              disabled={!limitMaxCredentials}
            />
          )}
        </div>

        <div className={styles.inputRow}>
          <div className={styles.checkboxWithTooltip}>
            <Input
              name={`${name}.externalEvpForward`}
              type="checkbox"
              options={['External EVP forward']}
              checked={externalEvpForward}
              onChange={onExternalEvpForwardChange}
              hideLabel={true}
            />
            <Tooltip
              content={
                <Markdown text="Submits the Enveloped Verifiable Presentation to an external service for verification. Provide the service URL when enabled." />
              }
            />
          </div>
          {externalEvpForward && (
            <div className={styles.fullWidth}>
              <Field name={`${name}.externalEvpForwardUrl`}>
                {({ field, form }) => (
                  <Input
                    field={field}
                    form={form}
                    type="text"
                    placeholder="https://service.example.com/evp"
                    value={field.value || ''}
                    onChange={(e) => {
                      const val = (e.target as HTMLInputElement).value
                      onExternalEvpForwardUrlChange(val)
                      form.setFieldValue(field.name, val)
                    }}
                    pattern="^https?://.+"
                    hideLabel={true}
                  />
                )}
              </Field>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

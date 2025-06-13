import { ReactElement, useState } from 'react'
import Input from '../../FormInput'
import styles from './Advanced.module.css'
import Tooltip from '@shared/atoms/Tooltip'
import Markdown from '@shared/Markdown'
import cs from 'classnames'

interface AdvancedOptionsProps {
  name: string
}

export default function AdvancedOptions({
  name
}: AdvancedOptionsProps): ReactElement {
  const [holderBinding, setHolderBinding] = useState(false)
  const [requireAllTypes, setRequireAllTypes] = useState(false)
  const [limitMinCredentials, setLimitMinCredentials] = useState(false)
  const [minCredentialsCount, setMinCredentialsCount] = useState('1')
  const [limitMaxCredentials, setLimitMaxCredentials] = useState(false)
  const [maxCredentialsCount, setMaxCredentialsCount] = useState('1')

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
            name="holderBinding"
            type="checkbox"
            options={['Credential(s) presenter same as credential(s) owner']}
            checked={holderBinding}
            onChange={() => setHolderBinding(!holderBinding)}
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
            name="requireAllTypes"
            type="checkbox"
            options={[
              'All requested credential types are necessary for verification'
            ]}
            checked={requireAllTypes}
            onChange={() => setRequireAllTypes(!requireAllTypes)}
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
              name="limitMinCredentials"
              type="checkbox"
              options={['Minimum number of credentials required']}
              checked={limitMinCredentials}
              onChange={() => setLimitMinCredentials(!limitMinCredentials)}
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
              name="minCredentialsCount"
              type="number"
              value={minCredentialsCount}
              onChange={(e) =>
                setMinCredentialsCount((e.target as HTMLInputElement).value)
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
              name="limitMaxCredentials"
              type="checkbox"
              options={['Maximum number of credentials required']}
              checked={limitMaxCredentials}
              onChange={() => setLimitMaxCredentials(!limitMaxCredentials)}
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
              name="maxCredentialsCount"
              type="number"
              value={maxCredentialsCount}
              onChange={(e) =>
                setMaxCredentialsCount((e.target as HTMLInputElement).value)
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
      </div>
    </div>
  )
}

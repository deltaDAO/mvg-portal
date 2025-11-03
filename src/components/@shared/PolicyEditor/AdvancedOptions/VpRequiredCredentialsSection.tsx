import React from 'react'
import styles from './Advanced.module.css'
import Tooltip from '@shared/atoms/Tooltip'
import Markdown from '@shared/Markdown'

export type VpCredentialEntry =
  | { id: string; credential_type: string }
  | { id: string; any_of: string[] }

interface Props {
  required: VpCredentialEntry[]
  onChange: (value: VpCredentialEntry[]) => void
  credentialOptions: { label: string; value: string }[]
}

// Simple unique ID generator
function genId() {
  return Math.random().toString(36).slice(2)
}

const VpRequiredCredentialsSection = ({
  required,
  onChange,
  credentialOptions
}: Props) => {
  const anyOfEnabled = required.some((e) => 'any_of' in e)

  // Compute all used credentials
  const usedInRequired = required
    .filter(
      (e): e is { id: string; credential_type: string } =>
        'credential_type' in e
    )
    .map((e) => e.credential_type)
  const usedInAnyOf = required
    .filter((e): e is { id: string; any_of: string[] } => 'any_of' in e)
    .flatMap((e) => e.any_of)
  const forbidden = new Set([...usedInRequired, ...usedInAnyOf])

  // Compute available options for each section
  const availableForRequired = credentialOptions
    .map((opt) => opt.value)
    .filter((val) => !forbidden.has(val))

  const anyOfEntry = required.find(
    (e): e is { id: string; any_of: string[] } => 'any_of' in e
  )
  const availableForAnyOf = credentialOptions
    .map((opt) => opt.value)
    .filter(
      (val) =>
        !usedInRequired.includes(val) &&
        !(anyOfEntry && anyOfEntry.any_of.includes(val))
    )

  function handleAddCredential() {
    const creds = required.filter(
      (e): e is { id: string; credential_type: string } =>
        'credential_type' in e
    )
    const anyOf = required.find(
      (e): e is { id: string; any_of: string[] } => 'any_of' in e
    )
    // Find first unused
    const usedRequired = creds.map((e) => e.credential_type)
    const usedAnyOf = required
      .filter((e): e is { id: string; any_of: string[] } => 'any_of' in e)
      .flatMap((e) => e.any_of)
    const forbidden = new Set([...usedRequired, ...usedAnyOf])
    const available = credentialOptions
      .map((opt) => opt.value)
      .filter((val) => !forbidden.has(val))
    if (available.length === 0) return
    const updated: VpCredentialEntry[] = [
      ...creds.map((e) => ({ id: e.id, credential_type: e.credential_type })),
      { id: genId(), credential_type: available[0] }
    ]
    if (anyOf) updated.push({ id: anyOf.id, any_of: [...anyOf.any_of] })
    onChange(updated)
  }

  function handleRemoveCredential(idx: number) {
    const creds = required.filter(
      (e): e is { id: string; credential_type: string } =>
        'credential_type' in e
    )
    const anyOf = required.find(
      (e): e is { id: string; any_of: string[] } => 'any_of' in e
    )
    const updated: VpCredentialEntry[] = creds
      .filter((_, i) => i !== idx)
      .map((e) => ({ id: e.id, credential_type: e.credential_type }))
    if (anyOf) updated.push({ id: anyOf.id, any_of: [...anyOf.any_of] })
    onChange(updated)
  }

  function handleCredentialTypeChange(idx: number, value: string) {
    const creds = required.filter(
      (e): e is { id: string; credential_type: string } =>
        'credential_type' in e
    )
    const anyOf = required.find(
      (e): e is { id: string; any_of: string[] } => 'any_of' in e
    )
    const updated: VpCredentialEntry[] = creds.map((entry, i) =>
      i === idx
        ? { id: entry.id, credential_type: value }
        : { id: entry.id, credential_type: entry.credential_type }
    )
    if (anyOf) updated.push({ id: anyOf.id, any_of: [...anyOf.any_of] })
    onChange(updated)
  }

  function handleToggleAnyOf(enabled: boolean) {
    const creds = required.filter(
      (e): e is { id: string; credential_type: string } =>
        'credential_type' in e
    )
    const updated: VpCredentialEntry[] = creds.map((e) => ({
      id: e.id,
      credential_type: e.credential_type
    }))
    // Only allow if there are any available
    if (
      enabled &&
      availableForAnyOf.length > 0 &&
      !required.find((e) => 'any_of' in e)
    ) {
      updated.push({ id: genId(), any_of: [availableForAnyOf[0]] })
    }
    onChange(updated)
  }

  function handleAddAnyOfCredential() {
    const idx = required.findIndex((e) => 'any_of' in e)
    if (idx === -1) return
    const entry = required[idx] as { id: string; any_of: string[] }
    const usedAnyOf = entry.any_of
    const usedRequired = required
      .filter(
        (e): e is { id: string; credential_type: string } =>
          'credential_type' in e
      )
      .map((e) => e.credential_type)
    const forbidden = new Set([...usedAnyOf, ...usedRequired])
    const available = credentialOptions
      .map((opt) => opt.value)
      .filter((val) => !forbidden.has(val))
    if (available.length === 0) return
    const updatedAnyOf = [...entry.any_of, available[0]]
    const updated = required.map((e, i) =>
      i === idx
        ? { id: entry.id, any_of: [...updatedAnyOf] }
        : 'credential_type' in e
        ? {
            id: (e as { id: string; credential_type: string }).id,
            credential_type: (e as { credential_type: string }).credential_type
          }
        : {
            id: (e as { id: string; any_of: string[] }).id,
            any_of: [...(e as { any_of: string[] }).any_of]
          }
    )
    onChange(updated)
  }

  function handleAnyOfCredentialChange(typeIdx: number, value: string) {
    const idx = required.findIndex((e) => 'any_of' in e)
    if (idx !== -1) {
      const entry = required[idx] as { id: string; any_of: string[] }
      const updatedAnyOf = entry.any_of.map((t, j) =>
        j === typeIdx ? value : t
      )
      const updated = required.map((e, i) =>
        i === idx
          ? { id: entry.id, any_of: [...updatedAnyOf] }
          : 'credential_type' in e
          ? {
              id: (e as { id: string; credential_type: string }).id,
              credential_type: (e as { credential_type: string })
                .credential_type
            }
          : {
              id: (e as { id: string; any_of: string[] }).id,
              any_of: [...(e as { any_of: string[] }).any_of]
            }
      )
      onChange(updated)
    }
  }

  function handleRemoveAnyOfCredential(typeIdx: number) {
    const idx = required.findIndex((e) => 'any_of' in e)
    if (idx !== -1) {
      const entry = required[idx] as { id: string; any_of: string[] }
      const updatedAnyOf = entry.any_of.filter((_, j) => j !== typeIdx)
      let newRequired = required.map((e, i) =>
        i === idx
          ? { id: entry.id, any_of: [...updatedAnyOf] }
          : 'credential_type' in e
          ? {
              id: (e as { id: string; credential_type: string }).id,
              credential_type: (e as { credential_type: string })
                .credential_type
            }
          : {
              id: (e as { id: string; any_of: string[] }).id,
              any_of: [...(e as { any_of: string[] }).any_of]
            }
      )
      if (updatedAnyOf.length === 0) {
        newRequired = newRequired.filter((_, i) => i !== idx)
      }
      onChange(newRequired)
    }
  }

  return (
    <div className={styles.requiredCredentialsSection}>
      <div className={styles.sectionLabel}>VP Required Credentials</div>
      {required
        .filter(
          (e): e is { id: string; credential_type: string } =>
            'credential_type' in e
        )
        .map((entry) => (
          <div key={entry.id} className={styles.vpCredentialRow}>
            <select
              className={styles.vpCredentialSelect}
              value={entry.credential_type}
              onChange={(e) =>
                handleCredentialTypeChange(
                  required.findIndex((el) => el.id === entry.id),
                  e.target.value
                )
              }
            >
              {credentialOptions
                .filter((opt) => {
                  const otherRequired = required
                    .filter(
                      (e): e is { id: string; credential_type: string } =>
                        'credential_type' in e
                    )
                    .map((e) => e.credential_type)
                    .filter((val) => val !== entry.credential_type)
                  const valuesInAnyOf = required
                    .filter(
                      (e): e is { id: string; any_of: string[] } =>
                        'any_of' in e
                    )
                    .flatMap((e) => e.any_of)
                  return (
                    !otherRequired.includes(opt.value) &&
                    !valuesInAnyOf.includes(opt.value)
                  )
                })
                .map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
            </select>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() =>
                handleRemoveCredential(
                  required.findIndex((el) => el.id === entry.id)
                )
              }
            >
              Delete
            </button>
          </div>
        ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={handleAddCredential}
        disabled={availableForRequired.length === 0}
      >
        Add new credential
      </button>
      <div className={styles.checkboxWithTooltip}>
        <label>
          <input
            type="checkbox"
            checked={anyOfEnabled}
            onChange={(e) => handleToggleAnyOf(e.target.checked)}
            disabled={availableForAnyOf.length === 0}
          />
          <span className={styles.checkboxLabel}>
            Add optional group (Any of)
          </span>
        </label>
        <Tooltip
          content={
            <Markdown text="When enabled, the presented credentials must match any of the types below." />
          }
        />
      </div>
      {anyOfEnabled && (
        <div className={styles.anyOfSection}>
          <span className={styles.anyOfLabel}>Any of:</span>
          {required
            .filter((e): e is { id: string; any_of: string[] } => 'any_of' in e)
            .map((entry) =>
              entry.any_of.map((type, idx) => (
                <div
                  key={entry.id + '-' + type}
                  className={styles.vpCredentialRow}
                >
                  <select
                    className={styles.vpCredentialSelect}
                    value={type}
                    onChange={(e) =>
                      handleAnyOfCredentialChange(idx, e.target.value)
                    }
                  >
                    {credentialOptions
                      .filter((opt) => {
                        const thisAnyOf = entry.any_of.filter(
                          (v, i) => i !== idx
                        )
                        const allRequired = required
                          .filter(
                            (e): e is { id: string; credential_type: string } =>
                              'credential_type' in e
                          )
                          .map((e) => e.credential_type)
                        return (
                          !thisAnyOf.includes(opt.value) &&
                          !allRequired.includes(opt.value)
                        )
                      })
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleRemoveAnyOfCredential(idx)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddAnyOfCredential}
            disabled={availableForAnyOf.length === 0}
          >
            Add new
          </button>
        </div>
      )}
    </div>
  )
}

export default VpRequiredCredentialsSection

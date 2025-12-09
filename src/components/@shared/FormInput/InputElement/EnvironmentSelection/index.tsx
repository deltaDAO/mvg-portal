import { ChangeEvent, useEffect, useState } from 'react'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import Loader from '@shared/atoms/Loader'
import { truncateDid } from '@utils/string'
import styles from './index.module.css'
import SearchSection from '@shared/SearchSection'
import StatusTag from '../../../atoms/StatusTag'
import Button from '../../../atoms/Button'

export interface EnvironmentSelectionEnvironment extends ComputeEnvironment {
  checked?: boolean
}

// Mock data for testing
const mockEnvironments: EnvironmentSelectionEnvironment[] = [
  {
    id: '0x1234567890abcdef1234567890abcdef12345678',
    description:
      'High-performance GPU environment for machine learning workloads',
    free: { resources: [] },
    fees: {},
    consumerAddress: '0x0000000000000000000000000000000000000000',
    runningJobs: 0
  },
  {
    id: '0xabcdef1234567890abcdef1234567890abcdef12',
    description: 'CPU-optimized environment for data processing tasks',
    free: null,
    fees: {},
    consumerAddress: '0x0000000000000000000000000000000000000000',
    runningJobs: 0
  },
  {
    id: '0x9876543210fedcba9876543210fedcba98765432',
    description: 'Memory-intensive environment for large dataset operations',
    free: { resources: [] },
    fees: {},
    consumerAddress: '0x0000000000000000000000000000000000000000',
    runningJobs: 0
  },
  {
    id: '0xfedcba0987654321fedcba0987654321fedcba09',
    description: 'Multi-GPU cluster for distributed computing',
    free: null,
    fees: {},
    consumerAddress: '0x0000000000000000000000000000000000000000',
    runningJobs: 0
  },
  {
    id: '0x5555555555555555555555555555555555555555',
    description: 'Development environment for testing and debugging',
    free: { resources: [] },
    fees: {},
    consumerAddress: '0x0000000000000000000000000000000000000000',
    runningJobs: 0
  }
]

export function Empty({ message }: { message: string }) {
  return <div className={styles.empty}>{message}</div>
}

export default function EnvironmentSelection({
  environments,
  selected,
  disabled,
  onChange
}: {
  environments: EnvironmentSelectionEnvironment[]
  selected?: string
  disabled?: boolean
  onChange?:
    | ((value: string) => void)
    | ((e: ChangeEvent<HTMLInputElement>) => void)
}): JSX.Element {
  const [searchValue, setSearchValue] = useState('')
  const [filteredEnvironments, setFilteredEnvironments] = useState<
    EnvironmentSelectionEnvironment[]
  >([])

  useEffect(() => {
    // Combine real environments with mock data
    const realEnvs =
      environments && Array.isArray(environments) ? environments : []
    const allEnvironments = [...realEnvs]

    if (!allEnvironments || allEnvironments.length === 0) {
      setFilteredEnvironments([])
      return
    }

    const result = allEnvironments.filter((env) =>
      searchValue !== ''
        ? env.id.toLowerCase().includes(searchValue.toLowerCase()) ||
          (env.description &&
            env.description.toLowerCase().includes(searchValue.toLowerCase()))
        : true
    )

    setFilteredEnvironments(result)
  }, [environments, searchValue])

  const handleEnvironmentSelect = (envId: string) => {
    if (onChange) {
      if (typeof onChange === 'function') {
        const firstParam = onChange.toString().includes('target')
          ? ({ target: { value: envId } } as ChangeEvent<HTMLInputElement>)
          : envId
        onChange(firstParam as any)
      }
    }
  }

  return (
    <div className={styles.root}>
      <SearchSection
        placeholder="Search for C2D Environments"
        value={searchValue}
        onChange={setSearchValue}
        disabled={disabled}
      />
      <div className={styles.scroll}>
        {!filteredEnvironments ? (
          <Loader />
        ) : filteredEnvironments && !filteredEnvironments.length ? (
          <Empty message="No environments found." />
        ) : (
          <>
            {filteredEnvironments.map(
              (env: EnvironmentSelectionEnvironment, index: number) => {
                const isSelected = selected === env.id
                const freeAvailable = !!env.free
                const hasPaid = env.fees && Object.keys(env.fees).length > 0

                return (
                  <div
                    key={env.id}
                    className={`${styles.environmentCard} ${
                      isSelected ? styles.selected : ''
                    }`}
                    onClick={() => !disabled && handleEnvironmentSelect(env.id)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.titleSection}>
                        <h3 className={styles.title}>
                          Environment {index + 1}
                        </h3>
                        <div className={styles.envId}>
                          {truncateDid(env.id)}
                        </div>
                      </div>
                      <div className={styles.statusTags}>
                        {freeAvailable && (
                          <StatusTag type="free">Free</StatusTag>
                        )}
                        {hasPaid && <StatusTag type="paid">Paid</StatusTag>}
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <p className={styles.description}>
                        {env.description ||
                          'Workspace configured for testing and running C2D processes.'}
                      </p>

                      <div className={styles.cardActions}>
                        {isSelected ? (
                          <Button style="slim">Selected</Button>
                        ) : (
                          <Button style="slim">Select</Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }
            )}
          </>
        )}
      </div>
    </div>
  )
}

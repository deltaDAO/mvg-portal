import React from 'react'
import styles from './ComputeEnvDetails.module.css'
import CPU from '@images/cpu.svg'
import GPU from '@images/gpu.svg'

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.row}>
      <span className={styles.value}>{value}</span>
      {` ${label}`}
    </div>
  )
}

export default function ComputeEnvDetails({
  computeEnv
}: {
  computeEnv: ComputeEnvironmentExtended
}) {
  const {
    id,
    desc,
    cpuNumber,
    cpuType,
    gpuNumber,
    gpuType,
    ramGB,
    diskGB,
    currentJobs,
    maxJobs
  } = computeEnv
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h4 className={styles.title}>{id}</h4>
          {desc && <p className={styles.description}>{desc}</p>}
        </div>
        {gpuNumber > 0 ? <GPU /> : <CPU />}
      </div>

      <div className={styles.clusterDetails}>
        <p className={styles.title}>{`${
          gpuNumber > 0 ? 'GPU' : 'CPU'
        } Cluster`}</p>
        <p>
          {gpuNumber > 0 && gpuType
            ? gpuType
            : cpuNumber > 0 && cpuType
            ? cpuType
            : 'type: N/A'}
        </p>
      </div>
      <div className={styles.details}>
        <Row
          label="cores"
          value={`${gpuNumber > 0 ? gpuNumber || 'N/A' : cpuNumber || 'N/A'}`}
        />
        <Row label="RAM" value={`${ramGB || 'N/A'}${ramGB && 'GB'}`} />
        <Row label="Storage" value={`${diskGB || 'N/A'}${diskGB && 'GB'}`} />
      </div>
      <div className={styles.footer}>
        <Row label="running jobs" value={`${currentJobs}/${maxJobs}`} />
      </div>
    </div>
  )
}

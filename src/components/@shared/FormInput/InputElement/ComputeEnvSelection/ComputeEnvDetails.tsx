import React from 'react'
import styles from './ComputeEnvDetails.module.css'

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.row}>
      {`${label}: `}
      <span className={styles.value}>{value}</span>
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
        <h4 className={styles.title}>{id}</h4>
        {desc && <p className={styles.description}>{desc}</p>}
      </div>
      {cpuNumber > 0 && (
        <>
          <Row label="CPU Type" value={cpuType || 'N/A'} />
          <Row label="CPU Cores" value={cpuNumber} />
        </>
      )}
      {gpuNumber > 0 && (
        <>
          <Row label="GPU Type" value={gpuType || 'N/A'} />
          <Row label="GPU Cores" value={gpuNumber} />
        </>
      )}
      <Row label="RAM" value={`${ramGB || 'N/A'}${ramGB && 'GB'}`} />
      <Row label="Storage" value={`${diskGB || 'N/A'}${diskGB && 'GB'}`} />
      <Row
        label="Current usage (active jobs / max jobs)"
        value={`${currentJobs} / ${maxJobs}`}
      />
    </div>
  )
}

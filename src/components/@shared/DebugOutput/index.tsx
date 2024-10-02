import { ReactElement } from 'react'
import DDODownloadButton from '../DDODownloadButton'

export default function DebugOutput({
  title,
  output
}: {
  title?: string
  output: any
}): ReactElement {
  return (
    <div style={{ marginTop: 'var(--spacer)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        {title && <h5>{title}</h5>}
        {output && <DDODownloadButton asset={output} />}
      </div>
      <pre style={{ wordWrap: 'break-word' }}>
        <code>{JSON.stringify(output, null, 2)}</code>
      </pre>
    </div>
  )
}

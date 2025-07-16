import testRender from '../../../../../.jest/testRender'
import Alert from '@shared/atoms/Alert'
import { render } from '@testing-library/react'

describe('Alert', () => {
  testRender(
    <Alert
      title="Alert Title"
      text="Alert text"
      state="info"
      badge="Hello"
      action={{
        name: 'Hello action',
        style: 'text',
        handleAction: () => null
      }}
      onDismiss={() => null}
    />
  )

  it('renders without action style', () => {
    render(
      <Alert
        text="Alert text"
        state="info"
        action={{
          name: 'Hello action',
          handleAction: () => null
        }}
      />
    )
  })

  it('renders InfoBox style with title, subtitle, and description', () => {
    render(
      <Alert
        title="Info Title"
        subtitle="Info Subtitle"
        description="Info description"
        state="info"
      />
    )
  })

  it('renders InfoBox style with children', () => {
    render(
      <Alert title="Container Title">
        <div>Custom content</div>
      </Alert>
    )
  })

  it('renders InfoBox style with warning prop', () => {
    render(
      <Alert title="Warning Title" subtitle="Warning Subtitle" warning={true} />
    )
  })

  it('renders with only children (InfoBox style)', () => {
    render(
      <Alert state="warning">
        <div>Only children content</div>
      </Alert>
    )
  })

  it('renders traditional Alert style (no subtitle/description)', () => {
    render(
      <Alert
        title="Traditional Alert"
        text="Traditional alert text"
        state="error"
      />
    )
  })

  it('handles default state when not provided', () => {
    render(
      <Alert title="Default State Alert">
        <div>Default state content</div>
      </Alert>
    )
  })
})

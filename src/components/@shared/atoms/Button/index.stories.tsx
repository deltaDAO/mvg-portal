import { ReactElement } from 'react'
import Button from './index'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Button',
  component: Button
}

export function Primary(): ReactElement {
  return <Button style="primary">Primary Button</Button>
}

export function Secondary(): ReactElement {
  return <Button style="secondary">Secondary Button</Button>
}

export function Outline(): ReactElement {
  return <Button style="outline">Outline Button</Button>
}

export function Ghost(): ReactElement {
  return <Button style="ghost">Ghost Button</Button>
}

export function Text(): ReactElement {
  return <Button style="text">Text Button</Button>
}

export function Small(): ReactElement {
  return (
    <Button style="primary" size="small">
      Small Button
    </Button>
  )
}

export function SmallSize(): ReactElement {
  return (
    <Button style="primary" size="sm">
      SM Button
    </Button>
  )
}

export function MediumSize(): ReactElement {
  return (
    <Button style="primary" size="md">
      MD Button
    </Button>
  )
}

export function LargeSize(): ReactElement {
  return (
    <Button style="primary" size="lg">
      LG Button
    </Button>
  )
}

export function Link(): ReactElement {
  return <Button href="https://example.com">External Link</Button>
}

export function InternalLink(): ReactElement {
  return <Button to="/about">Internal Link</Button>
}

export function WithArrow(): ReactElement {
  return (
    <Button to="/about" arrow>
      Internal Link with Arrow
    </Button>
  )
}

export function Disabled(): ReactElement {
  return (
    <Button style="primary" disabled>
      Disabled Button
    </Button>
  )
}

export function AllStyles(): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <h3>Button Styles</h3>
      <div className="flex gap-4 flex-wrap">
        <Button style="primary">Primary</Button>
        <Button style="secondary">Secondary</Button>
        <Button style="outline">Outline</Button>
        <Button style="ghost">Ghost</Button>
        <Button style="text">Text</Button>
      </div>

      <h3 className="mt-8">Button Sizes</h3>
      <div className="flex gap-4 flex-wrap items-center">
        <Button style="primary" size="sm">
          Small (sm)
        </Button>
        <Button style="primary" size="md">
          Medium (md)
        </Button>
        <Button style="primary" size="lg">
          Large (lg)
        </Button>
        <Button style="primary" size="small">
          Small (legacy)
        </Button>
      </div>

      <h3 className="mt-8">Secondary Button Sizes</h3>
      <div className="flex gap-4 flex-wrap items-center">
        <Button style="secondary" size="sm">
          Small (sm)
        </Button>
        <Button style="secondary" size="md">
          Medium (md)
        </Button>
        <Button style="secondary" size="lg">
          Large (lg)
        </Button>
      </div>

      <h3 className="mt-8">Outline Button Sizes</h3>
      <div className="flex gap-4 flex-wrap items-center">
        <Button style="outline" size="sm">
          Small (sm)
        </Button>
        <Button style="outline" size="md">
          Medium (md)
        </Button>
        <Button style="outline" size="lg">
          Large (lg)
        </Button>
      </div>
    </div>
  )
}

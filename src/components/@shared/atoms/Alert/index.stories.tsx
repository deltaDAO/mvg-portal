import { ComponentStory, ComponentMeta } from '@storybook/react'

import Alert, { AlertProps } from '@shared/atoms/Alert'

export default {
  title: 'Component/@shared/atoms/Alert',
  component: Alert
} as ComponentMeta<typeof Alert>

const Template: ComponentStory<typeof Alert> = (args) => <Alert {...args} />

interface Props {
  args: AlertProps
}

export const Default: Props = Template.bind({})
Default.args = {
  text: 'Alert text',
  state: 'info',
  onDismiss: () => console.log('Alert closed!')
}

export const Full: Props = Template.bind({})
Full.args = {
  title: 'Alert',
  text: 'Alert text',
  state: 'info',
  action: {
    name: 'Action',
    handleAction: () => null
  },
  badge: 'Hello',
  onDismiss: () => {
    console.log('Alert closed!')
  }
}

export const InfoBoxStyle: Props = Template.bind({})
InfoBoxStyle.args = {
  title: 'Information Title',
  subtitle: 'Subtitle',
  description:
    'This is a description that provides more context about the information being displayed.',
  state: 'info'
}

export const InfoBoxWithChildren: Props = Template.bind({})
InfoBoxWithChildren.args = {
  title: 'Container Title',
  subtitle: 'Container Subtitle',
  children: <div>This is custom content inside the InfoBox-style alert</div>
}

export const InfoBoxWarning: Props = Template.bind({})
InfoBoxWarning.args = {
  title: 'Warning Information',
  subtitle: 'Important Notice',
  description: 'This is a warning message with additional details.',
  warning: true
}

export const InfoBoxWithChildrenOnly: Props = Template.bind({})
InfoBoxWithChildrenOnly.args = {
  children: (
    <div>This is an InfoBox-style alert with only children content</div>
  ),
  state: 'warning'
}

export const AllStates: Props = Template.bind({})
AllStates.args = {
  children: (
    <div>
      <Alert text="This is an error message" state="error" />
      <br />
      <Alert text="This is a warning message" state="warning" />
      <br />
      <Alert text="This is an info message" state="info" />
      <br />
      <Alert text="This is a success message" state="success" />
    </div>
  )
}

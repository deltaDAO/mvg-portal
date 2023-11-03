import { ComponentStory, ComponentMeta } from '@storybook/react'

import OceanLogo, { LogoProps } from '@shared/atoms/OceanLogo'

export default {
  title: 'Component/@shared/atoms/Logo',
  component: OceanLogo
} as ComponentMeta<typeof OceanLogo>

const Template: ComponentStory<typeof OceanLogo> = (args) => (
  <OceanLogo {...args} />
)

interface Props {
  args: LogoProps
}

export const Default: Props = Template.bind({})
Default.args = {}

export const WithoutWordmark: Props = Template.bind({})
WithoutWordmark.args = {
  noWordmark: true
}

import testRender from '../../../../../.jest/testRender'
import OceanLogo from '@shared/atoms/OceanLogo'
import { Default, WithoutWordmark } from './index.stories'
import { render } from '@testing-library/react'

describe('OceanLogo', () => {
  testRender(<OceanLogo {...Default.args} />)

  it('renders without wordmark', () => {
    render(<OceanLogo {...WithoutWordmark.args} />)
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { Default, WithRadio } from './index.stories'

describe('Tabs', () => {
  test('should fire custom change handler', async () => {
    const handler = jest.fn()
    render(<Default {...Default.args} handleTabChange={handler} />)

    fireEvent.click(screen.getByText('Second tab'))
    expect(handler).toBeCalledTimes(1)
  })

  test('renders WithRadio', () => {
    render(<Default {...WithRadio.args} />)
  })
})

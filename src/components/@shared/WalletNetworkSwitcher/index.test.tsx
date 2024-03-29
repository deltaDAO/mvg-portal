import { render, fireEvent, screen } from '@testing-library/react'
import WalletNetworkSwitcher from './'

jest.mock('../../../@utils/wallet', () => ({
  addCustomNetwork: () => jest.fn()
}))

describe('@shared/WalletNetworkSwitcher', () => {
  it('renders without crashing', () => {
    render(<WalletNetworkSwitcher />)
  })

  it('switching networks can be invoked', () => {
    render(<WalletNetworkSwitcher />)
    fireEvent.click(screen.getByRole('button'))
  })
})

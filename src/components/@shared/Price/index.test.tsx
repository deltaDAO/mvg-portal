import { render, screen } from '@testing-library/react'
import Price from './index'
import { asset } from '../../../../.jest/__fixtures__/datasetWithAccessDetails'

describe('@shared/Price', () => {
  it('renders fixed price', () => {
    render(
      <Price
        price={{ value: 10, tokenSymbol: 'OCEAN', tokenAddress: '0x123' }}
      />
    )
    expect(screen.getByText('10')).toBeInTheDocument()
  })
  it('renders free price', () => {
    render(<Price price={{ value: 0 }} />)
    expect(screen.getByText('Free')).toBeInTheDocument()
  })
  it('renders null price', () => {
    render(<Price price={{ value: null }} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})

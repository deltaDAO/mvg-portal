import { render, screen } from '@testing-library/react'
import React from 'react'
import Price from './index'
import { asset } from '../../../../.jest/__fixtures__/datasetWithAccessDetails'

describe('@shared/Price', () => {
  it('renders fixed price', () => {
    render(
      <Price
        accessDetails={{ ...asset.accessDetails, type: 'fixed', price: '10' }}
      />
    )
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders free price', () => {
    render(<Price accessDetails={{ ...asset.accessDetails, type: 'free' }} />)
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('renders null price', () => {
    render(<Price accessDetails={{ ...asset.accessDetails, price: null }} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})

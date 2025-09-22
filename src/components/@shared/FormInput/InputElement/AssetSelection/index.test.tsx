import AssetSelection, { AssetSelectionAsset } from './'
import { fireEvent, render, screen } from '@testing-library/react'

describe('@shared/FormInput/InputElement/AssetSelection', () => {
  const assets: AssetSelectionAsset[] = [
    {
      serviceId:
        'a3f67e94fc3695d35f335e4ef9f65052b77dc2b6a405b4c44f30d1f5064a7060',
      serviceName: 'serviceName',
      did: 'did:ope:xxx',
      name: 'Asset',
      price: 10,
      tokenSymbol: 'OCEAN',
      checked: false,
      symbol: 'OCEAN',
      isAccountIdWhitelisted: true
    },
    {
      serviceId:
        'a3f67e94fc3695d35f335e4ef9f65052b77dc2b6a405b4c44f30d1f5064a7060',
      serviceName: 'serviceName2',
      did: 'did:ope:yyy',
      name: 'Asset',
      price: 10,
      tokenSymbol: 'OCEAN',
      checked: true,
      symbol: 'OCEAN',
      isAccountIdWhitelisted: true
    },
    {
      serviceId:
        'a3f67e94fc3695d35f335e4ef9f65052b77dc2b6a405b4c44f30d1f5064a7060',
      serviceName: 'serviceName3',
      did: 'did:ope:zzz',
      name: 'Asset',
      price: 0,
      tokenSymbol: 'OCEAN',
      checked: false,
      symbol: 'OCEAN',
      isAccountIdWhitelisted: true
    }
  ]

  it('renders without crashing', () => {
    render(<AssetSelection assets={assets} />)
    const searchInput = screen.getByPlaceholderText(
      'Search by title, datatoken, or DID...'
    )
    fireEvent.change(searchInput, { target: { value: 'Assets' } })
    fireEvent.change(searchInput, { target: { value: '' } })
  })

  it('renders empty assetSelection', () => {
    render(<AssetSelection assets={[]} />)
    expect(screen.getByText('No assets found.')).toBeInTheDocument()
  })

  it('renders disabled assetSelection', () => {
    render(<AssetSelection assets={[]} disabled />)
    expect(screen.getByText('No assets found.')).toBeInTheDocument()
  })

  it('renders assetSelectionMultiple', () => {
    render(<AssetSelection assets={assets} multiple />)
  })
})

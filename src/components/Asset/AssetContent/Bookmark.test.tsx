import { render, screen } from '@testing-library/react'
import Bookmark from './Bookmark'
import { datasetAquarius } from '../../../../.jest/__fixtures__/datasetAquarius'

describe('src/components/Asset/AssetContent/Bookmark.tsx', () => {
  it('renders Add Bookmark button', () => {
    render(<Bookmark did={datasetAquarius.id} />)
    expect(screen.getByTitle('Add Bookmark')).toBeInTheDocument()
  })
})

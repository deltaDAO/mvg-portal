import testRender from '../../../../.jest/testRender'
import { FileInfo } from '@oceanprotocol/lib'
import { render } from '@testing-library/react'
import FileIcon from './index'

describe('@shared/FileIcon', () => {
  const file: FileInfo = {
    type: 'url',
    contentType: 'text/plain',
    contentLength: '123'
  }

  testRender(<FileIcon file={file} isAccountWhitelisted />)

  it('renders small', () => {
    render(<FileIcon file={file} isAccountWhitelisted small />)
  })

  it('renders loading', () => {
    render(<FileIcon file={file} isAccountWhitelisted isLoading />)
  })

  it('renders empty', () => {
    const file: FileInfo = { type: 'url' }
    render(<FileIcon file={file} isAccountWhitelisted />)
  })

  it('renders with 0 contentLength', () => {
    const file: FileInfo = {
      type: 'url',
      contentType: 'text/plain',
      contentLength: '0'
    }
    render(<FileIcon file={file} isAccountWhitelisted />)
  })
})

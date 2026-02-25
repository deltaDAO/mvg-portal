import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginModal from './index'
import { useModal } from 'connectkit'
import { useWalletImport } from '@hooks/useWalletImport'
import { useWalletDecrypt } from '@hooks/useWalletDecrypt'
import { useAutomation } from '@context/Automation/AutomationProvider'

jest.mock('@hooks/useWalletImport')
jest.mock('@hooks/useWalletDecrypt')
jest.mock('@context/Automation/AutomationProvider')

describe('@shared/LoginModal', () => {
  const mockSetOpen = jest.fn()
  const mockImportFromFile = jest.fn()
  const mockDecrypt = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useModal as jest.Mock).mockReturnValue({ setOpen: mockSetOpen })
    ;(useWalletImport as jest.Mock).mockReturnValue({
      importFromFile: mockImportFromFile
    })
    ;(useWalletDecrypt as jest.Mock).mockReturnValue({
      decrypt: mockDecrypt,
      isLoading: false
    })
    ;(useAutomation as jest.Mock).mockReturnValue({
      hasValidEncryptedWallet: false,
      autoWalletAddress: undefined
    })
  })

  it('renders method selection view when opened with no stored wallet', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Choose Login Method')).toBeInTheDocument()
    expect(screen.getByText('Import Wallet JSON')).toBeInTheDocument()
    expect(screen.getByText('Connect with MetaMask')).toBeInTheDocument()
  })

  it('renders password view when opened with stored wallet', () => {
    ;(useAutomation as jest.Mock).mockReturnValue({
      hasValidEncryptedWallet: true,
      autoWalletAddress: '0x1234567890abcdef1234567890abcdef12345678'
    })

    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Decrypt Wallet')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('displays truncated wallet address when stored wallet exists', () => {
    ;(useAutomation as jest.Mock).mockReturnValue({
      hasValidEncryptedWallet: true,
      autoWalletAddress: '0x1234567890abcdef1234567890abcdef12345678'
    })

    render(<LoginModal isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText(/0x1234…5678/)).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<LoginModal isOpen={false} onClose={mockOnClose} />)
    expect(screen.queryByText('Choose Login Method')).not.toBeInTheDocument()
  })

  it('resets view state when opening and closing (no stored wallet)', async () => {
    const { rerender } = render(
      <LoginModal isOpen={true} onClose={mockOnClose} />
    )

    // Click JSON wallet option to advance to file upload view
    const jsonButton = screen.getByText('Import Wallet JSON')
    fireEvent.click(jsonButton)

    expect(screen.getByText('Import Wallet')).toBeInTheDocument()

    // Close modal by calling onClose handler
    fireEvent.click(screen.getByTestId('closeModal'))

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })

    // Reopen modal with reset state
    rerender(<LoginModal isOpen={false} onClose={mockOnClose} />)
    rerender(<LoginModal isOpen={true} onClose={jest.fn()} />)

    // Should be back to method selection
    expect(screen.getByText('Choose Login Method')).toBeInTheDocument()
  })

  it('advances to file upload view when JSON import is selected', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)

    const jsonButton = screen.getByText('Import Wallet JSON')
    fireEvent.click(jsonButton)

    expect(screen.getByText('Import Wallet')).toBeInTheDocument()
    expect(screen.getByLabelText('Select file to import')).toBeInTheDocument()
  })

  it('calls setOpen(true) when MetaMask option is clicked', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)

    const metaMaskButton = screen.getByText('Connect with MetaMask')
    fireEvent.click(metaMaskButton)

    expect(mockSetOpen).toHaveBeenCalledWith(true)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('advances to password view after successful file import', async () => {
    mockImportFromFile.mockImplementation(async (target, onSuccess) => {
      onSuccess()
    })

    render(<LoginModal isOpen={true} onClose={mockOnClose} />)

    // Navigate to file upload
    const jsonButton = screen.getByText('Import Wallet JSON')
    fireEvent.click(jsonButton)

    // Simulate file selection
    const fileInput = screen.getByLabelText('Select file to import')
    const mockFile = new File(['{}'], 'wallet.json', {
      type: 'application/json'
    })

    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    await waitFor(() => {
      expect(mockImportFromFile).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Decrypt Wallet')).toBeInTheDocument()
    })
  })

  it('closes modal after successful decrypt', async () => {
    ;(useAutomation as jest.Mock).mockReturnValue({
      hasValidEncryptedWallet: true,
      autoWalletAddress: '0x1234567890abcdef1234567890abcdef12345678'
    })
    mockDecrypt.mockResolvedValue(true)

    render(<LoginModal isOpen={true} onClose={mockOnClose} />)

    // Should start on password view since wallet is stored
    expect(screen.getByText('Decrypt Wallet')).toBeInTheDocument()

    // Enter password and decrypt
    const passwordInput = screen.getByPlaceholderText('Password')
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })

    const decryptButton = screen.getByText('Decrypt')
    fireEvent.click(decryptButton)

    await waitFor(() => {
      expect(mockDecrypt).toHaveBeenCalledWith('testpassword')
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('allows navigation back from file upload to method selection', () => {
    render(<LoginModal isOpen={true} onClose={mockOnClose} />)

    // Navigate to file upload
    const jsonButton = screen.getByText('Import Wallet JSON')
    fireEvent.click(jsonButton)

    expect(screen.getByText('Import Wallet')).toBeInTheDocument()

    // Click back button
    const backButtons = screen.getAllByText('Back')
    fireEvent.click(backButtons[0])

    // Should be back to method selection
    expect(screen.getByText('Choose Login Method')).toBeInTheDocument()
  })

  it('allows navigation to method selection from stored wallet password view', () => {
    ;(useAutomation as jest.Mock).mockReturnValue({
      hasValidEncryptedWallet: true,
      autoWalletAddress: '0x1234567890abcdef1234567890abcdef12345678'
    })

    render(<LoginModal isOpen={true} onClose={mockOnClose} />)

    // Should start on password view
    expect(screen.getByText('Decrypt Wallet')).toBeInTheDocument()

    // Click "Use different login method"
    const switchButton = screen.getByText('Use different login method')
    fireEvent.click(switchButton)

    // Should be on method selection
    expect(screen.getByText('Choose Login Method')).toBeInTheDocument()
  })
})

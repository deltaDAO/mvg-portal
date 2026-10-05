import { act, fireEvent, render, screen } from '@testing-library/react'
import ReactModal from 'react-modal'
import DeprecationNotice from './'
import content from '../../../../content/deprecation.json'

let mockEnabled = true
jest.mock('../../../../content/deprecation.json', () => ({
  ...jest.requireActual('../../../../content/deprecation.json'),
  get enabled() {
    return mockEnabled
  }
}))

const MINUTE = 60 * 1000
const reminderIntervalMs = content.reminderIntervalMinutes * MINUTE

function isModalOpen(): boolean {
  return screen.queryByText(content.modal.confirm) !== null
}

function acknowledge(): void {
  fireEvent.click(screen.getByText(content.modal.confirm))
}

function advance(ms: number): void {
  act(() => {
    jest.advanceTimersByTime(ms)
  })
}

describe('@shared/DeprecationNotice', () => {
  beforeAll(() => {
    ReactModal.setAppElement(document.createElement('div'))
  })

  beforeEach(() => {
    jest.useFakeTimers()
    window.localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    mockEnabled = true
  })

  it('shows the banner and opens the modal on first visit', () => {
    render(<DeprecationNotice />)

    expect(
      screen.getByRole('region', { name: content.modal.title })
    ).toBeInTheDocument()
    expect(isModalOpen()).toBe(true)
  })

  it('stays closed after acknowledging until the interval has passed', () => {
    render(<DeprecationNotice />)
    acknowledge()
    expect(isModalOpen()).toBe(false)

    advance(reminderIntervalMs - MINUTE)
    expect(isModalOpen()).toBe(false)

    advance(MINUTE)
    expect(isModalOpen()).toBe(true)
  })

  it('does not reopen on a new mount within the interval', () => {
    const { unmount } = render(<DeprecationNotice />)
    acknowledge()
    unmount()

    render(<DeprecationNotice />)
    expect(isModalOpen()).toBe(false)
  })

  it('keeps the acknowledgement when storage is unavailable', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    render(<DeprecationNotice />)
    acknowledge()

    advance(reminderIntervalMs - MINUTE)
    expect(isModalOpen()).toBe(false)

    advance(MINUTE)
    expect(isModalOpen()).toBe(true)
  })

  it('reopens the modal from the banner action', () => {
    render(<DeprecationNotice />)
    acknowledge()

    fireEvent.click(screen.getByText(content.banner.action))
    expect(isModalOpen()).toBe(true)
  })

  it('renders nothing when disabled', () => {
    mockEnabled = false
    const { container } = render(<DeprecationNotice />)

    expect(container).toBeEmptyDOMElement()
    expect(isModalOpen()).toBe(false)
  })
})

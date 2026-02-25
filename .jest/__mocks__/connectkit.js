export function getDefaultClient() {
  return jest.fn()
}

export const useModal = jest.fn(() => ({
  setOpen: jest.fn()
}))

import { Consent, ConsentDirection, PossibleRequests } from './types'

export function extractDidFromUrl(url: string): string | null {
  const match = url.match(/did:[^/]+/)
  return match ? match[0] : null
}

export function parsePossibleRequest(
  keys: string[],
  isAccepted: boolean = true
): PossibleRequests {
  const res: PossibleRequests = {} as PossibleRequests
  console.log('Parsing possible request', keys, isAccepted)

  if (!isAccepted) {
    return {}
  } else {
    for (const entry of keys) {
      res[entry[0]] = entry[1] ? '1' : '0'
    }
  }
  return res
}

type FormExtractOptions = {
  reasonField: string
  isAccepted?: boolean
  excludeFields?: string[]
}

export function extractFormDetails(
  _formData: EventTarget,
  options: FormExtractOptions
) {
  const formData = new FormData(_formData as HTMLFormElement)

  const {
    reasonField,
    isAccepted = true,
    excludeFields = ['algorithm']
  } = options

  const reason = formData.get(reasonField)?.toString()

  // Remove specified fields
  formData.delete(reasonField)
  for (const field of excludeFields) {
    formData.delete(field)
  }

  const request = parsePossibleRequest(Object.keys(formData), isAccepted)

  return { reason, request }
}

const isDirection = (consent: Consent, direction: ConsentDirection) =>
  consent.direction === direction

export const isIncoming = (consent: Consent) => isDirection(consent, 'Incoming')

export const isOutgoing = (consent: Consent) => isDirection(consent, 'Outgoing')

export const isPending = (consent: Consent) => consent.status === 'Pending'

export const cleanRequests = (requests: PossibleRequests): PossibleRequests =>
  Object.fromEntries(Object.entries(requests).filter(([, value]) => value))

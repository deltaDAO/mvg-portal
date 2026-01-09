import { getRuntimeConfig } from './runtimeConfig'

export interface CredentialStatus {
  isValid: boolean
  expiresAt?: number
  timeRemaining?: number
  needsRefresh: boolean
}

const runtimeConfig = getRuntimeConfig()
const CREDENTIAL_VALIDITY_DURATION =
  Number(runtimeConfig.NEXT_PUBLIC_CREDENTIAL_VALIDITY_DURATION) ||
  5 * 60 * 1000

export function createCredentialStatus(
  isValid: boolean,
  timestamp?: number
): CredentialStatus {
  if (!isValid) {
    return {
      isValid: false,
      needsRefresh: true
    }
  }

  const expiresAt = timestamp
    ? timestamp + CREDENTIAL_VALIDITY_DURATION
    : Date.now() + CREDENTIAL_VALIDITY_DURATION
  const timeRemaining = expiresAt - Date.now()

  return {
    isValid: timeRemaining > 0,
    expiresAt,
    timeRemaining: Math.max(0, timeRemaining),
    needsRefresh: timeRemaining <= 0
  }
}

export function checkCredentialExpiration(expiresAt: number): CredentialStatus {
  const now = Date.now()
  const timeRemaining = expiresAt - now

  return {
    isValid: timeRemaining > 0,
    expiresAt,
    timeRemaining: Math.max(0, timeRemaining),
    needsRefresh: timeRemaining <= 0
  }
}

export function getTimeRemainingText(timeRemaining: number): string {
  if (timeRemaining <= 0) {
    return 'Credentials expired'
  }

  const minutes = Math.floor(timeRemaining / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  if (minutes > 0) {
    return `Credentials valid for ${minutes}m ${seconds}s`
  } else {
    return `Credentials valid for ${seconds}s`
  }
}

export function shouldShowExpirationWarning(timeRemaining: number): boolean {
  return timeRemaining <= 60 * 1000 && timeRemaining > 0
}

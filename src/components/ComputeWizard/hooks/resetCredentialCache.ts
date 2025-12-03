export function resetCredentialCache(
  ssiWalletCache: { clearCredentials: () => void },
  setCachedCredentials: (value: any) => void,
  clearVerifierSessionCache: () => void
) {
  ssiWalletCache.clearCredentials()
  setCachedCredentials(undefined as any)
  clearVerifierSessionCache()
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('credential_')) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // no-op
  }
}

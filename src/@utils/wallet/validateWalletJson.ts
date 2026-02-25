export function isValidEncryptedWalletJson(content: string): boolean {
  try {
    const json = JSON.parse(content)
    return (
      json?.address &&
      json?.id &&
      json?.version &&
      (json?.crypto || json?.Crypto)
    )
  } catch {
    return false
  }
}

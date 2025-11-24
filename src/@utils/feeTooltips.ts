export const feeTooltipText = {
  marketplace: 'Marketplace operator fee for asset consumption',
  provider: 'Ocean Node operator fee for asset consumption',
  oec: 'Fee for Ocean Enterprise Collective e.V. to maintain and develop the code'
}

export function getFeeTooltip(label?: string): string | undefined {
  if (!label) return undefined

  const normalized = label.toLowerCase()

  if (normalized.includes('oec fee')) return feeTooltipText.oec
  if (normalized.includes('provider fee')) return feeTooltipText.provider
  if (normalized.includes('market') && normalized.includes('fee'))
    return feeTooltipText.marketplace

  return undefined
}

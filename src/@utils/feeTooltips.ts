export const feeTooltipText = {
  marketplace: 'For marketplace operation & maintenance',
  provider: 'For Ocean Node operator(s)',
  oec: 'For Ocean Enterprise Collective e.V. maintaining and developing the OE basecode'
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

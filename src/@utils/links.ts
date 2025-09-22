export function convertLinks(link: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  link?.forEach((url, index) => {
    result[`link_${index + 1}`] = url
  })
  return result
}

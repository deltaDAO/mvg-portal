export function isValidJSON(json: string): boolean {
  try {
    JSON.parse(json)
    return true
  } catch (e) {
    return false
  }
}

export function downloadJSON(json: string, filename: string): void {
  if (isValidJSON(json)) {
    const element = document.createElement('a')
    const file = new Blob([json], {
      type: 'application/json'
    })
    element.href = URL.createObjectURL(file)
    element.download = `${filename}.json`
    document.body.appendChild(element)
    element.click()
  }
}

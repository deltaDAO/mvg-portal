export function isValidJSON(json: string): boolean {
  try {
    JSON.parse(json)
    return true
  } catch (e) {
    return false
  }
}

// Download JSON file

export function downloadJSON(json: string, filename: string): void {
  // check if the json is valid
  if (isValidJSON(json)) {
    const element = document.createElement('a') // create an <a> tag
    const file = new Blob([json], {
      type: 'application/json'
    }) // create a file
    element.href = URL.createObjectURL(file) // create a URL for the file
    element.download = `${filename}.json` // Set the file name
    document.body.appendChild(element) // Append the tag to the body
    element.click() // Click the a element
  }
}

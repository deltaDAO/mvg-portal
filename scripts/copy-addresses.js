const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const addressJsonFile = join(
  __dirname,
  '../node_modules/@oceanprotocol/contracts/addresses/address.json'
)

const addressJson = JSON.parse(readFileSync(addressJsonFile).toString())

const newObject = {
  ...addressJson
}

writeFileSync(addressJsonFile, JSON.stringify(newObject))

console.log('Added addresses to', addressJsonFile)

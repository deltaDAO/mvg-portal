const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const addressJsonFile = join(
  __dirname,
  '../node_modules/@oceanprotocol/contracts/addresses/address.json'
)
const genxAddressesFile = join(__dirname, '../genxAddress.json')

const addressJson = JSON.parse(readFileSync(addressJsonFile).toString())

const genxAddresses = JSON.parse(readFileSync(genxAddressesFile).toString())

const newObject = {
  ...addressJson,
  ...genxAddresses
}

writeFileSync(addressJsonFile, JSON.stringify(newObject))

console.log('Added GEN-X addresses to', addressJsonFile)

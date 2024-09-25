const fs = require('fs')
const os = require('os')

function getLocalAddresses() {
  const data = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(
      `${os.homedir}/.ocean/ocean-contracts/artifacts/address.json`,
      'utf8'
    )
  )
  return data.development
}

function updateEnvFile(keyValuePairs) {
  try {
    let envContent = ''

    if (fs.existsSync('.env')) {
      // Read the contents of the .env file
      envContent = fs.readFileSync('.env', 'utf8')
    } else {
      console.log('.env file not found, creating a new one.')
    }

    const lines = envContent.split('\n')

    keyValuePairs.forEach(({ key, value }) => {
      const index = lines.findIndex((line) => line.startsWith(key + '='))
      if (index !== -1) {
        // Update existing key
        lines[index] = `${key}=${value}`
      } else {
        // Add new key-value pair
        lines.push(`${key}=${value}`)
      }
    })

    // Write the updated content back to the .env file
    fs.writeFileSync('.env', lines.join('\n'))
    console.log('.env file successfully updated.')
  } catch (err) {
    console.error('Error updating .env file:', err)
  }
}

const addresses = getLocalAddresses()

updateEnvFile([
  { key: 'NEXT_PUBLIC_NFT_FACTORY_ADDRESS', value: addresses.ERC721Factory },
  {
    key: 'NEXT_PUBLIC_OPF_COMMUNITY_FEE_COLECTOR',
    value: addresses.OPFCommunityFeeCollector
  },
  {
    key: 'NEXT_PUBLIC_FIXED_RATE_EXCHANGE_ADDRESS',
    value: addresses.FixedPrice
  },
  { key: 'NEXT_PUBLIC_DISPENSER_ADDRESS', value: addresses.Dispenser },
  { key: 'NEXT_PUBLIC_OCEAN_TOKEN_ADDRESS', value: addresses.Ocean },
  { key: 'NEXT_PUBLIC_ROUTER_FACTORY_ADDRESS', value: addresses.Router },
  { key: 'NEXT_PUBLIC_MARKET_DEVELOPMENT', value: true }
])

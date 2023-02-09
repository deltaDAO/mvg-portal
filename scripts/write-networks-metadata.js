#!/usr/bin/env node
'use strict'

const axios = require('axios')

// https://github.com/ethereum-lists/chains
const chainDataUrl = 'https://chainid.network/chains.json'

axios(chainDataUrl).then((response) => {
  const genxNetwork = {
    name: 'GEN-X Testnet',
    title: 'GEN-X Testnet',
    chainId: 100,
    shortName: 'GEN-X',
    chain: '100',
    networkId: 100,
    nativeCurrency: { name: 'GEN-X Token', symbol: 'GX', decimals: 18 },
    rpc: ['https://rpc.genx.minimal-gaia-x.eu'],
    infoURL: 'https://docs.genx.minimal-gaia-x.eu',
    faucets: [],
    explorers: [
      {
        name: 'Exchange Logging Service',
        url: 'https://logging.genx.minimal-gaia-x.eu/',
        standard: ''
      }
    ]
  }
  response.data.splice(
    response.data.findIndex((n) => n?.chainId === 100),
    1
  )
  response.data.push(genxNetwork)
  process.stdout.write(JSON.stringify(response.data, null, '  '))
})

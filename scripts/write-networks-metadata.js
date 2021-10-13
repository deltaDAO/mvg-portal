#!/usr/bin/env node
'use strict'

const axios = require('axios')

// https://github.com/ethereum-lists/chains
const chainDataUrl = 'https://chainid.network/chains.json'

axios(chainDataUrl).then((response) => {
  response.data.push({
    name: 'Gaia-X Testnet',
    chain: 'GX',
    network: 'testnet',
    rpc: ['https://rpc.gaiaxtestnet.oceanprotocol.com'],
    faucets: [],
    nativeCurrency: {
      name: 'Gaia-X',
      symbol: 'GX',
      decimals: 18
    },
    infoURL: 'https://gaia-x.eu',
    shortName: 'GX',
    chainId: 2021000,
    networkId: 2021000
  })
  response.data.push({
    name: 'Catena-X Testnet',
    chain: 'CX',
    network: 'testnet',
    rpc: ['https://rpc.catenaxtestnet.oceanprotocol.com'],
    faucets: [],
    nativeCurrency: {
      name: 'Catena-X',
      symbol: 'CX',
      decimals: 18
    },
    infoURL: 'https://catena-x.net',
    shortName: 'CX',
    chainId: 2021001,
    networkId: 2021001
  })
  process.stdout.write(JSON.stringify(response.data, null, '  '))
})

#!/usr/bin/env node
'use strict'

const axios = require('axios')

// https://github.com/ethereum-lists/chains
const chainDataUrl = 'https://chainid.network/chains.json'

axios(chainDataUrl).then((response) => {
  // avoid having 2 nodes with the same chainId
  const filteredData = response.data.filter((node) => node.chainId !== 100)

  filteredData.push({
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
  filteredData.push({
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
  filteredData.push({
    name: 'GEN-X Testnet',
    chain: 'GEN-X',
    network: 'testnet',
    rpc: ['https://rpc.genx.minimal-gaia-x.eu'],
    faucets: [],
    nativeCurrency: {
      name: 'GEN-X',
      symbol: 'GX',
      decimals: 18
    },
    infoURL: '',
    shortName: 'GEN-X',
    chainId: 100,
    networkId: 100
  })
  process.stdout.write(JSON.stringify(filteredData, null, '  '))
})

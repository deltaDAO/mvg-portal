#!/usr/bin/env node
'use strict'

const axios = require('axios')

// https://github.com/ethereum-lists/chains
const chainDataUrl = 'https://chainid.network/chains.json'

axios(chainDataUrl).then((response) => {
  // avoid having 2 nodes with the same chainId
  const filteredData = response.data.filter((node) => node.chainId !== 100)

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

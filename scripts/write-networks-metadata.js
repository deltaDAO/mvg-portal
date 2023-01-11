#!/usr/bin/env node
'use strict'

const axios = require('axios')
const { networksMetadata } = require('../networksMetadata.config')
const { GEN_X_NETWORK_ID } = require('../chains.config')

// https://github.com/ethereum-lists/chains
const chainDataUrl = 'https://chainid.network/chains.json'

axios(chainDataUrl).then((response) => {
  // avoid having 2 nodes with the same chainId
  const filteredData = response.data.filter(
    (node) => node.chainId !== GEN_X_NETWORK_ID
  )

  // add custom networks metadata to the list
  const fullNetworksMetadata = filteredData.concat(networksMetadata)

  process.stdout.write(JSON.stringify(fullNetworksMetadata, null, '  '))
})

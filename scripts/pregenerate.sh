#!/usr/bin/env bash

# Write out repo metadata
node ./scripts/write-repo-metadata.cjs > content/repo-metadata.json

# Fetch EVM networks metadata
node ./scripts/write-networks-metadata.cjs > content/networks-metadata.json

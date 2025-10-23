import Publisher from '@components/@shared/Publisher'
import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import Link from 'next/link'
import { useCallback } from 'react'

export const useSimpleRequests = () =>
  useCallback((key: keyof PossibleRequests) => {
    switch (key) {
      case 'trusted_algorithm_publisher':
        return 'Do you want to trust the publisher?'
      case 'trusted_algorithm':
        return 'Do you want to trust the algorithm usage?'
      case 'allow_network_access':
        return 'Do you want to allow network access?'
      default:
        return `Unexpected key ${key}`
    }
  }, [])

export const useCompleteRequests = ({
  dataset,
  algorithm
}: {
  dataset: Asset
  algorithm: Asset
}) =>
  useCallback(
    (key: keyof PossibleRequests) => {
      switch (key) {
        case 'trusted_algorithm_publisher':
          return (
            <>
              To make <Publisher account={algorithm.nft.owner} showName /> a
              trusted service provider. This will allow all of their owned
              services to work on{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link>{' '}
              without future manual approval.
            </>
          )
        case 'trusted_algorithm':
          return (
            <>
              To trust the access and usage of{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link> via{' '}
              <Link href={`/asset/${algorithm.id}`}>{algorithm.nft.name}</Link>.
            </>
          )
        case 'allow_network_access':
          return (
            <>
              To enable network access when using any service with data from{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link>.
            </>
          )
        default:
          return `Unexpected key ${key}`
      }
    },
    [dataset, algorithm]
  )

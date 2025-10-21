import { GaiaXVerifiablePresentationArray } from '@utils/verifiablePresentations/types'
import axios from 'axios'
import { Address } from 'wagmi'
import { CredentialRoutes } from './routes'

const API = axios.create({
  baseURL: '/api',
  timeout: 2000
})

export const getVerifiablePresentations = async (
  address: Address,
  signal?: AbortSignal
): Promise<GaiaXVerifiablePresentationArray> =>
  address
    ? API.get(CredentialRoutes.GetPresentation(address), {
        signal
      })
        .then(({ data }) => data)
        .catch((err) => {
          console.error('Error fetching verifiable credentials', err)
          return []
        })
    : []

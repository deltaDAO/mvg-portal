import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

import { ZodType } from 'zod'
import { ConsentsApiRoutes as Routes } from './routes'
import {
  ConsentSchema,
  ConsentsListSchema,
  UserConsentsDataSchema
} from './schemas'
import {
  Consent,
  ConsentDirection,
  ConsentList,
  PossibleRequests,
  UserConsentsData
} from './types'

export const API = axios.create({
  baseURL: '/api',
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json'
  }
})

API?.interceptors.request.use((config) => {
  const token = localStorage.getItem('Consents-JWT')

  if (token && config.method) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let tokenRefresher: (() => Promise<string>) | null = null
export const setTokenRefresher = (fn: () => Promise<string>) => {
  tokenRefresher = fn
}

API?.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry: boolean
    }

    if (
      error.response?.status >= 400 &&
      error.response?.status < 500 &&
      !originalRequest._retry &&
      tokenRefresher
    ) {
      originalRequest._retry = true

      const token = await tokenRefresher()
      if (!originalRequest.headers) originalRequest.headers = {}
      originalRequest.headers.Authorization = `Bearer ${token}`

      const retryRequest = { ...originalRequest, withCredentials: true }
      return API(retryRequest)
    }

    return Promise.reject(error)
  }
)

const validate = <T>({ data }: AxiosResponse, schema: ZodType<T>): T => {
  const result = schema.safeParse(data)

  if (!result.success) {
    console.error('Error validating', result.error)
    throw new Error('Invalid response data from API', { cause: result.error })
  }

  return result.data
}

// HoF to ease the validation writing
export const validateWithSchema =
  <T>(schema: ZodType<T>) =>
  (response: AxiosResponse) =>
    validate<T>(response, schema)

export const getUserConsentsDirection = async (
  address: string,
  direction: ConsentDirection,
  signal?: AbortSignal
): Promise<ConsentList> =>
  API.get(Routes.UserConsents(address), {
    params: {
      direction
    },
    signal
  }).then(validateWithSchema(ConsentsListSchema))

export const getUserConsents = async (
  address: string,
  signal?: AbortSignal
): Promise<UserConsentsData> =>
  API.get(Routes.UserConsentsAmount(address), {
    signal
  }).then((result) => {
    if (result.data) {
      return validateWithSchema(UserConsentsDataSchema)(result)
    }
    return {} as UserConsentsData
  })

export const createConsent = async (
  address: string,
  chainId: number,
  datasetDid: string,
  algorithmDid: string,
  request: PossibleRequests,
  reason?: string
): Promise<void> =>
  API.post(Routes.UserConsents(address), {
    chainId,
    address,
    datasetDid,
    algorithmDid,
    request,
    reason
  }).catch((error) => {
    console.error(error)
    return null
  })

export const deleteConsent = async (
  consentId: number,
  signal?: AbortSignal
): Promise<void> =>
  API.delete(Routes.Consents(String(consentId)), {
    signal
  })

export const createConsentResponse = async (
  consentId: number,
  reason: string,
  permitted: PossibleRequests
): Promise<Consent> =>
  API.post(Routes.ConsentsResponse(String(consentId)), {
    reason,
    permitted
  }).then(validateWithSchema(ConsentSchema))

export const deleteConsentResponse = async (consentId: number): Promise<void> =>
  await API.delete(Routes.ConsentsResponse(String(consentId)))

export const getHealth = async (): Promise<boolean> =>
  API.get(Routes.ConsentsHealth)

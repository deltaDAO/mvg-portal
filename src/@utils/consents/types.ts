import * as z from 'zod'
import * as schemas from './schemas'

export interface Paginated<T> {
  count: number
  next: URL | null
  previous: URL | null
  results: Array<T>
}

export type UserConsentsData = z.infer<typeof schemas.UserConsentsDataSchema>
export type ConsentState = z.infer<typeof schemas.ConsentStatusSchema>
export const ConsentStates: ConsentState[] = schemas.ConsentStatusSchema.options
export type ConsentDirection = z.infer<typeof schemas.ConsentDirectionSchema>
export const ConsentDirections: ConsentDirection[] =
  schemas.ConsentDirectionSchema.options.filter((dir) => dir !== '-')
export type ConsentResponse = z.infer<typeof schemas.ConsentResponseSchema>
export type PossibleRequests = z.infer<typeof schemas.PossibleRequestsSchema>
export type Consent = z.infer<typeof schemas.ConsentSchema>
export type ConsentList = z.infer<typeof schemas.ConsentsListSchema>
export type Nonce = z.infer<typeof schemas.NonceSchema>
export type NonceResponse = z.infer<typeof schemas.NonceResponseSchema>

import * as z from 'zod'

const ShortUserSchema = z.object({
  url: z.url(),
  address: z.string()
})

export const UserConsentsDataSchema = z.object({
  address: z.string(),
  assets: z.url().array(),
  incoming_pending_consents: z.coerce.number(),
  outgoing_pending_consents: z.coerce.number()
})

export const ConsentStatusSchema = z.enum([
  'Pending',
  'Accepted',
  'Denied',
  'Resolved'
])

export const ConsentDirectionSchema = z.enum(['Incoming', 'Outgoing', '-'])

export const PossibleRequestsSchema = z.object({
  trusted_algorithm_publisher: z.boolean().optional().nullable(),
  trusted_algorithm: z.boolean().optional().nullable(),
  allow_network_access: z.boolean().optional().nullable()
})

export const ConsentResponseSchema = z.object({
  consent: z.url(),
  status: ConsentStatusSchema,
  reason: z.string().optional().nullable(),
  permitted: PossibleRequestsSchema.optional().nullable(),
  last_updated_at: z.coerce.number().optional().nullable()
})

export const ConsentSchema = z.object({
  id: z.coerce.number(),
  url: z.url(),
  dataset: z.string(),
  algorithm: z.string(),
  solicitor: ShortUserSchema,
  request: PossibleRequestsSchema.nullable(),
  reason: z.string().optional().nullable(),
  created_at: z.coerce.number(),
  response: ConsentResponseSchema.optional().nullable(),
  status: ConsentStatusSchema,
  direction: ConsentDirectionSchema
})
export const ConsentsListSchema = z.array(ConsentSchema)

export const NonceSchema = z.object({
  address: z.string(),
  chainId: z.coerce.string(),
  nonce: z.string(),
  issuedAt: z.iso.datetime({ offset: true }),
  expirationTime: z.iso.datetime({ offset: true }),
  message: z.string()
})

export const NonceResponseSchema = z.object({
  access: z.string(),
  walletAddress: z.string(),
  chainId: z.coerce.number(),
  expires_in: z.coerce.number().optional()
})

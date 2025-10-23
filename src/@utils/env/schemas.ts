import * as z from 'zod'

export const EnvironmentSchema = z.object({
  CONSENTS_API_URL: z.url()
})

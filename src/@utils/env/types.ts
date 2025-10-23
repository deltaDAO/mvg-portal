import * as z from 'zod'
import { EnvironmentSchema } from './schemas'

export type Environment = z.infer<typeof EnvironmentSchema>

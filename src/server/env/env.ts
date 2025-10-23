'use server'
import { Environment } from '@utils/env/types'

interface IEnvironmentService {
  get<K extends keyof Environment>(key: K): Environment[K]
  getMultiple<K extends keyof Environment>(keys: K[]): Pick<Environment, K>
}

export default IEnvironmentService

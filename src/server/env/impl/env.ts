'use server'
import { EnvironmentSchema } from '@utils/env/schemas'
import { Environment } from '@utils/env/types'
import { injectable } from 'inversify'
import { env } from 'next-runtime-env'
import IEnvironmentService from '../env'

@injectable()
export class EnvironmentService implements IEnvironmentService {
  private environment: Environment | undefined

  private loadEnv() {
    const raw = {}
    for (const key of Object.keys(EnvironmentSchema.shape)) {
      raw[key] = env(key)
    }
    this.environment = EnvironmentSchema.parse(raw)
  }

  get<K extends keyof Environment>(key: K): Environment[K] {
    if (!this.environment) this.loadEnv()
    return this.environment[key]
  }

  getMultiple<K extends keyof Environment>(keys: K[]): Pick<Environment, K> {
    if (!this.environment) this.loadEnv()
    const result = {} as Pick<Environment, K>
    for (const key of keys) {
      result[key] = this.environment[key]
    }
    return result
  }
}

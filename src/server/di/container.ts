'use server'

import { Container } from 'inversify'
import ICredentialsService from '../credentials/credentials'
import { LocalCredentialsService } from '../credentials/impl/local-credentials'

const container = new Container()

container
  .bind<ICredentialsService>('Credentials')
  .to(LocalCredentialsService)
  .inSingletonScope()

export { container }

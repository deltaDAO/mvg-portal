'use server'

import { Container } from 'inversify'
import IAuthenticationService from '../auth/authentication'
import { AuthenticationService } from '../auth/impl/authentication'
import IConsentsService from '../consents/consents'
import IConsentResponseService from '../consents/consents-response'
import IConsentsHealthService from '../consents/health'
import { ConsentsService } from '../consents/impl/consent'
import { ConsentResponseService } from '../consents/impl/consent-response'
import { ConsentsHealthService } from '../consents/impl/health'
import ICredentialsService from '../credentials/credentials'
import { LocalCredentialsService } from '../credentials/impl/local-credentials'
import IEnvironmentService from '../env/env'
import { EnvironmentService } from '../env/impl/env'

const container = new Container()

container
  .bind<IEnvironmentService>('Env')
  .to(EnvironmentService)
  .inSingletonScope()

container
  .bind<ICredentialsService>('Credentials')
  .to(LocalCredentialsService)
  .inSingletonScope()

container
  .bind<IConsentsHealthService>('ConsentHealth')
  .to(ConsentsHealthService)
  .inSingletonScope()

container
  .bind<IConsentsService>('Consents')
  .to(ConsentsService)
  .inSingletonScope()

container
  .bind<IConsentResponseService>('ConsentResponse')
  .to(ConsentResponseService)
  .inSingletonScope()

container
  .bind<IAuthenticationService>('Authentication')
  .to(AuthenticationService)
  .inRequestScope()

export { container }

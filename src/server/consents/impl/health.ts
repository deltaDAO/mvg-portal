'use server'
import IAuthenticationService from '@/server/auth/authentication'
import IConsentsHealthService from '@/server/consents/health'
import { container } from '@/server/di/container'
import { injectable } from 'inversify'

@injectable()
export class ConsentsHealthService implements IConsentsHealthService {
  getClient = () =>
    container.get<IAuthenticationService>('Authentication').getClient()

  async getHealth(): Promise<void> {
    await this.getClient().get('health')
  }
}

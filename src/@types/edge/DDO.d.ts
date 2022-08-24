import { DDO } from '@oceanprotocol/lib'
import { ServiceTypeWithEdge, ServiceWithEdge } from './Service'

export interface EdgeDDO extends DDO {
  service: ServiceWithEdge[]
  findServiceById<T extends ServiceTypeWithEdge>(
    index: number
  ): ServiceWithEdge<T>
  findServiceByType<T extends ServiceTypeWithEdge>(
    serviceType: T
  ): ServiceWithEdge<T>
}

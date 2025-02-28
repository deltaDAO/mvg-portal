import { RemoteObject } from './RemoteObject'

export interface License {
  name: string
  // To be defined
  ODRL?: unknown
  licenseDocuments?: RemoteObject[]
}

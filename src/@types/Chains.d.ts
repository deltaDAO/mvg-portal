import { ConfigHelperConfig } from '@oceanprotocol/lib'

export type ConfigHelperConfigOverwrite = Partial<ConfigHelperConfig> &
  Required<Pick<ConfigHelperConfig, 'networkId'>>

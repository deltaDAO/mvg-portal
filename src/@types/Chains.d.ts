export type ConfigHelperConfigOverwrite = Partial<ConfigHelperConfig> &
  Required<Pick<ConfigHelperConfig, 'networkId'>>

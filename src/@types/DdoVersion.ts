export enum DDOVersion {
  V4_1_0 = '4.1.0',
  V4_3_0 = '4.3.0',
  V4_5_0 = '4.5.0',
  V5_0_0 = '5.0.0'
}

export function lastDdoVersion(): DDOVersion {
  return DDOVersion.V5_0_0
}

export enum PolicyServerActions {
  INITIATE = 'initiate',
  GET_PD = 'getPd',
  CHECK_SESSION_ID = 'checkSessionId',
  PRESENTATION_REQUEST = 'presentationRequest',
  DOWNLOAD = 'download',
  PASSTHROUGH = 'passthrough'
}

export interface PolicyServerResponse {
  success: boolean
  message: string
  httpStatus: number
}

export interface PolicyServerInitiateActionData {
  successRedirectUri: string
  errorRedirectUri: string
  responseRedirectUri: string
  presentationDefinitionUri: string
}

export interface PolicyServerInitiateAction {
  action: PolicyServerActions.INITIATE
  sessionId?: string
  ddo: any
  policyServer: PolicyServerInitiateActionData
}

export interface PolicyServerGetPdAction {
  action: PolicyServerActions.GET_PD
  sessionId: string
}

export interface PolicyServerCheckSessionIdAction {
  action: PolicyServerActions.CHECK_SESSION_ID
  sessionId: string
}

export interface PolicyServerPresentationRequestAction {
  action: PolicyServerActions.PRESENTATION_REQUEST
  sessionId: string
  vp_token: any
  response: any
  presentation_submission: any
}

export interface PolicyServerDownloadAction {
  action: PolicyServerActions.DOWNLOAD
  policyServer: {
    sessionId: string
  }
}

export interface PolicyServerPassthrough {
  action: PolicyServerActions.PASSTHROUGH
  url: string
  httpMethod: 'GET'
  body: any
}

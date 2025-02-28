export interface PolicyServerResponse {
  success: boolean
  message: string
  httpStatus: number
}

export interface PolicyServerInitiateAction {
  action: 'initiate'
  sessionId?: string
  ddo: any
  policyServer: {
    successRedirectUri: string
    errorRedirectUri: string
    responseRedirectUri: string
    presentationDefinitionUri: string
  }
}

export interface PolicyServerGetPdAction {
  action: 'getPD'
  sessionId: string
}

export interface PolicyServerCheckSessionIdAction {
  action: 'checkSessionId'
  sessionId: string
}

export interface PolicyServerPresentationRequestAction {
  action: 'presentationRequest'
  sessionId: string
  vp_token: any
  response: any
  presentation_submission: any
}

export interface PolicyServerDownloadAction {
  action: 'download'
  policyServer: {
    sessionId: string
  }
}

export interface PolicyServerPassthrough {
  action: 'passthrough'
  url: string
  httpMethod: 'GET'
  body: any
}

/* eslint-disable camelcase */
import axios from 'axios'
import { AssetExtended } from 'src/@types/AssetExtended'
import {
  PolicyServerInitiateAction,
  PolicyServerResponse,
  PolicyServerCheckSessionIdAction
} from 'src/@types/PolicyServer'
import appConfig from 'app.config.cjs'

export async function requestCredentialPresentation(
  asset: AssetExtended
): Promise<string> {
  try {
    const apiUrl = `${window.location.origin}`
    const sessionId = crypto.randomUUID()

    const action: PolicyServerInitiateAction = {
      action: 'initiate',
      sessionId,
      ddo: asset,
      policyServer: {
        successRedirectUri: `${apiUrl}/api/policy/success`,
        errorRedirectUri: `${apiUrl}/api/policy/error`,
        responseRedirectUri: `${apiUrl}/policy/verify/${sessionId}`,
        presentationDefinitionUri: `${apiUrl}/policy/pd/${sessionId}`
      }
    }
    const response = await axios.post(
      `/provider/api/services/PolicyServerPassthrough`,
      {
        policyServerPassthrough: action
      }
    )
    return response.data.message
  } catch (error) {
    throw error.response
  }
}

export async function serverSidePresentationDefinition(
  sessionId: string
): Promise<PolicyServerResponse> {
  try {
    const response = await axios.get(
      `${appConfig.ssiPolicyServer}/pd/${sessionId}`
    )
    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function serverSidePresentationRequest(
  sessionId: string,
  body: any
): Promise<PolicyServerResponse> {
  try {
    const result = await axios.post(
      `${appConfig.ssiPolicyServer}/verify/${sessionId}`,
      body
    )
    return result.data
  } catch (error) {
    throw error.response
  }
}

export async function checkSessionId(sessionId: string): Promise<string> {
  try {
    const apiUrl = `${window.location.origin}`

    const action: PolicyServerCheckSessionIdAction = {
      action: 'checkSessionId',
      sessionId
    }
    const response = await axios.post(
      `/provider/api/services/PolicyServerPassthrough`,
      {
        policyServerPassthrough: action
      }
    )
    console.log(response.data)
    return response.data.message
  } catch (error) {
    throw error.response
  }
}

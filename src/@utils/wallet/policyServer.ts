/* eslint-disable camelcase */
import { customProviderUrl } from 'app.config.cjs'
import axios from 'axios'
import { Asset } from 'src/@types/Asset'
import {
  PolicyServerInitiateAction,
  PolicyServerResponse,
  PolicyServerCheckSessionIdAction,
  PolicyServerInitiateActionData,
  PolicyServerActions,
  PolicyServerGetPdAction,
  PolicyServerPresentationDefinition
} from 'src/@types/PolicyServer'

export async function requestCredentialPresentation(
  asset: Asset,
  consumerAddress: string,
  serviceId: string
): Promise<{
  success: boolean
  openid4vc: string
  policyServerData: PolicyServerInitiateActionData
}> {
  try {
    const sessionId = crypto.randomUUID()

    const policyServer: PolicyServerInitiateActionData = {
      sessionId,
      successRedirectUri: ``,
      errorRedirectUri: ``,
      responseRedirectUri: ``,
      presentationDefinitionUri: ``
    }

    const action: PolicyServerInitiateAction = {
      action: PolicyServerActions.INITIATE,
      documentId: asset.id,
      policyServer,
      serviceId,
      consumerAddress
    }
    const response = await axios.post(
      `${customProviderUrl}/api/services/PolicyServerPassthrough`,
      {
        policyServerPassthrough: action
      }
    )

    if (response.data.length === 0) {
      // eslint-disable-next-line no-throw-literal
      throw { success: false, message: 'No openid4vc url found' }
    }

    return {
      success: response.data?.success,
      openid4vc: response.data?.message,
      policyServerData: policyServer
    }
  } catch (error) {
    if (error.request?.response) {
      const err = JSON.parse(error.request.response)
      throw err
    }
    if (error.response?.data) {
      throw error.response?.data
    }
    throw error
  }
}

export async function checkVerifierSessionId(
  sessionId: string
): Promise<PolicyServerResponse> {
  try {
    const action: PolicyServerCheckSessionIdAction = {
      action: PolicyServerActions.CHECK_SESSION_ID,
      sessionId
    }
    const response = await axios.post(
      `${customProviderUrl}/api/services/PolicyServerPassthrough`,
      {
        policyServerPassthrough: action
      }
    )

    if (typeof response.data === 'string' && response.data.length === 0) {
      // eslint-disable-next-line no-throw-literal
      throw { success: false, message: 'Invalid session id' }
    }

    return response.data
  } catch (error) {
    if (error.response?.data) {
      throw error.response?.data
    }
    throw error
  }
}

export async function getPd(
  sessionId: string
): Promise<PolicyServerPresentationDefinition> {
  try {
    const action: PolicyServerGetPdAction = {
      action: PolicyServerActions.GET_PD,
      sessionId
    }
    const response = await axios.post(
      `${customProviderUrl}/api/services/PolicyServerPassthrough`,
      {
        policyServerPassthrough: action
      }
    )

    if (typeof response.data === 'string' && response.data.length === 0) {
      // eslint-disable-next-line no-throw-literal
      throw {
        success: false,
        message: 'Could not read presentation definition'
      }
    }

    return response.data?.message
  } catch (error) {
    if (error.response?.data) {
      throw error.response?.data
    }
    throw error
  }
}

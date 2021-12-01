export interface RegisterVPPayload {
  signature: string
  hashedMessage: string
  fileUrl: string
}

type RegistryApiResponseBody = SignatureMessageBody | VpDataBody

export interface RegistryApiResponse<RegistryApiResponseBody> {
  data: {
    data: RegistryApiResponseBody
    message: string
  }
}

export interface SignatureMessageBody {
  message: string
}

export interface VpDataBody {
  _id: string
  address: string
  transactionHash: string
  fileUrl: string
}

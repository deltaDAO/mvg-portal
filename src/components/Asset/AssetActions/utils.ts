import axios from 'axios'
import { toast } from 'react-toastify'

export async function getContractingProviderNonce(
  contractingBaseUrl: string,
  address: string
) {
  try {
    const response = await axios.get(
      `${contractingBaseUrl}/user/${address}/nonce`
    )
    return response.data
  } catch (e) {
    console.error(e)
    toast.error('Could not get nonce from contracting provider.')
  }
}

export async function getPayPerUseCount(
  contractingBaseUrl: string,
  address: string,
  signature: string,
  did: string
) {
  try {
    const response = await axios.post(
      `${contractingBaseUrl}/contracting/validate`,
      { address, signature, did },
      {
        // throw only on status codes we dont expect
        // 404 returned if no transaction was found for address & did combination
        // 401 returned if 'hasAccess' for address on did is = false
        validateStatus: (status) => status < 400 || [404, 401].includes(status)
      }
    )

    const { data } = response

    return data?.orderCount
  } catch (e) {
    console.error(e)
    toast.error('Could not retrieve information from contracting provider.')
  }
}

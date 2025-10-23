import { API, setTokenRefresher } from '@utils/consents/api'
import { NonceResponseSchema, NonceSchema } from '@utils/consents/schemas'
import { useEffect } from 'react'
import { useAccount, useNetwork, useSigner } from 'wagmi'

const useUserConsentsToken = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { data: signer } = useSigner()

  useEffect(() => {
    if (!signer || !address || !chain) return

    setTokenRefresher(async () => {
      // Callback for when authorization fails on consents server.
      //    1. Get nonce from server
      //    2. Sign nonce
      //    3. Validate signature

      const nonce = await API.get('/consents/auth/wallet', {
        params: { address, chainId: chain.id }
      }).then(({ data }) => NonceSchema.parse(data))

      const signature = await signer.signMessage(nonce.message)

      const { access } = await API.post(
        '/consents/auth/wallet',
        {
          signature,
          address
        },
        {
          withCredentials: true
        }
      ).then(({ data }) => NonceResponseSchema.parse(data))

      localStorage.setItem('Consents-JWT', access)

      return access
    })
  }, [signer, address, chain])
}

export { useUserConsentsToken }

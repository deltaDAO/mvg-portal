import React, { ReactElement, useEffect, useState } from 'react'
import Permission from '../../components/organisms/Permission'
import { PageProps } from 'gatsby'
import PageTemplateAssetDetails from '../../components/templates/PageAssetDetails'
import AssetProvider from '../../providers/Asset'
import OceanProvider from '../../providers/Ocean'
import Web3 from 'web3'
import { useLocation, useNavigate } from '@reach/router'

export default function PageGatsbyAssetDetails(props: PageProps): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const { origin } = location

  const [did, setDid] = useState<string>()

  useEffect(() => {
    const did = props.location.pathname.split('/')[2]
    const address = did.replace('did:op:', '0x')
    const isAddress = Web3.utils.isAddress(address.toLowerCase())
    const isChecksumValid = Web3.utils.checkAddressChecksum(address)

    if (isAddress && !isChecksumValid) {
      const checksumAddress = Web3.utils.toChecksumAddress(address)
      const checksumDid = `did:op:${checksumAddress.replace('0x', '')}`
      setDid(checksumDid)
      navigate(`${origin}/asset/${checksumDid}`)
      return
    }

    setDid(did)
  }, [location, navigate, origin, props.location.pathname])

  return (
    <Permission eventType="browse">
      <AssetProvider asset={did}>
        <OceanProvider>
          <PageTemplateAssetDetails uri={props.location.pathname} />
        </OceanProvider>
      </AssetProvider>
    </Permission>
  )
}

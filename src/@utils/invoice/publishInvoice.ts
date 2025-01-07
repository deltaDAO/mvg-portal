import { Event, ethers } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { InvoiceData } from '../../@types/invoice/InvoiceData'
import NftFactory from '@oceanprotocol/contracts/artifacts/contracts/ERC721Factory.sol/ERC721Factory.json'
import ERC20TemplateEnterprise from '@oceanprotocol/contracts/artifacts/contracts/templates/ERC20TemplateEnterprise.sol/ERC20TemplateEnterprise.json'
import { getOceanConfig } from '@utils/ocean'

function createInvoicePublish(
  txPublish: TransactionResponse,
  transactionFee: number,
  event: Event,
  invoiceDate: Date,
  invoiceId: string
): InvoiceData {
  const formattedInvoiceDate = invoiceDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const invoiceData: InvoiceData = {
    invoice_id: 'PMF1',
    invoice_date: formattedInvoiceDate,
    paid: true,
    issuer_address_blockchain: event.args.PublishMarketFeeAddress,
    client_name: txPublish.from,
    client_company: 'Client company',
    client_address: 'Client address',
    client_email: 'Client email',
    currencyToken: 'Ocean',
    currencyAddress: event.args.PublishMarketFeeToken,
    items: [
      {
        name: `Publish fee for ${invoiceId}`,
        price: Number(event.args.PublishMarketFeeAmount) / 10 ** 18
      }
    ],
    tax: transactionFee,
    currencyTax: 'ETH',
    note: 'Thank You For Your Business!',
    credentialSubject: {
      name: 'Example Organization',
      url: 'http://www.example.com',
      logo: 'http://www.example.com/logo.png',
      contactPoint: {
        email: 'example@example.com',
        telephone: '+1-800-123-4567',
        contactType: 'customer service'
      },
      address: {
        streetAddress: '20341 Whitworth Institute 405 N. Whitworth',
        addressLocality: 'Seattle',
        addressRegion: 'WA',
        postalCode: '98101'
      },
      globalLocationNumber: '1234567890123',
      leiCode: '5493001KJTIIGC8Y1R12',
      vatID: 'GB123456789',
      taxID: '123-45-6789'
    }
  }
  return invoiceData
  // return createInvoice(invoiceData)
}

export async function decodePublish(
  id: string,
  txHash: string,
  chainId: number
): Promise<InvoiceData> {
  try {
    const { nftFactoryAddress, nodeUri } = getOceanConfig(chainId)
    const provider = new ethers.providers.JsonRpcProvider(nodeUri)
    const transactionPublish = await provider.getTransaction(txHash)
    const txReceipt = await provider.getTransactionReceipt(txHash)

    const gasPriceInGwei = Number(transactionPublish.gasPrice) / 1e9
    const transactionFeeWei = (gasPriceInGwei * Number(txReceipt.gasUsed)) / 1e9

    const time = await provider.getBlock(transactionPublish.blockNumber)
    const timestamp = Number(time.timestamp)
    const invoiceDate = new Date(timestamp * 1000)

    const contract = new ethers.Contract(
      nftFactoryAddress,
      NftFactory.abi,
      provider
    )
    const eventInstance = await contract.queryFilter(
      'InstanceDeployed',
      transactionPublish.blockNumber - 10, // fromBlockOrBlockhash
      transactionPublish.blockNumber // toBlock
    )
    const filteredEvents = eventInstance.filter(
      (event) => event.args.instance === transactionPublish.to
    )

    if (filteredEvents.length === 0) {
      throw new Error('No events found')
    }

    const transactionCreateNft = await provider.getTransaction(
      filteredEvents[0].transactionHash
    )
    const txReceipt2 = await provider.getTransactionReceipt(
      filteredEvents[0].transactionHash
    )
    const gasPriceInGwei2 = Number(transactionCreateNft.gasPrice) / 1e9
    const transactionFeeWei2 =
      (gasPriceInGwei2 * Number(txReceipt2.gasUsed)) / 1e9

    const transactionFee = transactionFeeWei + transactionFeeWei2

    // Get past events emitted by the contract instance
    const contractInstance = new ethers.Contract(
      eventInstance[eventInstance.length - 1].args.instance,
      ERC20TemplateEnterprise.abi,
      provider
    )

    const events = await contractInstance.queryFilter(
      'PublishMarketFeeChanged',
      transactionCreateNft.blockNumber,
      transactionCreateNft.blockNumber
    )
    return createInvoicePublish(
      transactionPublish,
      transactionFee,
      events[0],
      invoiceDate,
      id
    )
  } catch (error) {
    console.error('Error decoding events:', error)
  }
}

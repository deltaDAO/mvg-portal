export type InvoiceData = {
  invoice_id: string
  invoice_date: string
  paid: boolean
  issuer_address_blockchain: string
  client_name: string
  client_company: string
  client_address: string
  client_email: string
  currencyToken: string
  currencyAddress: string
  items: {
    name: string
    price: number
  }[]
  tax: number
  currencyTax: string
  note: string
  credentialSubject: {
    name: string
    url: string
    logo: string
    contactPoint: {
      email: string
      telephone: string
      contactType: string
    }
    address: {
      streetAddress: string
      addressLocality: string
      addressRegion: string
      postalCode: string
    }
    globalLocationNumber: string
    leiCode: string
    vatID: string
    taxID: string
  }
}

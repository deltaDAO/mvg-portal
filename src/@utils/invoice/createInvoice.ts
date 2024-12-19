import { InvoiceData } from '../../@types/invoice/InvoiceData'
import JsPDF from 'jspdf'
import html2canvas from 'html2canvas'

async function htmlToPdfBuffer(htmlContent: string) {
  const iframe = document.createElement('iframe')
  const iframeWidth = 800
  const iframeHeight = 422
  const pxPerMm = 3.7795275591 // Conversion factor from mm to pixels (72 DPI)

  // Convert A4 dimensions to pixels
  const iframeWidthPx = iframeWidth * pxPerMm
  const iframeHeightPx = iframeHeight * pxPerMm
  iframe.style.visibility = 'hidden'
  iframe.style.width = `${iframeWidth}px`
  iframe.style.height = `${iframeHeight}px`

  document.body.appendChild(iframe)
  const iframedoc = iframe.contentDocument || iframe.contentWindow.document
  iframedoc.body.innerHTML = htmlContent
  const scale = 4
  const canvas = await html2canvas(iframedoc.body, {
    scale,
    useCORS: true,
    width: iframeWidthPx,
    height: iframeHeightPx
  })

  // Convert the iframe into a PNG image using canvas.
  const imgData = canvas.toDataURL('image/png')

  // Create a PDF document and add the image as a page.
  const doc = new JsPDF({
    format: 'a4',
    unit: 'mm',
    orientation: 'p'
  })

  doc.addImage(imgData, 'PNG', 0, 0, iframeWidth, iframeHeight)

  // Get the file as blob output.
  const blob = doc.output('blob')

  // Remove the iframe from the document when the file is generated.
  document.body.removeChild(iframe)

  return blob
}

export async function createInvoice(data: InvoiceData): Promise<Blob> {
  const htmlTemplate = `<!DOCTYPE html>
  <html lang="en-US">
    <head>
      <title>Invoice ${data.invoice_id} ${data.client_name}</title>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css"
        integrity="sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn"
        crossorigin="anonymous"
      />
    </head>
    <body>
      <div
        style="
          border-width: 3px;
          border-style: solid;
          border-color: #008000;
          border-radius: 8px;
          color: #008000;
          opacity: 0.4;
          position: absolute;
          z-index: 1;
          left: 70%;
          top: 3%;
          font-size: 20pt;
          transform: rotate(-20deg);
        "
      >
        PAID
      </div>
  
      <div class="container" style="width: 800px">
        <div class="">
          <div class="">
            <!-- invoice: header begin-->
            <div class="col col-md-6">
              <div class="">
                <div class="">
                  <span class="font-weight-bold">Invoice Number:</span>
                  ${data.invoice_id}
                </div>
                <div class="">
                  <span class="font-weight-bold">Invoice Date:</span>
                  ${data.invoice_date}
                </div>
              </div>
            </div>
            <br />
            <div class="col col-md-12">
              <div class=""><strong>Wallet Address:</strong> ${data.issuer_address_blockchain}</div>
              <div class="">
                <strong>Company:</strong> ${data.credentialSubject.name}
              </div>
              <div class="">
                <strong>Address:</strong> ${data.credentialSubject.address.streetAddress}, ${data.credentialSubject.address.addressLocality}
              </div>
              <div class=""><strong>Email:</strong> ${data.credentialSubject.contactPoint.email}</div>
              <div class=""><strong>Telephone:</strong> ${data.credentialSubject.contactPoint.telephone}</div>
            </div>
            </div>
  
            <br />
            <div class="col col-md-12">
            <div class="font-weight-bold">BILL TO:</div>
            <div class=""><strong>Wallet Address:</strong> ${data.client_name}</div>
            <div> <strong>Company:</strong> ${data.client_company}</div>
            <div> <strong>Address:</strong> ${data.client_address}</div>
            <div> <strong>Email:</strong> ${data.client_email}</div>
            </div>
            <br />
            <div class="row col-md-12">
              <div class="col col-md-12">
                <table class="table table-striped" cellspacing="0">
                  <thead>
                    <tr class="table-head">
                      <th class="text-left">Item</th>
                      <th class="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="text-left" style="word-break: break-all; width: 60%;">
                        ${data.items[0].name}
                      </td>
                      <td class="text-right">
                        ${data.items[0].price} ${data.currencyToken}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
  
            <div class="row col-md-12">
              <div class="col col-md-12 text-left">
                <div style="margin-bottom: 10px">
                  Token address:
                  <span class="amount">${data.currencyAddress}</span>
                </div>
                <div style="margin-bottom: 10px">
                  Transaction fee:
                  <span class="amount">${data.tax} ${data.currencyTax}</span>
                </div>
  
                <div class="font-weight-bold footer-title alert-warning" style="height: 70px">
                  TOTAL:
                  <span class="total-amount amount font-weight-bold"
                    >${data.items[0].price} ${data.currencyToken}</span
                  >
                </div>
              </div>
              <div class="container text-muted">${data.note}</div>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `
  return htmlToPdfBuffer(htmlTemplate)
}

export async function getPdf(invoicesJson: InvoiceData[]): Promise<Blob[]> {
  const promises = invoicesJson.map((invoiceData) => createInvoice(invoiceData))

  return Promise.all(promises)
}

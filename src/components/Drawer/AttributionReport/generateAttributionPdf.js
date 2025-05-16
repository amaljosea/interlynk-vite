/* eslint-disable no-restricted-syntax */
import { jsPDF } from 'jspdf'

export const fetchLogo = async () => {
  try {
    const logoUrl = new URL('assets/img/logo.png', import.meta.url).href
    const res = await fetch(logoUrl)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        resolve(base64String ? `data:image/png;base64,${base64String}` : null)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn('Logo failed to load:', err)
    return null
  }
}

export const formatFilename = (name, version) => {
  const now = new Date()
  const month = now.toLocaleString('default', { month: 'short' }).toLowerCase()
  const year = now.getFullYear()
  const formattedName = name.toLowerCase().replace(/[.\s]/g, '_')
  const formattedVersion = version.toLowerCase().replace(/[.\s]/g, '_')
  return `${formattedName}_${formattedVersion}_${month}_${year}.pdf`
}

export const generateAttributionPdf = async (
  finalItems,
  productName,
  productVersion
) => {
  const filename = formatFilename(productName, productVersion)
  const pdfDoc = new jsPDF({ compress: true })
  const pageWidth = pdfDoc.internal.pageSize.getWidth()
  const pageHeight = pdfDoc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin
  let pageNumber = 1

  const logoBase64 = await fetchLogo()

  // Add the first page content
  if (logoBase64) {
    pdfDoc.addImage(logoBase64, 'PNG', margin, yPosition, 20, 20)
  }
  pdfDoc.setFontSize(20)
  pdfDoc.setTextColor('#3d71ee')
  const titleText = 'Interlynk Attribution Report'
  pdfDoc.text(titleText, margin + 25, yPosition + 15)
  yPosition += 25

  pdfDoc.setFontSize(11)
  pdfDoc.setTextColor('#323232')
  pdfDoc.text(`${productName} - ${productVersion}`, margin, yPosition)
  yPosition += 15

  finalItems.forEach((comp) => {
    yPosition += 10 // Add some space before each component

    pdfDoc.setFontSize(14)
    pdfDoc.setFont('helvetica', 'bold')
    pdfDoc.setTextColor('#000000')
    const componentTitle = `${comp.name || 'Unknown'} - ${comp.version || 'Unknown'}`
    const titleLines = pdfDoc.splitTextToSize(
      componentTitle,
      pageWidth - 2 * margin
    )
    titleLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        pdfDoc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
          align: 'center'
        })
        pageNumber++
        pdfDoc.addPage()
        yPosition = margin
      }
      pdfDoc.text(line, margin, yPosition)
      yPosition += 6
    })
    yPosition += 4

    pdfDoc.setFontSize(11)
    pdfDoc.setFont('helvetica', 'bold')
    pdfDoc.setTextColor('#000000')
    pdfDoc.text('Notice:', margin, yPosition)
    pdfDoc.setFont('helvetica', 'normal')
    pdfDoc.setTextColor('#323232')
    const noticeText = comp.notice || 'N/A'
    const noticeLines = pdfDoc.splitTextToSize(
      noticeText,
      pageWidth - 2 * margin
    )
    yPosition += 5
    noticeLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        pdfDoc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
          align: 'center'
        })
        pageNumber++
        pdfDoc.addPage()
        yPosition = margin
      }
      pdfDoc.text(line, margin, yPosition)
      yPosition += 5
    })
    yPosition += 5

    pdfDoc.setFontSize(11)
    pdfDoc.setFont('helvetica', 'bold')
    pdfDoc.setTextColor('#000000')
    pdfDoc.text('License:', margin, yPosition)
    pdfDoc.setFont('helvetica', 'normal')
    pdfDoc.setTextColor('#323232')
    const licenseExpText = comp.licensesExp || 'N/A'
    const licenseExpLines = pdfDoc.splitTextToSize(
      licenseExpText,
      pageWidth - 2 * margin
    )
    licenseExpLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        pdfDoc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
          align: 'center'
        })
        pageNumber++
        pdfDoc.addPage()
        yPosition = margin
      }
      pdfDoc.text(line, margin + 20, yPosition)
      yPosition += 5
    })
    yPosition += 8

    pdfDoc.setFontSize(11)
    pdfDoc.setFont('helvetica', 'bold')
    pdfDoc.setTextColor('#000000')
    pdfDoc.text('License Text:', margin, yPosition)
    pdfDoc.setFont('helvetica', 'normal')
    pdfDoc.setTextColor('#323232')
    const licenseText = comp.licenseText || 'N/A'
    const licenseLines = pdfDoc.splitTextToSize(
      licenseText,
      pageWidth - 2 * margin
    )
    yPosition += 5
    licenseLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        pdfDoc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
          align: 'center'
        })
        pageNumber++
        pdfDoc.addPage()
        yPosition = margin
      }
      pdfDoc.text(line, margin, yPosition)
      yPosition += 5
    })
    yPosition += 5

    pdfDoc.setFontSize(11)
    pdfDoc.setFont('helvetica', 'bold')
    pdfDoc.setTextColor('#000000')
    pdfDoc.text('Copyright:', margin, yPosition)
    pdfDoc.setFont('helvetica', 'normal')
    pdfDoc.setTextColor('#323232')
    const copyrightText = comp.copyright || 'N/A'
    const copyrightLines = pdfDoc.splitTextToSize(
      copyrightText,
      pageWidth - 2 * margin
    )
    copyrightLines.forEach((line) => {
      if (yPosition > pageHeight - 30) {
        pdfDoc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
          align: 'center'
        })
        pageNumber++
        pdfDoc.addPage()
        yPosition = margin
      }
      pdfDoc.text(line, margin + 20, yPosition)
      yPosition += 5
    })
    yPosition += 15

    // Check if the next section will overflow the page (with a bit of buffer)
    if (yPosition > pageHeight - 70) {
      pdfDoc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
        align: 'center'
      })
      pageNumber++
      pdfDoc.addPage()
      yPosition = margin
    }
  })

  // Add the final page number

  pdfDoc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
    align: 'center'
  })

  pdfDoc.save(filename)
}

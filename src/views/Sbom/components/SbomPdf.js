import InterlynkLogo from 'assets/img/logo.png'
import jsPDF from 'jspdf'

export const authorsList = (authors) => {
  let authorsString = ''
  authors.map((author, index) => {
    if (index === 0) {
      authorsString += `${author?.name}, `
    } else if (index === authorsList.length - 1) {
      authorsString += ` ${author?.name} `
    } else {
      authorsString += ` ${author?.name}, `
    }
  })
  return authorsString
}

export const downloadSbomPdf = (
  productName,
  version,
  description,
  purl,
  authors,
  sbom,
  componentsActual,
  vulnActual
) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const leftMargin = 10
  const rightMargin = 20
  const contentGap = 20
  let currentY = 90
  const bottomMargin = 20
  const productIcon = InterlynkLogo

  const formatValue = (
    value,
    doc,
    pageWidth,
    rightMargin,
    contentGap,
    leftMargin,
    padding = 5
  ) => {
    return doc.splitTextToSize(
      value,
      pageWidth - rightMargin - contentGap - leftMargin - padding
    )
  }

  const checkPageHeight = () => {
    if (currentY > pageHeight - bottomMargin) {
      doc.addPage()
      currentY = 10
    }
  }

  //Colors
  const blueColor = [49, 130, 206]
  const grayColor = [128, 128, 128]
  const darkGrayColor = [50, 50, 50]
  const blackColor = [0, 0, 0]

  const iconWidth = 25
  const iconHeight = 25
  const iconX = 5
  const iconY = 5

  doc.setTextColor(...blueColor)
  doc.setFontSize(24)
  doc.addImage(productIcon, 'JPEG', iconX, iconY, iconWidth, iconHeight)
  doc.text('Interlync', 30, 20)

  doc.setFontSize(14)
  doc.text('Software Bill of Materials (SBOM)', leftMargin + 55, 20)

  doc.setFontSize(24)
  doc.text(productName, leftMargin, 45)
  doc.setFontSize(16)
  doc.text(version, leftMargin, 55)

  doc.setLineWidth(0.1)
  doc.setDrawColor(...blackColor)
  doc.line(leftMargin, 60, pageWidth - rightMargin, 60)

  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  doc.text('General', leftMargin, 80) // General title after underline

  const labels = [
    'Product Name',
    'Product Version',
    'Description',
    'Unique Identifier',
    'Supplier',
    'Author(s)',
    'Manufacturer',
    '',
    'Creation Tool',
    'Created At',
    'Last Modified At',
    'Vulnerability Scan At',
    'Exported By',
    'Exported At'
  ]
  const values = [
    formatValue(
      productName || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      version || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      sbom?.primaryComponent?.description || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      sbom?.primaryComponent?.uniqueId || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      sbom.suppliers[0]?.contactName || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      authors || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin),
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin),
    formatValue(
      sbom.tools[0]?.name || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      sbom.createdAt || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      sbom.updatedAt || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin),
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin),
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin)
  ]

  // Set gray color for section labels on the left side
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)

  // Iterate over the labels and values, dynamically adjusting the Y-position
  labels.forEach((label, index) => {
    // Left-aligned label
    doc.text(label, leftMargin, currentY)

    // Set dark gray color for the corresponding value on the right
    doc.setTextColor(...darkGrayColor)

    // Calculate the X position for the value, leaving a small gap from the label
    const valueXPosition = leftMargin + 40

    // Add wrapped value below the label
    const valueLines = values[index]
    valueLines.forEach((line, lineIndex) => {
      doc.text(
        line,
        valueXPosition,
        currentY + lineIndex * 10 // Increment Y position for wrapped lines
      )
    })

    currentY += 10 + (valueLines.length - 1) * 10 // Adjust for wrapped lines

    doc.setTextColor(...grayColor)
    checkPageHeight()
  })
  checkPageHeight()

  //Components section
  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  currentY += 10
  if (componentsActual.length > 0) {
    doc.text('Components', leftMargin, currentY)
  }
  checkPageHeight()
  currentY += 10

  const componentLabels = [
    'Type',
    'Supplier',
    'Common Platform Enumeration (CPE)',
    'Package URL (PURL)',
    'Unique ID',
    'License',
    'Hashes'
  ]

  const getComponentValues = (component) => [
    formatValue(
      component.kind || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      component.suppliers[0]?.name || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      component.cpes[0] || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      component.purl || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      component.uniqueId || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      component.licensesExp || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin)
  ]

  doc.setTextColor(...grayColor)
  doc.setFontSize(10)

  const availableWidth = pageWidth - leftMargin - rightMargin - 110

  componentsActual.forEach((component) => {
    const componentName = formatValue(
      component.name,
      doc,
      pageWidth,
      80,
      80,
      leftMargin
    )
    const version = formatValue(
      component.version,
      doc,
      pageWidth,
      80,
      80,
      leftMargin
    )

    doc.text(componentName, leftMargin, currentY)
    let initialY = currentY
    currentY += componentName.length > 1 ? componentName.length * 5 : 5
    doc.text(version, leftMargin, currentY)

    currentY = initialY

    const componentValues = getComponentValues(component)

    componentLabels.forEach((label, index) => {
      doc.setTextColor(128, 128, 128)
      doc.text(label, leftMargin + 40, currentY)

      doc.setTextColor(50, 50, 50)
      const wrappedText = doc.splitTextToSize(
        componentValues[index],
        availableWidth
      )
      doc.text(wrappedText, leftMargin + 110, currentY)

      currentY += wrappedText.length > 1 ? wrappedText.length * 5 : 10
      checkPageHeight()
    })

    // Divider between components
    doc.setLineWidth(4)
    doc.setDrawColor(211, 211, 211)
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY)
    currentY += 15
  })

  //Vulnerabilities section
  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  currentY += 10
  if (vulnActual.length > 0) {
    doc.text('Vulnerabilities', leftMargin, currentY)
  }

  currentY += 10

  const VulnLabels = [
    'Short Description',
    'Component Name',
    'Component Version',
    'Source',
    'EPSS Percentile',
    'EPSS Probability',
    'Known Exploitable Vulnerability'
  ]

  const getVulnValues = (vulnerability) => [
    formatValue(
      vulnerability.vuln?.desc || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      vulnerability.component?.name || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      vulnerability.component?.version || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      vulnerability.vuln?.source || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      vulnerability.vuln?.vulnInfo?.epssPercentile || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin),
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin)
  ]

  doc.setTextColor(...grayColor)
  doc.setFontSize(10)

  vulnActual.forEach((vuln) => {
    const vulnId = formatValue(
      vuln.id || 'NA',
      doc,
      pageWidth,
      80,
      80,
      leftMargin
    )
    doc.text(vulnId, leftMargin, currentY)
    let initialY = currentY
    currentY += vulnId.length > 1 ? vulnId.length * 10 : 5
    currentY = initialY

    const vulnValues = getVulnValues(vuln)
    VulnLabels.forEach((label, index) => {
      doc.setTextColor(128, 128, 128) // Gray color
      doc.text(label, leftMargin + 40, currentY)
      doc.setTextColor(50, 50, 50) // Dark gray for values
      const wrappedText = doc.splitTextToSize(vulnValues[index], availableWidth)
      doc.text(wrappedText, leftMargin + 110, currentY)

      currentY += wrappedText.length > 1 ? wrappedText.length * 5 : 10
      checkPageHeight()
    })
    doc.setLineWidth(4)
    doc.setDrawColor(211, 211, 211) // Light gray color
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY)
    currentY += 15
  })

  doc.save(`${productName}.pdf`)
}

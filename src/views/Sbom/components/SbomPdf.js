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
  const pageHeight = doc.internal.pageSize.getHeight() // Get the page height
  const leftMargin = 10
  const rightMargin = 20
  const contentGap = 20 // Gap between left and right content
  let currentY = 90 // Starting Y-position for the first label
  const bottomMargin = 20 // Set a bottom margin to avoid overflow
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
    // Add a new page if currentY exceeds the page height minus the bottom margin
    if (currentY > pageHeight - bottomMargin) {
      doc.addPage()
      currentY = 10 // Reset Y position for the new page
    }
  }

  // Define colors
  const blueColor = [49, 130, 206]
  const grayColor = [128, 128, 128] // Slight gray color for left text
  const darkGrayColor = [50, 50, 50] // Slightly dark color for right text
  const blackColor = [0, 0, 0] // Black for lines and other sections

  const iconWidth = 25 // Reduced size (half the original 50)
  const iconHeight = 25
  const iconX = 5 // Adjusted X position to align it with the text
  const iconY = 5

  // Set blue color for the main title and set font size to 24pt
  doc.setTextColor(...blueColor)
  doc.setFontSize(24)
  doc.addImage(productIcon, 'JPEG', iconX, iconY, iconWidth, iconHeight)
  doc.text('Interlync', 30, 20) // Title position (aligned with icon)

  // Set blue color and font size for the subtitle
  doc.setFontSize(14)
  doc.text('Software Bill of Materials (SBOM)', leftMargin + 55, 20) // Subtext below title

  doc.setFontSize(24)
  doc.text(productName, leftMargin, 45)
  doc.setFontSize(16)
  doc.text(version, leftMargin, 55)

  // Set black color for divider line
  doc.setLineWidth(0.1)
  doc.setDrawColor(...blackColor) // Black color for the line
  doc.line(leftMargin, 60, pageWidth - rightMargin, 60) // Horizontal line

  // Set blue color for "General" title and position it after the underline
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
    const valueXPosition = leftMargin + 40 // Adjust this value as needed for spacing

    // Add wrapped value below the label
    const valueLines = values[index]
    valueLines.forEach((line, lineIndex) => {
      doc.text(
        line,
        valueXPosition,
        currentY + lineIndex * 10 // Increment Y position for wrapped lines
      )
    })

    // Increase the Y-position for the next label-value pair
    currentY += 10 + (valueLines.length - 1) * 10 // Adjust for wrapped lines

    // Reset the text color for the next label
    doc.setTextColor(...grayColor)
    checkPageHeight()
  })
  checkPageHeight()

  //Components section
  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  currentY += 10 // Spacing after "General" section
  doc.text('Components', leftMargin, currentY)
  checkPageHeight()
  currentY += 10
  // Process each component from the fetched data
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
    formatValue('', doc, pageWidth, rightMargin, contentGap, leftMargin) // Placeholder for hashes
  ]

  doc.setTextColor(...grayColor)
  doc.setFontSize(10)

  const availableWidth = pageWidth - leftMargin - rightMargin - 110
  // Iterate over the labels and values, dynamically adjusting the Y-position
  componentsActual.forEach((component) => {
    // Display the component name and version
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

    // Iterate over labels and values for each component
    componentLabels.forEach((label, index) => {
      doc.setTextColor(128, 128, 128) // Gray color
      doc.text(label, leftMargin + 40, currentY)

      doc.setTextColor(50, 50, 50) // Dark gray for values
      const wrappedText = doc.splitTextToSize(
        componentValues[index],
        availableWidth
      )
      doc.text(wrappedText, leftMargin + 110, currentY)
      console.log(wrappedText.length)

      currentY += wrappedText.length > 1 ? wrappedText.length * 5 : 10
      checkPageHeight()
    })

    // Divider between components
    doc.setLineWidth(4)
    doc.setDrawColor(211, 211, 211) // Light gray color
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY)
    currentY += 15
  })

  //Vulnerabilities section
  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  currentY += 10 // Spacing after "General" section
  doc.text('Vulnerabilities', leftMargin, currentY)
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
      vulnerability.vuln.desc || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      vulnerability.component.name || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      vulnerability.component.version || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      vulnerability.vuln.source || 'NA',
      doc,
      pageWidth,
      rightMargin,
      contentGap,
      leftMargin
    ),
    formatValue(
      vulnerability.vuln.vulnInfo.epssPercentile || 'NA',
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

  // Save the PDF with the product name as the filename
  doc.save(`${productName}.pdf`)
}

import InterlynkLogo from 'assets/img/logo.png'
import jsPDF from 'jspdf'
import { listItemsForDoc } from 'utils'

import {
  componentLabels,
  excludeStatusLabels,
  excludeStatusNotesLabels,
  formatManufacturerContacts,
  generalLabels,
  generalValues,
  getComponentValues,
  getVulnValues
} from '../../../utils/DownloadUtils/pdfUtils'

export const downloadSbomPdf = (
  productName,
  version,
  productDescription,
  sbom,
  componentsActual,
  vulnActual,
  exportedBy,
  manufacturerData,
  excludeVulnStatus,
  excludeStatusNotes,
  includeParts
) => {
  const parentSbom = sbom?.project.projectGroup.name
  const authors = listItemsForDoc(sbom?.authors, 'name')
  const tools = listItemsForDoc(sbom?.tools, 'name', 'version')

  const doc = new jsPDF({ compress: true })
  const pageWidth = doc.internal.pageSize.getWidth()
  const leftMargin = 10
  const rightMargin = 20
  const contentGap = 20
  let currentY
  const productIcon = InterlynkLogo

  const LINE_HEIGHT_10PT = 7

  const MAX_CONTENT_Y = 270

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

  //Colors
  const blueColor = [61, 113, 238]
  const grayColor = [128, 128, 128]
  const darkGrayColor = [50, 50, 50]
  const blackColor = [0, 0, 0]

  const iconWidth = 12
  const iconHeight = 12
  const iconX = 9
  const iconY = 12

  doc.page = 1

  function footer() {
    doc.setLineWidth(2)
    doc.setDrawColor(...blueColor)

    // Draw the line at the footer
    doc.line(leftMargin, 285, pageWidth - rightMargin, 285)
    doc.setTextColor(...darkGrayColor)
    doc.setFontSize(10)
    doc.text(180, 295, 'page ' + doc.page)
    doc.page++
  }

  // checkPageHeight  to trigger a new page if currentY is too close to the footer
  const checkPageHeight = (minimumRequiredSpace = LINE_HEIGHT_10PT) => {
    if (currentY + minimumRequiredSpace > MAX_CONTENT_Y) {
      doc.addPage()
      footer()

      // Set color and font for header
      doc.setTextColor(...blueColor)
      doc.setFontSize(24)

      // Add Interlynk icon and title at the top
      doc.addImage(productIcon, 'JPEG', iconX, iconY, iconWidth, iconHeight)
      doc.text('Interlynk', 22, 21)

      const sbomSubText = `${productName}: ${version}`
      doc.setFontSize(14)
      doc.text(sbomSubText, 155, 20)

      // Reset vertical position for the new page content
      currentY = 30 // Adjusted to account for single-line header
      doc.setFontSize(10)
      doc.setTextColor(...darkGrayColor)
    }
  }

  doc.setFontSize(10)
  footer()
  doc.setTextColor(...blueColor)
  doc.setFontSize(24)
  doc.addImage(productIcon, 'JPEG', iconX, iconY, iconWidth, iconHeight)
  doc.text('Interlynk', 22, 21)

  const sbomSubText = 'Software Bill of Materials (SBOM)'
  const sbomSubTextWidth = doc.getTextWidth(sbomSubText)
  const rightAlignedX = pageWidth - sbomSubTextWidth - leftMargin

  doc.setFontSize(14)
  doc.text(sbomSubText, rightAlignedX + 45, 21)

  currentY = 45
  doc.setFontSize(24)
  doc.text(productName, leftMargin, currentY)

  currentY += 10
  doc.setFontSize(16)
  doc.text(version, leftMargin, currentY)

  currentY += 5

  doc.setLineWidth(0.1)
  doc.setDrawColor(...blackColor)
  doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY)

  currentY += 20

  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  doc.text('General', leftMargin, currentY)

  const labels = generalLabels

  const organizationContactsArray =
    manufacturerData?.project?.projectSetting?.organizationManufacturer
      ?.organizationContacts || []

  const manufacturerContacts = formatManufacturerContacts(
    organizationContactsArray
  )

  const config = { doc, pageWidth, rightMargin, contentGap, leftMargin }

  const values = generalValues({
    productName,
    version,
    productDescription,
    sbom,
    authors,
    manufacturerData,
    manufacturerContacts,
    tools,
    exportedBy,
    config
  })

  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  currentY += 10

  // Iterate over the labels and values, dynamically adjusting the Y-position
  labels.forEach((label, index) => {
    checkPageHeight(LINE_HEIGHT_10PT * 2)
    doc.text(label, leftMargin, currentY)
    doc.setTextColor(...darkGrayColor)

    const valueLines = values?.[index]
      ? formatValue(
          values?.[index]?.join(' ') || '',
          doc,
          pageWidth,
          rightMargin,
          contentGap,
          leftMargin
        )
      : ['']

    valueLines.forEach((line, lineIndex) => {
      checkPageHeight()
      const lineWidth = doc.getTextWidth(line)
      const rightAlignedX = pageWidth - rightMargin - lineWidth
      doc.text(line, rightAlignedX, currentY + lineIndex * LINE_HEIGHT_10PT)
    })

    currentY += valueLines.length * LINE_HEIGHT_10PT
    doc.setTextColor(...grayColor)
  })

  // Force a page break after General section
  doc.addPage()
  footer()
  // Set up the new page (header, font, color, etc.)
  doc.setTextColor(...blueColor)
  doc.setFontSize(24)
  doc.addImage(productIcon, 'JPEG', iconX, iconY, iconWidth, iconHeight)
  doc.text('Interlynk', 22, 21)
  doc.setFontSize(14)
  doc.text(`${productName}: ${version}`, 155, 20)
  currentY = 30
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)

  //Components section
  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  currentY += 10
  if (componentsActual.length > 0) {
    checkPageHeight(LINE_HEIGHT_10PT * 2)
    doc.text('Components', leftMargin, currentY)
  }
  currentY += 10

  doc.setTextColor(...grayColor)
  doc.setFontSize(10)

  const availableWidthForComponentFields =
    pageWidth - leftMargin - rightMargin - 20

  componentsActual.forEach((component) => {
    // Component Description
    const componentText =
      component.sbom?.project?.projectGroup?.name === parentSbom
        ? `${component.name} - ${component.version}`
        : includeParts
          ? `${component.sbom?.project?.projectGroup?.name || ''}: ${component.name} - ${component.version}`
          : `${component.name} - ${component.version}`

    const componentDescLines = doc.splitTextToSize(componentText)

    checkPageHeight(componentDescLines.length * LINE_HEIGHT_10PT * 1.5)

    doc.setTextColor(...grayColor)
    doc.setFontSize(12)
    doc.text(componentDescLines, leftMargin + 10, currentY)
    currentY += componentDescLines.length * LINE_HEIGHT_10PT * 1.5

    // Iterate through component labels and values
    const componentValues = getComponentValues(component, config)
    componentLabels.forEach((label, index) => {
      const value = componentValues?.[index] || ''

      doc.setTextColor(...darkGrayColor)
      doc.setFontSize(10)

      doc.setFont(undefined, 'bold')
      const labelWidth = doc.getTextWidth(`${label}: `)
      doc.setFont(undefined, 'normal')
      const wrappedText = doc.splitTextToSize(
        value,
        availableWidthForComponentFields - labelWidth
      )

      const totalLines = wrappedText.length > 0 ? wrappedText.length : 1
      checkPageHeight(totalLines * LINE_HEIGHT_10PT)

      doc.setFont(undefined, 'bold')
      doc.text(`${label}: `, leftMargin + 10, currentY)

      doc.setFont(undefined, 'normal')
      wrappedText.forEach((line, lineIndex) => {
        const xPos =
          lineIndex === 0 ? leftMargin + 10 + labelWidth : leftMargin + 10
        doc.text(line, xPos, currentY + lineIndex * LINE_HEIGHT_10PT)
      })
      currentY += totalLines * LINE_HEIGHT_10PT
    })

    // Divider between components
    currentY += 5 //
    checkPageHeight(15)
    doc.setLineWidth(2)
    doc.setDrawColor(225, 225, 225)
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY)
    currentY += 15
  })
  checkPageHeight() // One final check after components section

  //Vulnerabilities section
  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  currentY += 10
  if (vulnActual.length > 0) {
    checkPageHeight(LINE_HEIGHT_10PT * 2)
    doc.text('Vulnerabilities', leftMargin, currentY)
  }
  currentY += 10

  doc.setTextColor(...grayColor)
  doc.setFontSize(10)

  const availableWidthForVulnFields = pageWidth - leftMargin - rightMargin - 20

  vulnActual.forEach((vuln) => {
    const allVulnLabels = [
      'Short Description',
      'Component Name',
      'Component Version',
      'Source',
      'EPSS Percentile',
      'EPSS Probability',
      'Known Exploitable Vulnerability',
      'Status',
      'Justification',
      'Impact Statement',
      'Action Statement',
      'Internal Notes'
    ]

    if (excludeVulnStatus) {
      const customFieldLabels =
        vuln?.componentVulnCustomFields?.map(
          (field) =>
            field?.componentVulnCustomFieldDefinition?.displayName || 'NA'
        ) || []
      allVulnLabels.push(...customFieldLabels)
    }
    allVulnLabels.push('Created By', 'Created On')

    const vulnValues = getVulnValues(vuln, excludeVulnStatus, config)

    // 1. Draw Vulnerability ID
    const projectGroupName =
      vuln.component?.sbom?.project?.projectGroup?.name || ''
    const componentName = vuln.component?.name || ''
    const vulnId = vuln.vuln?.vulnId

    const vulnText =
      projectGroupName === parentSbom
        ? `${vulnId}`
        : includeParts
          ? `${projectGroupName}: ${componentName} - ${vulnId}`
          : `${vulnId}`
    const vulnIdPlusPartsLines = doc.splitTextToSize(vulnText || 'NA')

    checkPageHeight(vulnIdPlusPartsLines.length * LINE_HEIGHT_10PT * 1.5)

    doc.setTextColor(...grayColor)
    doc.setFontSize(12)
    doc.text(vulnIdPlusPartsLines, leftMargin + 10, currentY)
    currentY += vulnIdPlusPartsLines.length * LINE_HEIGHT_10PT * 1.5

    allVulnLabels.forEach((label, index) => {
      if (
        (excludeVulnStatus &&
          excludeStatusLabels.includes(label.toLowerCase())) ||
        (excludeStatusNotes &&
          excludeStatusNotesLabels.includes(label.toLowerCase()))
      ) {
        return
      }

      const value = vulnValues?.[index] || ''

      doc.setTextColor(...darkGrayColor)
      doc.setFontSize(10)

      doc.setFont(undefined, 'bold')
      const labelWidth = doc.getTextWidth(`${label}: `)
      doc.setFont(undefined, 'normal')
      const wrappedText = doc.splitTextToSize(
        value,
        availableWidthForVulnFields - labelWidth
      )

      doc.setFont(undefined, 'bold')

      checkPageHeight()
      doc.text(`${label}: `, leftMargin + 10, currentY)
      // Draw the value (normal)
      doc.setFont(undefined, 'normal')
      wrappedText.forEach((line, lineIndex) => {
        checkPageHeight()
        const xPos =
          lineIndex === 0 ? leftMargin + 10 + labelWidth : leftMargin + 10
        doc.text(line, xPos, currentY)
        currentY += LINE_HEIGHT_10PT
      })
    })

    // 3. Draw Divider
    currentY += 5 // Add a small padding before the divider
    checkPageHeight(15)
    doc.setLineWidth(2)
    doc.setDrawColor(225, 225, 225)
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY)
    currentY += 15
  })

  doc.save(`${productName}-${version}.pdf`)
}

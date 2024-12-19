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
} from '../DownloadUtils/pdfUtils'

export const downloadSbomPdf = (
  productName,
  version,
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
    doc.setLineWidth(6)
    doc.setDrawColor(...blueColor)

    // Draw the line at the footer
    doc.line(leftMargin, 285, pageWidth - rightMargin, 285)
    doc.setTextColor(...darkGrayColor)
    doc.setFontSize(10)
    doc.text(180, 295, 'page ' + doc.page)
    doc.page++
  }

  const checkPageHeight = () => {
    if (currentY > 260) {
      doc.addPage()
      footer()

      // Set color and font for header
      doc.setTextColor(...blueColor)
      doc.setFontSize(24)

      // Add Interlynk icon and title at the top
      doc.addImage(productIcon, 'JPEG', iconX, iconY, iconWidth, iconHeight)
      doc.text('Interlynk', 22, 21)

      const availableWidth = pageWidth - leftMargin - rightMargin - 100
      const sbomSubText = `${productName}: ${version}`
      let wrappedText = doc.splitTextToSize(sbomSubText, availableWidth)
      if (wrappedText.length > 3) {
        wrappedText = [
          wrappedText[0],
          `${wrappedText[1]}...`,
          wrappedText[wrappedText.length - 1]
        ]
      }

      let yPosition = 20
      doc.setFontSize(14)
      wrappedText.forEach((line, index) => {
        if (index === wrappedText.length - 1 && index !== 0) {
          yPosition += 5
        } else {
          yPosition += index * 5
        }
        doc.text(line, 155, yPosition)
      })

      // Reset vertical position for the new page content
      currentY = yPosition + 20
      doc.setFontSize(10)
      doc.setTextColor(...grayColor)
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

  const availableWidthForProductName = pageWidth - leftMargin - rightMargin - 20
  const wrappedProductName = doc.splitTextToSize(
    productName,
    availableWidthForProductName
  )
  currentY = 45
  wrappedProductName.forEach((line, index) => {
    doc.setFontSize(24)
    currentY += index * 10
    doc.text(line, leftMargin, currentY)
  })
  currentY += 10
  const wrappedVersionName = doc.splitTextToSize(
    version,
    availableWidthForProductName
  )

  wrappedVersionName.forEach((line, index) => {
    doc.setFontSize(16)
    currentY += index * 10
    doc.text(line, leftMargin, currentY)
  })

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
    sbom,
    authors,
    manufacturerData,
    manufacturerContacts,
    tools,
    exportedBy,
    config
  })

  // Set gray color for section labels on the left side
  doc.setTextColor(...grayColor)
  doc.setFontSize(10)
  currentY += 10

  // Iterate over the labels and values, dynamically adjusting the Y-position
  labels.forEach((label, index) => {
    // Left-aligned label
    doc.text(label, leftMargin, currentY)

    // Set dark gray color for the corresponding value on the right
    doc.setTextColor(...darkGrayColor)

    // Add wrapped value below the label
    const valueLines = values[index]
    valueLines.forEach((line, lineIndex) => {
      const lineWidth = doc.getTextWidth(line)
      const rightAlignedX = pageWidth - rightMargin - lineWidth
      doc.text(
        line,
        rightAlignedX,
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

  doc.setTextColor(...grayColor)
  doc.setFontSize(10)

  const availableWidth = pageWidth - leftMargin - rightMargin - 110

  componentsActual.forEach((component) => {
    const projectGroupName = component.sbom?.project?.projectGroup?.name || ''
    const componentName = component.name
    const componentText =
      projectGroupName === parentSbom
        ? `${componentName} - ${component.version}`
        : includeParts
          ? `${projectGroupName}: ${componentName} - ${component.version}`
          : `${componentName} - ${component.version}`
    const componentDesc = formatValue(
      componentText,
      doc,
      pageWidth,
      80,
      80,
      leftMargin
    )

    doc.setTextColor(...grayColor)
    doc.text(componentDesc, leftMargin, currentY)
    let initialY = currentY
    currentY += componentDesc.length > 1 ? componentDesc.length * 5 : 5

    currentY = initialY

    const componentValues = getComponentValues(component, config)

    componentLabels.forEach((label, index) => {
      doc.setTextColor(...grayColor)
      doc.text(label, leftMargin + 40, currentY)

      doc.setTextColor(...darkGrayColor)
      const wrappedText = doc.splitTextToSize(
        componentValues[index],
        availableWidth
      )
      const rightAlignedX =
        pageWidth - rightMargin - doc.getTextWidth(wrappedText.join(''))
      if (wrappedText.length > 1) {
        doc.text(wrappedText, leftMargin + 110, currentY)
      } else {
        doc.text(wrappedText, rightAlignedX, currentY)
      }

      currentY += wrappedText.length > 1 ? wrappedText.length * 5 : 10
      checkPageHeight()
    })
    checkPageHeight()

    // Divider between components
    doc.setLineWidth(6)
    doc.setDrawColor(225, 225, 225)

    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY)
    currentY += 15
  })
  checkPageHeight()

  //Vulnerabilities section
  doc.setTextColor(...blueColor)
  doc.setFontSize(14)
  currentY += 10
  if (vulnActual.length > 0) {
    doc.text('Vulnerabilities', leftMargin, currentY)
  }
  checkPageHeight()

  currentY += 10

  doc.setTextColor(...grayColor)
  doc.setFontSize(10)

  vulnActual.forEach((vuln) => {
    const VulnLabels = [
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

    // Insert custom field labels dynamically
    if (excludeVulnStatus) {
      const customFieldLabels =
        vuln?.componentVulnCustomFields?.map(
          (field) =>
            field?.componentVulnCustomFieldDefinition?.displayName || 'NA'
        ) || []

      VulnLabels.push(...customFieldLabels)
    }

    // Add the remaining labels
    VulnLabels.push('Created By', 'Created On')

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
    const vulnIdPlusParts = formatValue(
      vulnText || 'NA',
      doc,
      pageWidth,
      80,
      80,
      leftMargin
    )
    doc.setTextColor(...grayColor)
    doc.text(vulnIdPlusParts, leftMargin, currentY)
    let initialY = currentY
    currentY += vulnIdPlusParts.length > 1 ? vulnIdPlusParts.length * 10 : 5
    currentY = initialY

    const vulnValues = getVulnValues(vuln, excludeVulnStatus, config)
    VulnLabels.forEach((label, index) => {
      if (
        !excludeVulnStatus &&
        excludeStatusLabels.includes(label.toLowerCase())
      ) {
        return
      }

      if (
        !excludeStatusNotes &&
        excludeStatusNotesLabels.includes(label.toLowerCase())
      ) {
        return
      }
      doc.setTextColor(...grayColor) // Gray color
      doc.text(label, leftMargin + 40, currentY)
      doc.setTextColor(...darkGrayColor) // Dark gray for values
      const wrappedText = doc.splitTextToSize(vulnValues[index], availableWidth)
      const rightAlignedX =
        pageWidth - rightMargin - doc.getTextWidth(wrappedText.join(''))
      /* doc.text(wrappedText, leftMargin + 110, currentY) */
      if (wrappedText.length > 1) {
        // If wrappedText has more than one line, place it at the left position
        doc.text(wrappedText, leftMargin + 110, currentY)
      } else {
        // If wrappedText has exactly one line, place it right-aligned
        doc.text(wrappedText, rightAlignedX, currentY)
      }

      currentY += wrappedText.length > 1 ? wrappedText.length * 5 : 10
      checkPageHeight()
    })
    checkPageHeight()
    doc.setLineWidth(6)
    doc.setDrawColor(225, 225, 225)
    checkPageHeight()

    // Light gray color
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY)
    currentY += 15
  })

  doc.save(`${productName}-${version}.pdf`)
}

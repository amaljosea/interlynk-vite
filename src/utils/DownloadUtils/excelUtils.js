import * as XLSX from 'xlsx-js-style'
import { gql } from '@apollo/client'
import { client } from 'context/ApolloWrapper'
import { currentDateTime, formatDateWithTimeZone, listItemsForDoc } from 'utils'

const GetComponentData = gql`
  query GetComponentData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $after: String
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      components(sbomId: $sbomId, first: $first, after: $after) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          id
          name
          version
          kind
          purl
          cpes
          uniqueId
          licensesExp
          suppliers {
            name
          }
        }
      }
    }
  }
`

const GetVulnData = gql`
  query GetVulnData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $after: String
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      vulns(sbomId: $sbomId, first: $first, after: $after) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          id
          impact
          note
          actionStmt
          vuln {
            vulnId
            desc
            source
            publishedAt
            vulnInfo {
              epssPercentile
              epssScores
              kev
            }
          }
          component {
            name
            version
          }
          vexStatus {
            name
          }
          vexJustification {
            name
          }
        }
      }
    }
  }
`

const getMaxContentWidths = (data) => {
  const columnWidths = []
  if (data.length === 0) return columnWidths

  // Iterate over the keys of the first object to initialize column widths
  Object.keys(data[0]).forEach((key, index) => {
    let maxWidth = key.length // Start with the header length
    data.forEach((row) => {
      const cellValue = row[key] ? row[key].toString() : ''
      maxWidth = Math.max(maxWidth, cellValue.length)
    })
    columnWidths[index] = maxWidth + 2 // Add padding
  })

  return columnWidths
}

// Set column widths
const setColumnWidths = (worksheet, data) => {
  const widths = getMaxContentWidths(data)
  worksheet['!cols'] = widths.map((width) => ({ wch: width }))
}

//Function to style the headers
function styleExcelHeaders(worksheet, headers, styles = {}) {
  const {
    fontSize = 12,
    bold = true,
    fontColor = '1A202C', // Default dark text color
    backgroundColor = 'ADC6F9', // Default light blue background
    patternType = 'solid'
  } = styles

  headers.forEach((header, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index }) // r: row, c: column
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: {
          sz: fontSize,
          bold: bold,
          color: { rgb: fontColor }
        },
        fill: {
          patternType: patternType,
          fgColor: { rgb: backgroundColor }
        }
      }
    }
  })
}

export const exportExcel = async (
  setIsLoading,
  productName,
  version,
  manufacturerData,
  sbom,
  organization,
  productId,
  sbomId
) => {
  setIsLoading(true)
  const fileName = `${productName}-${version}.xlsx`
  const authors = listItemsForDoc(sbom?.authors, 'name')
  const organizationContactsArray =
    manufacturerData?.project?.projectSetting?.organizationManufacturer
      ?.organizationContacts || []
  const manufacturerContacts = organizationContactsArray.map((item) => {
    let manuString = ''

    if (item.name) manuString += `Name: ${item.name}`
    if (item.phone)
      manuString += (manuString ? ', ' : '') + `Phone: ${item.phone}`
    if (item.email)
      manuString += (manuString ? ', ' : '') + `Email: ${item.email}`

    return manuString
  })
  const tools = listItemsForDoc(sbom?.tools, 'name', 'version')
  // First sheet data
  const dataForSheetOne = [
    ['Interlynk', ''],
    ['Product Name', productName],
    ['Product Version', version],
    ['Description', sbom?.primaryComponent?.description || 'NA'],
    ['Unique Identifier', sbom?.primaryComponent?.uniqueId || 'NA'],
    ['Supplier', sbom?.suppliers?.[0]?.name || 'NA'],
    ['Authors', authors || 'NA'],
    [
      'Manufacturer',
      manufacturerData?.project?.projectSetting?.organizationManufacturer
        ?.organizationName || 'NA'
    ],
    ['Manufacturer Contacts', manufacturerContacts],
    ['Creation Tool', tools],
    ['Created At', formatDateWithTimeZone(sbom.createdAt) || 'NA'],
    ['Last Modified At', formatDateWithTimeZone(sbom.updatedAt) || 'NA'],
    ['Vulnerability Scan At', formatDateWithTimeZone(sbom.updatedAt) || 'NA'],
    ['Exported By', organization?.currentUser.name],
    ['Exported At', currentDateTime()]
  ]

  // Second sheet data
  let allComponents = []
  let componentsHasNextPage = true
  let componentsEndCursor = null

  try {
    while (componentsHasNextPage) {
      const componentsRes = await client.query({
        query: GetComponentData,
        variables: {
          projectId: productId,
          sbomId,
          first: 200,
          after: componentsEndCursor || undefined
        },
        fetchPolicy: 'no-cache'
      })

      const fetchedComponents =
        componentsRes?.data?.sbom?.components?.nodes || []
      const pageInfo = componentsRes?.data?.sbom?.components?.pageInfo

      allComponents.push(...fetchedComponents)
      componentsEndCursor = pageInfo?.endCursor
      componentsHasNextPage = pageInfo?.hasNextPage
    }
  } catch (error) {
    setIsLoading(false)
  }

  const dataForSheetTwo = allComponents.map((component) => ({
    'Component Name': component.name,
    Version: component.version,
    Type: component?.kind || 'NA',
    Supplier:
      Array.isArray(component?.suppliers) && component.suppliers[0]?.name
        ? component.suppliers[0].name
        : 'NA',
    'Common Platform Enumeration (CPE)':
      Array.isArray(component?.cpes) && component.cpes[0]
        ? component.cpes[0]
        : 'NA',
    'Package URL (PURL)': component?.purl || 'NA',

    'Relationship Type': component?.uniqueId || 'NA',
    License: component?.licensesExp || 'NA'
  }))

  // Third sheet data
  let allVulns = []
  let vulnsHasNextPage = true
  let vulnsEndCursor = null

  try {
    while (vulnsHasNextPage) {
      const vulnRes = await client.query({
        query: GetVulnData,
        variables: {
          projectId: productId,
          sbomId,
          first: 200,
          after: vulnsEndCursor || undefined
        },
        fetchPolicy: 'no-cache'
      })

      const fetchedVulns = vulnRes?.data?.sbom?.vulns?.nodes || []
      const pageInfo = vulnRes?.data?.sbom?.vulns?.pageInfo

      allVulns.push(...fetchedVulns)
      vulnsEndCursor = pageInfo?.endCursor
      vulnsHasNextPage = pageInfo?.hasNextPage
    }
  } catch (error) {
    setIsLoading(false)
  }

  const dataForSheetThree = allVulns.map((vulnerability) => ({
    'Vulnerability ID': vulnerability.vuln?.vulnId || 'NA',
    'Short Description': vulnerability?.vuln?.desc || 'NA',
    'Component Name': vulnerability?.component?.name || 'NA',
    'Component Version': vulnerability?.component?.version || 'NA',
    Source: vulnerability?.vuln?.source || 'NA',
    'EPSS Percentile':
      (vulnerability?.vuln?.vulnInfo?.epssPercentile * 100).toFixed() + '%' ||
      'NA',
    'EPSS Probability':
      vulnerability?.vuln?.vulnInfo?.epssScores?.[0] != null
        ? (vulnerability.vuln.vulnInfo.epssScores[0] * 100).toFixed(3) + '%'
        : 'NA',
    'Known Exploitable Vulnerability':
      vulnerability?.vuln?.vulnInfo?.kev === true ? 'Yes' : 'No' || 'NA',
    Status: vulnerability?.vexStatus?.name || 'Unspecified',
    Justification: vulnerability?.vexJustification?.name || 'NA',
    'Impact Statement': vulnerability?.impact || 'NA',
    'Action Statement': vulnerability?.actionStmt || 'NA',
    'Internal Notes': vulnerability?.note || 'NA',
    'Created on':
      formatDateWithTimeZone(vulnerability?.vuln?.publishedAt) || 'NA'
  }))

  let worksheetTwo = []
  let worksheetThree = []

  // Convert data array to worksheet
  const worksheetOne = XLSX.utils.aoa_to_sheet(dataForSheetOne)

  // Merge the first row (A1 and B1)
  worksheetOne['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } } // Merge from A1 to B1
  ]

  // Style the logo cell
  worksheetOne['A1'].s = {
    font: {
      bold: true,
      sz: 50, // Huge font size
      color: { rgb: 'FFFFFF' }
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center'
    },
    fill: {
      fgColor: { rgb: '3182ce' } // Slight blue background
    }
  }

  // Style other rows
  dataForSheetOne.slice(1).forEach((_, rowIndex) => {
    const rowCell = XLSX.utils.encode_cell({ r: rowIndex + 1, c: 0 }) // Keys column
    const valueCell = XLSX.utils.encode_cell({ r: rowIndex + 1, c: 1 }) // Values column

    if (worksheetOne[rowCell]) {
      worksheetOne[rowCell].s = {
        font: { bold: true, sz: 13 },
        alignment: { horizontal: 'left', vertical: 'center' },
        fill: {
          fgColor: { rgb: 'DDEBF7' } // Slight blue background
        }
      }
    }
    if (worksheetOne[valueCell]) {
      worksheetOne[valueCell].s = {
        alignment: { horizontal: 'left', vertical: 'center' }
      }
    }
  })

  // Adjust column widths
  worksheetOne['!cols'] = [
    { wch: 20 }, // Width for keys
    { wch: 50 } // Width for values
  ]

  if (dataForSheetTwo.length > 0) {
    worksheetTwo = XLSX.utils.json_to_sheet(dataForSheetTwo)
    const headerKeysTwo = Object.keys(dataForSheetTwo[0])
    styleExcelHeaders(worksheetTwo, headerKeysTwo, {
      fontSize: 13,
      bold: true,
      fontColor: '1A202C', // Black text
      backgroundColor: 'C6EBC9' // Green background
    })
    setColumnWidths(worksheetTwo, dataForSheetTwo)
  }
  if (dataForSheetThree.length > 0) {
    worksheetThree = XLSX.utils.json_to_sheet(dataForSheetThree)
    const headerKeysThree = Object.keys(dataForSheetThree[0])
    styleExcelHeaders(worksheetThree, headerKeysThree, {
      fontSize: 13,
      bold: true,
      fontColor: '1A202C', // Black text
      backgroundColor: 'F9D6D6' // Red background
    })
    setColumnWidths(worksheetThree, dataForSheetThree)
  }

  // Create a workbook and append the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheetOne, 'General')
  if (dataForSheetTwo.length > 0) {
    XLSX.utils.book_append_sheet(workbook, worksheetTwo, 'Components')
  }
  if (dataForSheetThree.length > 0) {
    XLSX.utils.book_append_sheet(workbook, worksheetThree, 'Vulnerabilities')
  }

  // Write the workbook to a file
  XLSX.writeFile(workbook, fileName)
  setIsLoading(false)
}

import * as XLSX from 'xlsx'
import { client } from 'context/ApolloWrapper'
import { currentDateTime, formatDateWithTimeZone, listItemsForDoc } from 'utils'

import { GetComponentData, GetVulnData } from 'graphQL/Queries'

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
    {
      'Product Name': productName,
      'Product Version': version,
      Description: sbom?.primaryComponent?.description || 'NA',
      'Unique Identifier': sbom?.primaryComponent?.uniqueId || 'NA',
      Supplier: sbom?.suppliers?.[0]?.name || 'NA',
      Authors: authors || 'NA',
      Manufacturer:
        manufacturerData?.project?.projectSetting?.organizationManufacturer
          ?.organizationName || 'NA',
      'Manufacturer Contacts': manufacturerContacts,
      'Creation Tool': tools,
      'Created At': formatDateWithTimeZone(sbom.createdAt) || 'NA',
      'Last Modified At': formatDateWithTimeZone(sbom.updatedAt) || 'NA',
      'Vulnerability Scan At': formatDateWithTimeZone(sbom.updatedAt) || 'NA',
      'Exported By': organization?.currentUser.name,

      'Exported At': currentDateTime()
    }
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
    console.error('Error fetching components:', error)
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
    console.error('Error fetching vulnerabilities:', error)
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
      (vulnerability?.vuln?.vulnInfo?.epssScores[0] * 100).toFixed(3) + '%' ||
      'NA',
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

  // Convert data array to worksheet
  const worksheetOne = XLSX.utils.json_to_sheet(dataForSheetOne)
  setColumnWidths(worksheetOne, dataForSheetOne)
  const worksheetTwo = XLSX.utils.json_to_sheet(dataForSheetTwo)
  setColumnWidths(worksheetTwo, dataForSheetTwo)
  const worksheetThree = XLSX.utils.json_to_sheet(dataForSheetThree)
  setColumnWidths(worksheetThree, dataForSheetThree)
  // Create a workbook and append the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheetOne, 'Meta Data')
  XLSX.utils.book_append_sheet(workbook, worksheetTwo, 'Components')
  XLSX.utils.book_append_sheet(workbook, worksheetThree, 'Vulnerabilities')
  // Write the workbook to a file
  XLSX.writeFile(workbook, fileName)
  setIsLoading(false)
}

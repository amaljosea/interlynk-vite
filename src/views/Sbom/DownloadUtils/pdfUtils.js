import { currentDateTime, formatDateWithTimeZone } from 'utils'

//Format and return the manufacturuer contact list
export const formatManufacturerContacts = (organizationContactsArray) => {
  return organizationContactsArray?.map((item) => {
    let manuString = ''

    if (item.name) manuString += `Name: ${item.name}`
    if (item.phone)
      manuString += (manuString ? ', ' : '') + `Phone: ${item.phone}`
    if (item.email)
      manuString += (manuString ? ', ' : '') + `Email: ${item.email}`

    return manuString
  })
}

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

const getFormattedValue = (value, config) => {
  const { doc, pageWidth, rightMargin, contentGap, leftMargin } = config

  return formatValue(
    value || 'NA',
    doc,
    pageWidth,
    rightMargin,
    contentGap,
    leftMargin
  )
}

export const generalLabels = [
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

export const componentLabels = [
  'Type',
  'Supplier',
  'Common Platform Enumeration (CPE)',
  'Package URL (PURL)',
  'Relationship Type',
  'License'
]

export const generalValues = ({
  productName,
  productDescription,
  version,
  sbom,
  authors,
  manufacturerData,
  manufacturerContacts,
  tools,
  exportedBy,
  config
}) => [
  getFormattedValue(productName, config),
  getFormattedValue(version, config),
  getFormattedValue(productDescription, config),
  getFormattedValue(sbom?.primaryComponent?.uniqueId, config),
  getFormattedValue(sbom?.suppliers[0]?.name, config),
  getFormattedValue(authors, config),
  getFormattedValue(
    manufacturerData?.project?.projectSetting?.organizationManufacturer
      ?.organizationName,
    config
  ),
  getFormattedValue(manufacturerContacts, config),
  getFormattedValue(tools, config),
  getFormattedValue(formatDateWithTimeZone(sbom.createdAt), config),
  getFormattedValue(formatDateWithTimeZone(sbom.updatedAt), config),
  getFormattedValue(formatDateWithTimeZone(sbom.updatedAt), config),
  getFormattedValue(exportedBy, config),
  getFormattedValue(currentDateTime(), config)
]

//Component Values
export const getComponentValues = (component, config) => [
  getFormattedValue(component?.kind, config),
  getFormattedValue(
    Array.isArray(component?.suppliers) && component.suppliers[0]?.name,
    config
  ),
  getFormattedValue(
    Array.isArray(component?.cpes) && component.cpes[0],
    config
  ),
  getFormattedValue(component?.purl, config),
  getFormattedValue(component?.uniqueId, config),
  getFormattedValue(component?.licensesExp, config)
]

//Vulnerablity Values
export const getVulnValues = (vulnerability, excludeVulnStatus, config) => {
  const epssPercentile =
    vulnerability?.vuln?.vulnInfo?.epssPercentile !== undefined || null
      ? (vulnerability?.vuln?.vulnInfo?.epssPercentile * 100).toFixed() + '%'
      : 'NA'

  const epssScores =
    vulnerability?.vuln?.vulnInfo?.epssScores?.[0] !== undefined || null
      ? (vulnerability?.vuln?.vulnInfo?.epssScores[0] * 100).toFixed(3) + '%'
      : 'NA'

  const kev = vulnerability?.vuln?.vulnInfo?.kev === true ? 'Yes' : 'No'

  const values = [
    getFormattedValue(vulnerability?.vuln?.desc, config),
    getFormattedValue(vulnerability?.component?.name, config),
    getFormattedValue(vulnerability?.component?.version, config),
    getFormattedValue(vulnerability?.vuln?.source, config),
    getFormattedValue(epssPercentile, config),
    getFormattedValue(epssScores, config),
    getFormattedValue(kev, config),
    getFormattedValue(vulnerability?.vexStatus?.name || 'Unspecified', config),
    getFormattedValue(vulnerability?.vexJustification?.name, config),
    getFormattedValue(vulnerability?.impact, config),
    getFormattedValue(vulnerability?.actionStmt, config),
    getFormattedValue(vulnerability?.note, config)
  ]

  // Insert custom field values
  if (excludeVulnStatus) {
    const customFields = vulnerability?.componentVulnCustomFields || []
    customFields.forEach((field) => {
      const value = field?.value || 'NA'
      values.push(getFormattedValue(value, config))
    })
  }
  // Add the remaining fields
  values.push(
    getFormattedValue(
      '', // Placeholder for 'Created By'
      config
    ),
    getFormattedValue(
      formatDateWithTimeZone(vulnerability?.vuln?.publishedAt),
      config
    )
  )

  return values
}

//Following labels and values are ommited if Vulnerability status is not checked
export const excludeStatusLabels = [
  'status',
  'justification',
  'impact statement',
  'action statement',
  'internal notes'
]

//Following labels and values are ommited if Internal notes is not checked
export const excludeStatusNotesLabels = ['internal notes']

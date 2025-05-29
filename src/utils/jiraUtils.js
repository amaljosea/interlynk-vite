const formatCustomVulnFields = (customFields) => {
  if (customFields?.length === 0) return ''

  return customFields
    .map(
      (field) =>
        `${field?.componentVulnCustomFieldDefinition?.displayName}: ${field?.value}`
    )
    .join('\n\n')
}

const cleanDescription = (text) => {
  return text.startsWith('### Description')
    ? text.replace(/^### Description\s*/, '')
    : text
}

export const generateJiraDescription = (data) => {
  const vulnId = data?.vuln?.vulnId || 'N/A'
  const desc = data?.vuln?.desc || 'N/A'
  const nvdAliasId = data?.vuln?.nvdAliasId || 'N/A'
  const component = data?.component?.name || 'N/A'
  const sev = data?.vuln?.sev || 'N/A'
  const cvssVector = data?.vuln?.cvssVector || 'N/A'
  const cvssScore = data?.vuln?.cvssScore || 'N/A'
  const epssPercentile = data?.vuln?.vulnInfo?.epssPercentile || 'N/A'
  const epssScore = data?.vuln?.vulnInfo?.epssScore || 'N/A'
  const kev = data?.data?.vulnInfo?.kev === true ? 'True' : 'False' || 'N/A'
  const vexStatus = data?.vexStatus?.name || 'N/A'
  const actionStmt = data?.actionStmt || 'N/A'
  const impact = data?.impact || 'N/A'
  const justification = data?.vexJustification?.name || 'N/A'
  const note = data?.note || 'N/A'
  const customFields = formatCustomVulnFields(data?.componentVulnCustomFields)

  const subjectDesc = desc !== '' ? cleanDescription(desc) : 'N/A'

  return `Subject: [${vulnId}] : ${subjectDesc?.substring(0, 80)}...\n
Affected Product: ${data?.component?.sbom?.project?.projectGroup?.name}\n
Affected Version (Environment): ${data?.component?.sbom?.project?.projectGroup?.name} (${data?.component?.sbom?.project?.name})\n
Affected Components: ${component}: ${data?.component?.version}\nPURL: ${data?.component?.purl}\n
Description: ${desc}\n
Additional Details:\n
NVD ID: ${nvdAliasId}\n
Severity: ${sev}\n
CVSS Score: ${cvssScore}\n
CVSS Vector: ${cvssVector}\n
EPSS Percentile: ${epssPercentile}\n
EPSS Score: ${epssScore}\n
Vulnerability Status: ${vexStatus}\n
KEV: ${kev}\n
Vulnerability Action Statement: ${actionStmt}\n
Vulnerability Impact: ${impact}\n
Vulnerability Justification: ${justification}\n
Vulnerability Notes: ${note}\n
${customFields}
`
}

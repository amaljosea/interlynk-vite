import { capitalizeFirstLetter } from 'utils'

const formatCustomVulnFields = (customFields) => {
  if (customFields?.length === 0) return ''

  return customFields
    ?.map(
      (field) =>
        `- ${field?.componentVulnCustomFieldDefinition?.displayName}: ${field?.value}`
    )
    ?.join('\n\n')
}

const cleanDescription = (text) => {
  return text?.startsWith('### ') ? text.replace(/^### \s*/, '') : text
}

export const generateJiraDescription = (data) => {
  const customFields = formatCustomVulnFields(data?.componentVulnCustomFields)
  const subjectDesc =
    data?.vuln?.desc !== '' ? cleanDescription(data?.vuln?.desc) : 'N/A'

  return `Subject: [${data?.vuln?.vulnId || 'N/A'}] : ${subjectDesc?.substring(0, 80)}...\n	
Affected Product: ${data?.component?.sbom?.project?.projectGroup?.name}\n	
Affected Version (Environment): ${data?.component?.sbom?.project?.projectGroup?.name} (${data?.component?.sbom?.project?.name})\n	
Affected Components: ${data?.component?.name || 'N/A'}: ${data?.component?.version}\nPURL: ${data?.component?.purl}\n	
Description: ${data?.vuln?.desc || 'N/A'}\n	
Additional Details:\n	
NVD ID: ${data?.vuln?.nvdAliasId || 'N/A'}\n	
Severity: ${data?.vuln?.sev || 'N/A'}\n	
CVSS Score: ${data?.vuln?.cvssScore || 'N/A'}\n	
CVSS Vector: ${data?.vuln?.cvssVector || 'N/A'}\n	
EPSS Percentile: ${data?.vuln?.vulnInfo?.epssPercentile || 'N/A'}\n	
EPSS Score: ${data?.vuln?.vulnInfo?.epssScore || 'N/A'}\n	
Vulnerability Status: ${data?.vexStatus?.name || 'N/A'}\n	
KEV: ${data?.data?.vulnInfo?.kev === true ? 'True' : 'False' || 'N/A'}\n	
Vulnerability Action Statement: ${data?.actionStmt || 'N/A'}\n	
Vulnerability Impact: ${data?.impact || 'N/A'}\n	
Vulnerability Justification: ${data?.vexJustification?.name || 'N/A'}\n	
Vulnerability Notes: ${data?.note || 'N/A'}\n	
${customFields}	
`
}

export const generateDescription = (type, data) => {
  const vulnId = data?.vuln?.vulnId || 'N/A'
  const desc = data?.vuln?.desc || 'N/A'
  const nvdAliasId = data?.vuln?.nvdAliasId || 'N/A'
  const componentName = data?.component?.name || 'N/A'
  const componentVersion = data?.component?.version || 'N/A'
  const PURL = data?.component?.purl || 'N/A'
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
  const fixedVersions =
    data?.fixedVersions?.length > 0 ? data?.fixedVersions?.join(', ') : 'N/A'

  const projectGroup = data?.component?.sbom?.project?.projectGroup?.name
  const environment = data?.component?.sbom?.project?.name

  const customFields = formatCustomVulnFields(data?.componentVulnCustomFields)

  const subjectDesc = desc !== '' ? cleanDescription(desc) : 'N/A'
  const isJIRA = type === 'jira'

  return `
##### 🚨 ${isJIRA ? 'Subject' : 'Vulnerability'}: [${vulnId}] : ${subjectDesc?.substring(0, 70)}...
- **GHSA ID**: [${vulnId}](https://osv.dev/vulnerability/${vulnId})  
- **CVE ID**: [${nvdAliasId}](https://nvd.nist.gov/vuln/detail/${nvdAliasId})  
- **Severity**: ${sev && capitalizeFirstLetter(sev)} (CVSS Score: ${cvssScore})  
- **CVSS Vector**: ${cvssVector}

---

##### 🧪 Affected Product
- **Name**: ${projectGroup}
- **Environment**: ${capitalizeFirstLetter(environment)}

---

##### 📦 Affected Component
- **Package**: ${componentName}
- **Version**: ${componentVersion}
- **PURL**: ${PURL}

---

##### 📝 Description  
${desc}

---

##### 📊 Additional Details  
- **EPSS Score**: ${epssPercentile}
- **EPSS Percentile**: ${epssScore} 
- **Known Exploited (KEV)**: ${kev}
- **Vulnerability Status**: ${vexStatus}  
- **Action Statement**: ${actionStmt}
- **Impact**: ${impact}
- **Justification**: ${justification}
- **Notes**: ${note}
${isJIRA ? customFields : ''}


---

##### 📊 Remediation 
- **Fixed In**: ${fixedVersions}
`
}

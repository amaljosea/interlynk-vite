import { capitalizeFirstLetter } from 'utils'

export const generateLinearDescription = (data) => {
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

  return `
##### 🚨 Vulnerability: [${vulnId}]
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

---

##### 📊 Remediation 
- **Fixed In**: ${fixedVersions}
`
}

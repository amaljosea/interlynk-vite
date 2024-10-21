import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { GetCompVulnData, GetComponentData } from 'graphQL/Queries'
import { GetVulnData } from 'graphQL/Queries'
import { GetSbomLicensesTable } from 'graphQL/Queries'
import { GetGlobalVulns } from 'graphQL/Queries'

const useExportCsvQueryInfo = (tableType, rowsToExport, searchFilters) => {
  const params = useParams()
  const location = useLocation()

  const productId = params.productid
  const sbomId = params.sbomid
  const productGroupId = params.productgroupid

  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid

  const queryInfo = useMemo(() => {
    switch (tableType) {
      case 'SBOM Components View':
        return {
          query: GetComponentData,
          variables: {
            sbomId,
            projectId: productId,
            first: parseInt(rowsToExport, 10) || 0,
            ...searchFilters
          },
          skip: !sbomId || !productId,
          selector: 'sbom.components.nodes',
          pageInfoSelector: 'sbom.components.pageInfo'
        }

      case 'Vulnerability Detail View':
        return {
          query: GetCompVulnData,
          variables: {
            id: vulnId,
            first: parseInt(rowsToExport, 10) || 0,
            ...searchFilters
          },
          skip: !vulnId,
          selector: 'componentVulns.nodes',
          pageInfoSelector: 'componentVulns.pageInfo'
        }

      case 'SBOM Vulnerability View':
        return {
          query: GetVulnData,
          variables: {
            projectId: productId,
            sbomId: sbomId,
            first: parseInt(rowsToExport, 10) || 0,
            ...searchFilters
          },
          skip: !sbomId,
          selector: 'sbom.vulns.nodes',
          pageInfoSelector: 'sbom.vulns.pageInfo'
        }

      case 'SBOM License View':
        return {
          query: GetSbomLicensesTable,
          variables: {
            projectId: productId,
            sbomId: sbomId,
            first: parseInt(rowsToExport, 10) || 0,
            ...searchFilters
          },
          skip: !sbomId,
          selector: 'sbom.componentLicenses.nodes',
          pageInfoSelector: 'sbom.componentLicenses.pageInfo'
        }

      case 'Vulnerability View':
        return {
          query: GetGlobalVulns,
          variables: {
            ...(productGroupId ? { projectGroupIds: [productGroupId] } : {}),
            ...(productId ? { projectIds: [productId] } : {}),
            first: parseInt(rowsToExport, 10) || 0,
            direction: 'DESC',
            field: 'VULNS_VULN_ID',
            ...searchFilters
          },
          skip: false,
          selector: 'organization.vulns.nodes',
          pageInfoSelector: 'organization.vulns.pageInfo'
        }

      default:
        return { query: null, variables: {}, skip: true, selector: null }
    }
  }, [tableType, sbomId, productId, vulnId, rowsToExport, searchFilters])

  return queryInfo
}

export default useExportCsvQueryInfo

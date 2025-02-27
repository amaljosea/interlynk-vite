import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import {
  GetCompSupportData,
  GetCompVulnData,
  GetComponentData,
  GetGlobalVulns,
  GetSbomLicensesTable,
  GetVulnData
} from 'graphQL/Queries'

import useQueryParam from './useQueryParam'

const useExportCsvQueryInfo = (tableType, rowsToExport, searchFilters) => {
  const params = useParams()

  const productId = params.productid
  const sbomId = params.sbomid
  const productGroupId = params.productgroupid

  const vulnId = useQueryParam('vulnId') || params.vulnerabilityid

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

      case 'SBOM Support View':
        return {
          query: GetCompSupportData,
          variables: {
            sbomId,
            projectId: productId,
            first: parseInt(rowsToExport, 10) || 0,
            ...searchFilters
          },

          skip: !sbomId,
          selector: 'sbom.components.nodes',
          pageInfoSelector: 'sbom.components.pageInfo'
        }

      default:
        return { query: null, variables: {}, skip: true, selector: null }
    }
  }, [
    tableType,
    sbomId,
    productId,
    productGroupId,
    vulnId,
    rowsToExport,
    searchFilters
  ])

  return queryInfo
}

export default useExportCsvQueryInfo

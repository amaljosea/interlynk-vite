import { gql, useQuery } from '@apollo/client'
import { Link, useNavigate } from 'react-router-dom'
import {
  getFullDate,
  normalizeSBOMVersion,
  timeSince,
  truncatedValue
} from 'utils'

import { Flex, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import LynkLoader from 'components/Misc/LynkLoader'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

export const GetLatestVersions = gql`
  query GetOrgMetrics($env: String) {
    organizationMetric(envName: $env) {
      latestVersions {
        id
        createdAt
        creationAt
        updatedAt
        projectId
        projectVersion
        project {
          id
          name
          sboms {
            id
          }
          projectGroup {
            id
            name
            defaultProject {
              id
              name
            }
          }
        }
        primaryComponent {
          id
          name
          version
        }
        stats {
          compCount
          compLicenseCount
          vulnStats
        }
      }
    }
  }
`

const ProductsOverview = () => {
  const navigate = useNavigate()
  const { dispatch, organization, envName } = useGlobalState()
  const { prodDispatch, prodVulnDispatch } = dispatch
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { primaryTextColor, primaryBlueText, secondaryTextInverse } =
    useThemeColor([
      'primaryTextColor',
      'primaryBlueText',
      'secondaryTextInverse'
    ])

  const { data, loading } = useQuery(GetLatestVersions, {
    skip: organization ? false : true,
    variables: { env: envName }
  })
  const { latestVersions } = data?.organizationMetric || {}

  const handleClick = (prod) => {
    const { id, projectId } = prod

    prodDispatch({
      type: 'SET_CURRENT_PRODUCT',
      payload: { id: projectId, sbomId: id }
    })
    prodDispatch({
      type: 'SET_CURRENT_PRODUCT',
      payload: { id: projectId, sbomId: id }
    })
  }

  const onFilterSev = (value, link) => {
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    navigate(link)
  }

  const removeDuplicates = (versions) => {
    const uniqueVersions = []
    versions?.forEach((version) => {
      const duplicateIndex = uniqueVersions.findIndex(
        (v) =>
          v?.project?.projectGroup?.name ===
            version?.project?.projectGroup?.name &&
          normalizeSBOMVersion(v) === normalizeSBOMVersion(version)
      )
      if (duplicateIndex === -1) {
        uniqueVersions.push(version)
      }
    })
    return uniqueVersions
  }

  const filteredData =
    latestVersions?.length > 0 && removeDuplicates(latestVersions)

  // COLUMNS
  const columns = [
    // PRODUCT
    {
      id: 'PRODUCT',
      name: 'PRODUCT',
      wrap: true,
      selector: (row) => {
        const { id, project } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Tooltip placement='top' label={project?.projectGroup?.name}>
            <Link
              to={generateProductDetailPageUrlFromCurrentUrl({
                productgroupid: project?.projectGroup?.id,
                productid: project?.id
              })}
              style={{ pointerEvents: uniqueSbom ? 'inherit' : 'none' }}
              onClick={() => handleClick(row)}
            >
              <Text
                my={3}
                color={uniqueSbom ? primaryBlueText : secondaryTextInverse}
              >
                {truncatedValue(project?.projectGroup?.name, 16)}
              </Text>
            </Link>
          </Tooltip>
        )
      }
    },
    // VERSION
    {
      id: 'VERSION',
      name: 'VERSION',
      wrap: true,
      selector: (row) => {
        const { id, project, projectVersion } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Tooltip placement='top' label={projectVersion}>
            <Link
              to={generateProductVersionDetailPageUrlFromCurrentUrl({
                productgroupid: project?.projectGroup?.id,
                productid: project?.id,
                sbomid: id,
                paramsObj: {
                  tab: 'general'
                }
              })}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
            >
              <Text
                my={2}
                color={uniqueSbom ? primaryBlueText : secondaryTextInverse}
                textAlign={'right'}
              >
                {projectVersion ? truncatedValue(projectVersion, 12) : 'N/A'}
              </Text>
            </Link>
          </Tooltip>
        )
      }
    },
    // COMPONENTS
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      wrap: true,
      selector: (row) => {
        const { id, project, stats } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={generateProductVersionDetailPageUrlFromCurrentUrl({
              productgroupid: project?.projectGroup?.id,
              productid: project?.id,
              sbomid: id,
              paramsObj: {
                tab: 'components'
              }
            })}
            style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
          >
            <Tag
              size='md'
              variant='subtle'
              width={16}
              colorScheme={'blue'}
              cursor={'pointer'}
            >
              <TagLabel mx={'auto'}>{stats?.compCount || 0}</TagLabel>
            </Tag>
          </Link>
        )
      }
    },
    // LICENSES
    {
      id: 'LICENSES',
      name: 'LICENSES',
      wrap: true,
      selector: (row) => {
        const { id, project, stats } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={generateProductVersionDetailPageUrlFromCurrentUrl({
              productgroupid: project?.projectGroup?.id,
              productid: project?.id,
              sbomid: id,
              paramsObj: {
                tab: 'licenses'
              }
            })}
            style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
          >
            <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
              <TagLabel mx={'auto'}>{stats?.compLicenseCount || 0}</TagLabel>
            </Tag>
          </Link>
        )
      }
    },
    // VULNERABILITIES
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      width: '32%',
      selector: (row) => {
        const { id, project, stats } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productgroupid: project?.projectGroup?.id,
          productid: project?.id,
          sbomid: id,
          paramsObj: {
            tab: 'vulnerabilities'
          }
        })
        const getLink = (value) =>
          uniqueSbom ? onFilterSev([value], link) : null
        return (
          <Flex flexWrap={'wrap'} gap={1} my={3}>
            <VulnBadge
              color='red'
              label='Critical'
              onClick={() => getLink('critical')}
            >
              {stats?.vulnStats?.critical || 0}
            </VulnBadge>
            <VulnBadge
              color='orange'
              label='High'
              onClick={() => getLink('high')}
            >
              {stats?.vulnStats?.high || 0}
            </VulnBadge>
            <VulnBadge
              color='yellow'
              label='Medium'
              onClick={() => getLink('medium')}
            >
              {stats?.vulnStats?.medium || 0}
            </VulnBadge>
            <VulnBadge color='green' label='Low' onClick={() => getLink('low')}>
              {stats?.vulnStats?.low || 0}
            </VulnBadge>
            <VulnBadge
              color='gray'
              label='Unknown'
              onClick={() => getLink('unknown')}
            >
              {stats?.vulnStats?.unknown || 0}
            </VulnBadge>
          </Flex>
        )
      }
    },
    // IMPORTED
    {
      id: 'IMPORTED',
      name: 'IMPORTED',
      wrap: true,
      right: 'true',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip placement='top' label={getFullDate(createdAt)}>
            <Text color={primaryTextColor} textAlign={'right'}>
              {timeSince(createdAt)}
            </Text>
          </Tooltip>
        )
      }
    }
  ]

  if (loading) return <LynkLoader />

  return (
    <LynkTable
      columns={columns}
      data={latestVersions || []}
      progressPending={loading}
    />
  )
}

export default ProductsOverview

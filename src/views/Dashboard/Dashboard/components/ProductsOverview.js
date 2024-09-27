import React from 'react'
import DataTable from 'react-data-table-component'
import { Link } from 'react-router-dom'
import { getFullDateAndTime, normalizeSBOMVersion, timeSince } from 'utils'
import { customStyles } from 'utils'

import { Flex, Heading, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

const ProductsOverview = ({ title, data }) => {
  const { dispatch } = useGlobalState()
  const { prodDispatch, prodVulnDispatch } = dispatch
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { headingTextColor, primaryTextColor, primaryBlueText } = useThemeColor(
    ['headingTextColor', 'primaryTextColor', 'primaryBlueText']
  )

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

  const onFilterSev = (value) => {
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
  }

  const removeDuplicates = (versions) => {
    const uniqueVersions = []
    versions.forEach((version) => {
      const duplicateIndex = uniqueVersions.findIndex(
        (v) =>
          v.project.projectGroup.name === version.project.projectGroup.name &&
          normalizeSBOMVersion(v) === normalizeSBOMVersion(version)
      )
      if (duplicateIndex === -1) {
        uniqueVersions.push(version)
      }
    })
    return uniqueVersions
  }

  const filteredData = data && removeDuplicates(data)

  // COLUMNS
  const columns = [
    // PRODUCT
    {
      id: 'PRODUCT',
      name: 'PRODUCT',
      wrap: true,
      width: '150px',
      selector: (row) => {
        const { id, project } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={generateProductDetailPageUrlFromCurrentUrl({
              productgroupid: project?.projectGroup?.id,
              productid: project?.id
            })}
            style={{ pointerEvents: uniqueSbom ? 'inherit' : 'none' }}
            onClick={() => handleClick(row)}
          >
            <Text my={1} color={uniqueSbom ? primaryBlueText : 'gray.500'}>
              {project?.projectGroup?.name}
            </Text>
          </Link>
        )
      }
    },
    // VERSION
    {
      id: 'VERSION',
      name: 'VERSION',
      wrap: true,
      right: 'true',
      selector: (row) => {
        const { id, project, projectVersion } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
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
              color={uniqueSbom ? primaryBlueText : 'gray.500'}
              textAlign={'right'}
            >
              {projectVersion}
            </Text>
          </Link>
        )
      }
    },
    // COMPONENTS
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      wrap: true,
      width: '150px',
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
      width: '120px',
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
      width: '350px',
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
        return (
          <Flex direction={'row'} flexWrap={'wrap'} gap={2} my={2}>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() => (uniqueSbom ? onFilterSev(['critical']) : null)}
            >
              <VulnBadge color='red' label='Critical'>
                {stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() => (uniqueSbom ? onFilterSev(['high']) : null)}
            >
              <VulnBadge color='orange' label='High'>
                {stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() => (uniqueSbom ? onFilterSev(['medium']) : null)}
            >
              <VulnBadge color='yellow' label='Medium'>
                {stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() => (uniqueSbom ? onFilterSev(['low']) : null)}
            >
              <VulnBadge color='green' label='Low'>
                {stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() => (uniqueSbom ? onFilterSev(['unknown']) : null)}
            >
              <VulnBadge color='gray' label='Unknown'>
                {stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Link>
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
      width: '130px',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip placement='top' label={getFullDateAndTime(createdAt)}>
            <Text color={primaryTextColor} textAlign={'right'}>
              {timeSince(createdAt)}
            </Text>
          </Tooltip>
        )
      }
    }
  ]

  return (
    <Card maxH='100%'>
      {/* HEADING */}
      <Heading minH={'auto'} fontSize={'lg'} fontFamily={'inherit'}>
        {title}
      </Heading>
      <CardBody mt={6}>
        <DataTable
          responsive
          persistTableHead
          columns={columns}
          data={data || []}
          customStyles={customStyles(headingTextColor)}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
        />
      </CardBody>
    </Card>
  )
}

export default ProductsOverview

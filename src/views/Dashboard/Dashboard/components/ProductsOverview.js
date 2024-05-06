import React from 'react'
import DataTable from 'react-data-table-component'
import { Link } from 'react-router-dom'
import {
  customStyles,
  getFullDateAndTime,
  normalizeSBOMVersion,
  timeSince
} from 'utils'
import {
  getProductDetailPageUrl,
  getProductVersionDetailPageUrl
} from 'utils/url'

import { Flex, Heading, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CustomLoader from 'components/CustomLoader'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'

const ProductsOverview = ({ title, data, prodPermissions }) => {
  const { setActiveSbomTab, dispatch } = useGlobalState()
  const { prodDispatch, prodVulnDispatch } = dispatch

  const handleClick = (prod) => {
    console.log('prod', prod)
    const { id, projectId } = prod
    localStorage.setItem('activeProdTab', 0)
    prodDispatch({
      type: 'SET_CURRENT_PRODUCT',
      payload: { id: projectId, sbomId: id }
    })
    setActiveSbomTab(0)
    prodDispatch({
      type: 'SET_CURRENT_PRODUCT',
      payload: { id: projectId, sbomId: id }
    })
  }

  const onVersionClick = () => {
    setActiveSbomTab(0)
  }

  const onFilterComp = () => {
    setActiveSbomTab(2)
  }

  const onFilterLicense = () => {
    setActiveSbomTab(4)
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
      selector: (row) => {
        const { id, project } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={getProductDetailPageUrl({
              productgroupid: project?.projectGroup?.id,
              productid: project?.id
            })}
            style={{ pointerEvents: uniqueSbom ? 'inherit' : 'none' }}
            onClick={() => handleClick(row)}
          >
            <Text color={uniqueSbom ? 'blue.500' : 'gray.500'}>
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
            to={getProductVersionDetailPageUrl({
              productgroupid: project?.projectGroup?.id,
              productid: project?.id,
              sbomid: id
            })}
            style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
            onClick={() => onVersionClick(row)}
          >
            <Text
              my={2}
              color={uniqueSbom ? 'blue.500' : 'gray.500'}
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
      width: '12.25%',
      selector: (row) => {
        const { id, project, stats } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={getProductVersionDetailPageUrl({
              productgroupid: project?.projectGroup?.id,
              productid: project?.id,
              sbomid: id
            })}
            style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
            onClick={() => (uniqueSbom ? onFilterComp(row) : null)}
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
            to={getProductVersionDetailPageUrl({
              productgroupid: project?.projectGroup?.id,
              productid: project?.id,
              sbomid: id
            })}
            style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
            onClick={() => (uniqueSbom ? onFilterLicense(row) : null)}
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
      width: '40%',
      selector: (row) => {
        const { id, project, stats } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        const link = getProductVersionDetailPageUrl({
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
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip placement='top' label={getFullDateAndTime(createdAt)}>
            <Text textAlign={'right'}>{timeSince(createdAt)}</Text>
          </Tooltip>
        )
      }
    }
  ]

  return (
    <Card>
      {prodPermissions?.value === false ? (
        <Flex width={'100%'} flexDir={'column'} gap={4}>
          <Heading m={0} fontSize={'lg'} fontFamily={'inherit'}>
            {title}
          </Heading>
          <Text textAlign={'center'}>No record to display</Text>
        </Flex>
      ) : (
        <>
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
              customStyles={customStyles}
              progressPending={data ? false : true}
              progressComponent={<CustomLoader />}
            />
          </CardBody>
        </>
      )}
    </Card>
  )
}

export default ProductsOverview

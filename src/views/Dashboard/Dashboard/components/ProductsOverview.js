// Chakra imports
import React from 'react'
import DataTable from 'react-data-table-component'
import { Link } from 'react-router-dom'
import {
  customStyles,
  getFullDateAndTime,
  normalizeSBOMVersion,
  timeSince
} from 'utils'

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
    const { project, id, projectId, projectVersion } = prod
    const { projectGroup, name } = project
    // const env = projects?.find((item) => item.name === environment)
    const product = {
      version: projectVersion,
      groupId: projectGroup?.id,
      id: projectGroup?.id,
      name: name,
      sbomId: id,
      defaultEnv: projectGroup?.defaultProject?.id
    }
    localStorage.setItem('activeEnv', project?.id)
    localStorage.setItem('product', JSON.stringify(product))
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

  const onVersionClick = (item) => {
    const { project, id, projectVersion } = item
    const { projectGroup } = project
    const product = {
      version: projectVersion,
      groupId: projectGroup?.id,
      id: projectGroup?.id,
      name: projectGroup?.name,
      sbomId: id
    }
    localStorage.setItem('activeEnv', projectGroup?.defaultProject?.id)
    localStorage.setItem('product', JSON.stringify(product))
    localStorage.setItem(
      'currentSBOM',
      JSON.stringify({ version: projectVersion, id: item?.id })
    )
    localStorage.setItem('activeSbomTab', 0)
    setActiveSbomTab(0)
  }

  const onFilterComp = (item) => {
    const { project, id, projectVersion } = item
    const { projectGroup, name } = project
    const product = {
      version: projectVersion,
      groupId: projectGroup?.id,
      id: projectGroup?.id,
      name: name,
      sbomId: id
    }
    localStorage.setItem('product', JSON.stringify(product))
    localStorage.setItem('activeEnv', projectGroup?.defaultProject?.id)
    localStorage.setItem(
      'currentSBOM',
      JSON.stringify({ version: projectVersion, id: item.id })
    )
    localStorage.setItem('activeSbomTab', 2)
    setActiveSbomTab(2)
  }

  const onFilterLicense = (item) => {
    const { project, id, projectVersion } = item
    const { projectGroup, name } = project
    const product = {
      version: projectVersion,
      groupId: projectGroup?.id,
      id: projectGroup?.id,
      name: name,
      sbomId: id
    }
    localStorage.setItem('product', JSON.stringify(product))
    localStorage.setItem('activeEnv', projectGroup?.defaultProject?.id)
    localStorage.setItem(
      'currentSBOM',
      JSON.stringify({ version: projectVersion, id: item.id })
    )
    localStorage.setItem('activeSbomTab', 4)
    setActiveSbomTab(4)
  }

  const onFilterSev = (project, id, version, value) => {
    const { projectGroup, name } = project
    const product = {
      version: version,
      groupId: projectGroup?.id,
      id: projectGroup?.id,
      name: name,
      sbomId: id
    }
    localStorage.setItem('product', JSON.stringify(product))
    localStorage.setItem('activeEnv', projectGroup?.defaultProject?.id)
    localStorage.setItem(
      'currentSBOM',
      JSON.stringify({ version: version, id: id })
    )
    localStorage.setItem('activeSbomTab', 3)
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_SOURCE', payload: true })
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
            to={`/vendor/products/${project?.projectGroup?.name}?id=${project?.projectGroup?.id}`}
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
      width: '150px',
      selector: (row) => {
        const { id, project, projectId, projectVersion } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={`/vendor/products/${project?.projectGroup?.name}?id=${projectId}&sbom=${id}`}
            style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
            onClick={() => onVersionClick(row)}
          >
            <Text my={2} color={uniqueSbom ? 'blue.500' : 'gray.500'}>
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
      width: '140px',
      selector: (row) => {
        const { id, project, projectId, stats } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={`/vendor/products/${project?.projectGroup?.name}?id=${projectId}&sbom=${id}`}
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
      width: '120px',
      selector: (row) => {
        const { id, project, projectId, stats } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={`/vendor/products/${project?.projectGroup?.name}?id=${projectId}&sbom=${id}`}
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
      wrap: true,
      width: '350px',
      selector: (row) => {
        const { id, project, projectId, stats, projectVersion } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        const link = `/vendor/products/${project?.projectGroup?.name}?id=${projectId}&sbom=${id}`
        return (
          <Flex direction={'row'} flexWrap={'wrap'} gap={2} my={2}>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() =>
                uniqueSbom
                  ? onFilterSev(project, id, projectVersion, ['critical'])
                  : null
              }
            >
              <VulnBadge color='red' label='Critical'>
                {stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() =>
                uniqueSbom
                  ? onFilterSev(project, id, projectVersion, ['high'])
                  : null
              }
            >
              <VulnBadge color='orange' label='High'>
                {stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() =>
                uniqueSbom
                  ? onFilterSev(project, id, projectVersion, ['medium'])
                  : null
              }
            >
              <VulnBadge color='yellow' label='Medium'>
                {stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() =>
                uniqueSbom
                  ? onFilterSev(project, id, projectVersion, ['low'])
                  : null
              }
            >
              <VulnBadge color='green' label='Low'>
                {stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() =>
                uniqueSbom
                  ? onFilterSev(project, id, projectVersion, ['unknown'])
                  : null
              }
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

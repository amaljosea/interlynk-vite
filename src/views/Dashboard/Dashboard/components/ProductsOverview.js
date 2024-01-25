// Chakra imports
import React from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { Flex, Heading, TagLabel, Tooltip, Tag, Text } from '@chakra-ui/react'
import {
  getFullDateAndTime,
  timeSince,
  normalizeSBOMVersion,
  customStyles
} from 'utils'
// Custom components
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody'
import VulnBadge from 'components/Misc/VulnBadge'
import CustomLoader from 'components/CustomLoader'
import { useGlobalState } from 'hooks/useGlobalState'
import { removeDuplicates } from 'utils'

const ProductsOverview = ({ title, data }) => {
  const { setActiveSbomTab, dispatch } = useGlobalState()
  const { prodDispatch, prodVulnDispatch } = dispatch

  const handleClick = (prod) => {
    const { project, id, projectId } = prod
    const { sboms, name } = project

    const product = {
      id: projectId,
      name: name,
      version: normalizeSBOMVersion(prod),
      sbomId: id
    }

    if (sboms.length > 0) {
      sessionStorage.setItem('product', JSON.stringify(product))
      sessionStorage.setItem('activeProdTab', 0)
      prodDispatch({
        type: 'SET_CURRENT_PRODUCT',
        payload: {
          id: projectId,
          sbomId: id
        }
      })
    }
    setActiveSbomTab(0)
  }

  const onVersionClick = (item) => {
    sessionStorage.setItem(
      'currentSBOM',
      JSON.stringify({
        version: normalizeSBOMVersion(item),
        id: item?.id
      })
    )
    sessionStorage.setItem('activeSbomTab', 0)
    setActiveSbomTab(0)
  }

  const onFilterComp = (item) => {
    sessionStorage.setItem(
      'currentSBOM',
      JSON.stringify({
        version: normalizeSBOMVersion(item),
        id: item.id
      })
    )
    sessionStorage.setItem('activeSbomTab', 2)
  }

  const onFilterSev = async (id, version, value) => {
    sessionStorage.setItem(
      'currentSBOM',
      JSON.stringify({ version: version, id: id })
    )
    sessionStorage.setItem('activeSbomTab', 3)
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
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
            <Text color='blue.500'>{project?.projectGroup?.name}</Text>
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
        const { id, project, projectId } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        return (
          <Link
            to={`/vendor/products/${project?.projectGroup?.name}?id=${projectId}&sbom=${id}`}
            style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
            onClick={() => onVersionClick(row)}
          >
            <Text my={2} color={'blue.500'}>
              {normalizeSBOMVersion(row)}
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
        const { stats } = row
        return (
          <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
            <TagLabel mx={'auto'}>{stats?.compLicenseCount || 0}</TagLabel>
          </Tag>
        )
      }
    },
    // VULNERABILITIES
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      wrap: true,
      width: '300px',
      selector: (row) => {
        const { id, project, projectId, stats } = row
        const uniqueSbom = filteredData?.find((item) => item?.id === id)
        const link = `/vendor/products/${project?.projectGroup?.name}?id=${projectId}&sbom=${id}`
        return (
          <Flex direction={'row'} flexWrap={'wrap'} gap={2} my={2}>
            <Link
              to={link}
              style={{ pointerEvents: uniqueSbom ? '' : 'none' }}
              onClick={() =>
                uniqueSbom
                  ? onFilterSev(id, normalizeSBOMVersion(row), ['critical'])
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
                  ? onFilterSev(id, normalizeSBOMVersion(row), ['high'])
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
                  ? onFilterSev(id, normalizeSBOMVersion(row), ['medium'])
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
                  ? onFilterSev(id, normalizeSBOMVersion(row), ['low'])
                  : null
              }
            >
              <VulnBadge color='green' label='Low'>
                {stats?.vulnStats?.low || 0}
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
    <Flex width={'100%'} direction='column'>
      <Flex
        dir='row'
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Card>
          <CardHeader pt='12px'>
            <Heading fontSize={'lg'} fontFamily={'inherit'}>
              {title}
            </Heading>
          </CardHeader>
          <CardBody width='100%' mt={4} overflowX={'scroll'}>
            <DataTable
              columns={columns}
              data={data || []}
              customStyles={customStyles}
              progressPending={data ? false : true}
              progressComponent={<CustomLoader />}
              persistTableHead
              responsive
            />
          </CardBody>
        </Card>
      </Flex>
    </Flex>
  )
}

export default ProductsOverview

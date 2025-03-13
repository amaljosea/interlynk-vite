import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useParams } from 'react-router-dom'
import { getFullDate, linkURl, timeSince } from 'utils'
import { customStyles } from 'utils/styleUtils'
import SubHeader from 'views/Dashboard/Vulnerabilities/components/SubHeader'

import { Badge, Flex, Stack, Text } from '@chakra-ui/react'
import { IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import VulnProductsDrawer from 'components/Drawer/VulnProductsDrawer'
import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
import CvssTag from 'components/Misc/CvssTag'
import EpssTag from 'components/Misc/EpssTag'
import SeverityTag from 'components/Misc/SeverityTag'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaEye } from 'react-icons/fa6'

import Pagination from '../Pagination'

const GlobalVulnTable = (props) => {
  const { vulns, reset, filters, loading, paginationProps } = props
  const { isOpen, onClose, onOpen } = useDisclosure()

  const { globalVulnState, dispatch } = useGlobalState()
  const { globalVulnDispatch } = dispatch

  const { generateProductVulnerabilityDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { headingTextColor, primaryTextColor, primaryBlueText } = useThemeColor(
    ['headingTextColor', 'primaryTextColor', 'primaryBlueText']
  )

  const params = useParams()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const [activeRow, setActiveRow] = useState({})

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'VULNS_VULN_ID',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { vulnId, id, vulnInfo, source } = row
        return (
          <Stack spacing={1} my={2}>
            <Flex direction='row' alignItems={'flex-start'} gap={2} my={3}>
              <ExternalNavIcon href={linkURl(source, vulnId)} />
              <Stack>
                <Link
                  to={
                    params?.productgroupid
                      ? generateProductVulnerabilityDetailPageUrlFromCurrentUrl(
                          {
                            vulnerabilityid: id
                          }
                        )
                      : `/${path}/vulnerabilities?tab=productVulnerabilities&vulnId=${id}`
                  }
                  onClick={() => localStorage.setItem('activeVuln', vulnId)}
                >
                  <Text fontSize='sm' color={primaryBlueText}>
                    {vulnId || ''}
                  </Text>
                </Link>
                {vulnInfo?.kev === true && (
                  <Badge
                    width={'fit-content'}
                    variant='subtle'
                    colorScheme='red'
                  >
                    KEV
                  </Badge>
                )}
              </Stack>
            </Flex>
          </Stack>
        )
      },
      width: '12%',
      sortable: true
    },
    // SEVERITY
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => <SeverityTag value={row?.sev} />,
      sortable: true,
      width: '10%',
      wrap: true
    },
    // SOURCE
    {
      id: 'VULNS_SOURCE',
      name: 'SOURCE',
      selector: (row) => {
        const { source } = row
        return (
          <Tag
            size='sm'
            key='md'
            variant='solid'
            colorScheme={source === 'osv' ? 'red' : 'blue'}
            textTransform={'uppercase'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <TagLabel>{source}</TagLabel>
          </Tag>
        )
      },
      width: '9%',
      wrap: true,
      sortable: true
    },
    // CVSS
    {
      id: 'VULNS_CVSS_SCORE',
      name: 'CVSS',
      selector: (row) => <CvssTag value={row?.cvssScore} />,
      width: '7%',
      wrap: true,
      sortable: true
    },
    // EPSS
    {
      id: 'VULN_INFOS_EPSS_SCORES',
      name: 'EPSS',
      selector: (row) => {
        const { vulnInfo } = row
        const { epssScores } = vulnInfo || ''
        return <EpssTag value={epssScores} />
      },
      sortable: true,
      width: '12%',
      wrap: true
    },
    // STATUSES
    {
      id: 'STATUSES',
      name: 'STATUSES',
      selector: (row) => {
        const { metrics } = row
        return (
          <Flex gap={1} flexWrap={'wrap'} my={4}>
            <VulnBadge color='gray' label='Unspecified'>
              {metrics?.unspecifiedCount}
            </VulnBadge>
            <VulnBadge color='cyan' label='In Triage'>
              {metrics?.inTriageCount}
            </VulnBadge>
            <VulnBadge color='red' label='Affected'>
              {metrics?.affectedCount}
            </VulnBadge>
            <VulnBadge color='blue' label='Fixed'>
              {metrics?.fixedCount}
            </VulnBadge>
            <VulnBadge color='green' label='Not Affected'>
              {metrics?.notAffectedCount}
            </VulnBadge>
          </Flex>
        )
      },
      width: '22%',
      wrap: true
    },
    // PUBLISHED AT
    {
      id: 'VULNS_PUBLISHED_AT',
      name: 'PUBLISHED',
      selector: (row) => {
        const { publishedAt } = row
        const published = publishedAt ? timeSince(publishedAt) : ''
        return (
          <Tooltip
            label={published ? getFullDate(publishedAt) : 'N/A'}
            placement={'top'}
          >
            <Text color={primaryTextColor} textAlign={'right'}>
              {published || 'N/A'}
            </Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.publishedAt)
        const dateB = new Date(b?.publishedAt)
        return dateA - dateB // Sort in descending order
      },
      wrap: true,
      right: 'true'
    },
    // MODIFIED AT
    {
      id: 'VULNS_LAST_MODIFIED_AT',
      name: 'MODIFIED',
      selector: (row) => {
        const { lastModifiedAt } = row
        const modified = lastModifiedAt ? timeSince(lastModifiedAt) : ''
        return (
          <Tooltip
            label={modified ? getFullDate(lastModifiedAt) : 'N/A'}
            placement={'top'}
          >
            <Text color={primaryTextColor} textAlign={'right'}>
              {modified || 'N/A'}
            </Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.lastModifiedAt)
        const dateB = new Date(b?.lastModifiedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '9%',
      wrap: true,
      right: 'true'
    },
    {
      id: 'PRODUCT_LIST',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Tooltip label={'View affected products'} placement={'left'}>
            <IconButton
              size='sm'
              variant={'solid'}
              colorScheme={'blue'}
              icon={<FaEye />}
              onClick={() => {
                onOpen()
                setActiveRow(row)
              }}
            />
          </Tooltip>
        )
      },
      right: 'true',
      omit: params?.productgroupid
    }
  ]

  // HEADER
  const subHeaderComponent = <SubHeader reset={reset} filters={filters} />

  // SORTING
  const handleSort = (column, sortDirection) => {
    globalVulnDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  const data = vulns?.map((row, index) => ({ ...row, key: index }))

  return (
    <Flex flexDir={'column'} width={'100%'}>
      <DataTable
        subHeader
        responsive
        data={data}
        persistTableHead
        columns={columns}
        onSort={handleSort}
        progressPending={loading}
        progressComponent={<CustomLoader />}
        subHeaderComponent={subHeaderComponent}
        defaultSortFieldId={globalVulnState?.field}
        customStyles={customStyles(headingTextColor)}
        defaultSortAsc={globalVulnState?.direction === 'ASC' ? true : false}
      />
      <Pagination {...paginationProps} />
      {isOpen && (
        <VulnProductsDrawer
          isOpen={isOpen}
          onClose={onClose}
          data={activeRow}
        />
      )}
    </Flex>
  )
}

export default GlobalVulnTable

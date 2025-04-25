import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getFullDate, linkURl, timeSince } from 'utils'
import SubHeader from 'views/Dashboard/Vulnerabilities/components/SubHeader'

import { Badge, Flex, Stack, Text } from '@chakra-ui/react'
import { IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import VulnProductsDrawer from 'components/Drawer/VulnProductsDrawer'
import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
import LynkTable from 'components/LynkTable'
import CvssTag from 'components/Misc/CvssTag'
import EpssTag from 'components/Misc/EpssTag'
import SeverityTag from 'components/Misc/SeverityTag'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaEye } from 'react-icons/fa6'
import { LuCircleDot, LuDatabaseZap, LuSparkle } from 'react-icons/lu'

import Pagination from '../Pagination'

const GlobalVulnTable = (props) => {
  const { vulns, reset, filters, loading, paginationProps } = props
  const { isOpen, onClose, onOpen } = useDisclosure()

  const { globalVulnState, dispatch } = useGlobalState()
  const { globalVulnDispatch } = dispatch

  const { generateProductVulnerabilityDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const {
    primaryTextColor,
    primaryBlueText,
    primaryErrorColor,
    primarySuccessColor,
    secondaryTextColor
  } = useThemeColor([
    'primaryTextColor',
    'primaryBlueText',
    'primaryErrorColor',
    'primarySuccessColor',
    'secondaryTextColor'
  ])

  const params = useParams()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const [activeRow, setActiveRow] = useState({})

  const sourceIcon = {
    osv: <LuCircleDot color={primaryErrorColor} />,
    nvd: <LuDatabaseZap color={primaryBlueText} />,
    custom: <LuSparkle color={primarySuccessColor} />
  }

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'VULNS_LAST_MODIFIED_AT',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { vulnId, id, vulnInfo, source, lastModifiedAt } = row
        const modified = lastModifiedAt ? timeSince(lastModifiedAt) : ''
        return (
          <Flex direction='row' alignItems={'center'} gap={2} my={3}>
            <Tooltip placement='top' label={source} textTransform={'uppercase'}>
              <IconButton isRound={true} icon={sourceIcon[source]} />
            </Tooltip>
            <Stack direction={'column'} spacing={1.5}>
              <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
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
                <ExternalNavIcon href={linkURl(source, vulnId)} />
              </Flex>
              <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
                {vulnInfo?.kev === true && (
                  <Badge
                    colorScheme='red'
                    w={'fit-content'}
                    fontWeight={'normal'}
                  >
                    KEV
                  </Badge>
                )}
                <Text hidden={!vulnInfo?.kev} color={secondaryTextColor}>
                  •
                </Text>
                <Tooltip label={modified ? getFullDate(lastModifiedAt) : 'N/A'}>
                  <Text color={secondaryTextColor} textAlign={'right'}>
                    {modified || 'N/A'}
                  </Text>
                </Tooltip>
              </Flex>
            </Stack>
          </Flex>
        )
      },
      width: '22%',
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.lastModifiedAt)
        const dateB = new Date(b?.lastModifiedAt)
        return dateA - dateB // Sort in descending order
      }
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
    // CVSS
    {
      id: 'VULNS_CVSS_SCORE',
      name: 'CVSS',
      selector: (row) => <CvssTag value={row?.cvssScore} />,
      width: '7%',
      wrap: true,
      sortable: true,
      right: 'true'
    },
    // EPSS
    {
      id: 'VULN_INFOS_EPSS_SCORES',
      name: 'EPSS',
      selector: (row) => {
        const { vulnInfo } = row
        const { epssScore, epssScores } = vulnInfo || ''
        if (epssScore === 0) return <Text color={primaryTextColor}>0 %</Text>
        return <EpssTag value={epssScores} />
      },
      sortable: true,
      width: '12%',
      right: 'true',
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
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          data={data}
          columns={columns}
          onSort={handleSort}
          progressPending={loading}
          subHeaderComponent={subHeaderComponent}
          defaultSortFieldId={globalVulnState?.field}
          defaultSortAsc={globalVulnState?.direction === 'ASC' ? true : false}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {isOpen && (
        <VulnProductsDrawer
          isOpen={isOpen}
          onClose={onClose}
          data={activeRow}
        />
      )}
    </>
  )
}

export default GlobalVulnTable

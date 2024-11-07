import DataTable from 'react-data-table-component'
import { Link, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, linkURl, timeSince } from 'utils'
import SubHeader from 'views/Dashboard/Vulnerabilities/components/SubHeader'

import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Badge, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { Divider, Tooltip } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CvssTag from 'components/Misc/CvssTag'
import EpssTag from 'components/Misc/EpssTag'
import Round from 'components/Misc/Round'
import SeverityTag from 'components/Misc/SeverityTag'

import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import Pagination from '../Pagination'

const GlobalVulnTable = (props) => {
  const { vulns, loading, paginationProps, filters, setFilters } = props

  const { field } = filters
  const { generateProductVulnerabilityDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { headingTextColor, primaryTextColor, primaryBlueText } = useThemeColor(
    ['headingTextColor', 'primaryTextColor', 'primaryBlueText']
  )

  const params = useParams()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

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
              <Link to={linkURl(source, vulnId)} target={'_blank'}>
                <Icon
                  as={ExternalLinkIcon}
                  h={'16px'}
                  w={'16px'}
                  color={primaryBlueText}
                />
              </Link>
              <Stack>
                <Link
                  to={
                    params?.productgroupid
                      ? generateProductVulnerabilityDetailPageUrlFromCurrentUrl(
                          {
                            vulnerabilityid: id
                          }
                        )
                      : `/${path}/vulnerabilities?vulnId=${id}`
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
      width: '18%',
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
          <Stack fontWeight={'medium'} direction={'row'} my={2}>
            <Round bg='gray' label='Unspecified'>
              {metrics?.unspecifiedCount}
            </Round>
            <Round bg='blue' label='In Triage'>
              {metrics?.inTriageCount}
            </Round>
            <Round bg='red' label='Affected'>
              {metrics?.affectedCount}
            </Round>
            <Divider orientation='vertical' colorScheme={'gray'} height={10} />
            <Round bg='orange' label='Fixed'>
              {metrics?.fixedCount}
            </Round>
            <Round bg='green' label='Not Affected'>
              {metrics?.notAffectedCount}
            </Round>
          </Stack>
        )
      },
      width: '22%',
      wrap: true
    },
    // PUBLISHED AT
    {
      id: 'VULNS_PUBLISHED_AT',
      name: 'PUBLISHED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.publishedAt)} placement={'top'}>
          <Text color={primaryTextColor} textAlign={'right'}>
            {timeSince(row?.publishedAt)}
          </Text>
        </Tooltip>
      ),
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
      selector: (row) => (
        <Tooltip
          label={getFullDateAndTime(row?.lastModifiedAt)}
          placement={'top'}
        >
          <Text color={primaryTextColor} textAlign={'right'}>
            {timeSince(row?.lastModifiedAt)}
          </Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.lastModifiedAt)
        const dateB = new Date(b?.lastModifiedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '12%',
      wrap: true,
      right: 'true'
    }
  ]

  // HEADER
  const subHeaderComponent = (
    <SubHeader filters={filters} setFilters={setFilters} />
  )

  // SORTING
  const handleSort = (column, sortDirection) => {
    setFilters((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
  }

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={vulns}
          onSort={handleSort}
          defaultSortFieldId={field}
          customStyles={customStyles(headingTextColor)}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponent}
          responsive
          persistTableHead
        />
        <Pagination {...paginationProps} />
      </Flex>
    </>
  )
}

export default GlobalVulnTable

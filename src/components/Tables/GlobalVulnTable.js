import DataTable from 'react-data-table-component'
import { Link, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, sevColor, timeSince } from 'utils'
import SubHeader from 'views/Dashboard/Vulnerabilities/components/SubHeader'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons'
import { Badge, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { Divider, Tooltip } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Round from 'components/Misc/Round'

import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import Pagination from '../Pagination'

const GlobalVulnTable = (props) => {
  const { vulns, loading, paginationProps, filters, setFilters } = props

  const { field } = filters
  const { generateProductVulnerabilityDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const {
    headingTextColor,
    primaryTextColor,
    primaryBlueText,
    primaryErrorColor,
    primarySuccessColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'primaryBlueText',
    'primaryErrorColor',
    'primarySuccessColor'
  ])

  const params = useParams()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const cvssColor = (cvss) => {
    if (cvss >= 9.0) {
      return 'red'
    } else if (cvss >= 7.0) {
      return 'orange'
    } else if (cvss >= 6.0) {
      return 'yellow'
    } else if (cvss === '') {
      return 'gray'
    } else {
      return 'green'
    }
  }

  const linkURl = (type, id) => {
    if (type === 'osv') {
      return `https://osv.dev/vulnerability/${id}`
    } else {
      return `https://nvd.nist.gov/vuln/detail/${id}`
    }
  }

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
      selector: (row) => {
        const { sev } = row
        return (
          <Tag
            size='md'
            variant='subtle'
            width={'80px'}
            bg={sev && sevColor(sev).bg}
            textColor={sev && sevColor(sev).text}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {sev || '-'}
            </TagLabel>
          </Tag>
        )
      },
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
      selector: (row) => {
        const { cvssScore } = row
        return (
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              width={'50px'}
              colorScheme={cvssColor(cvssScore || '')}
            >
              <TagLabel mx={'auto'}>{cvssScore || '-'}</TagLabel>
            </Tag>
          </Flex>
        )
      },
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
        return (
          <Flex alignItems='center' gap='0'>
            <Tooltip
              placement='top'
              label={
                epssScores?.length > 0
                  ? `${(epssScores[0] * 100).toFixed(3)} %`
                  : '-'
              }
            >
              <Tag
                size='md'
                key='md'
                variant='subtle'
                width={'100px'}
                justifyContent='center'
                alignItems='center'
              >
                <TagLabel>
                  {epssScores?.length > 0
                    ? `${(epssScores[0] * 100).toFixed(3)} %`
                    : '-'}
                </TagLabel>
              </Tag>
            </Tooltip>
            {epssScores && epssScores.length > 1 ? (
              epssScores[0] > epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Up from ${(epssScores[epssScores.length - 1] * 100).toFixed(3)} % last week`}
                >
                  <ChevronUpIcon w={5} h={5} color={primarySuccessColor} />
                </Tooltip>
              ) : epssScores[0] < epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Down from ${(epssScores[epssScores.length - 1] * 100).toFixed(3)} % last week`}
                >
                  <ChevronDownIcon w={5} h={5} color={primaryErrorColor} />
                </Tooltip>
              ) : null
            ) : null}
          </Flex>
        )
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

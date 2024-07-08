import { useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { getFullDateAndTime, sevColor, timeSince } from 'utils'
import { customStyles } from 'utils'
import { linkURl } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CvssCard from 'components/Misc/CvssCard'
import Pagination from 'components/Pagination'
import VexStatusComponent from 'components/VulnerabilityVex/VexStatusComponent'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import {
  FirstDegreePartVulns,
  ShareVulnData,
  ShareVulnFilters
} from 'graphQL/Queries'

import { FaGlobe, FaHouseUser, FaLightbulb, FaSitemap } from 'react-icons/fa'

import VulnFilters from './VulnFilters'

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
  }
}

const ExpandedComponent = ({ data, setActiveRow, onCvssOpen, textColor }) => {
  const { vuln } = data
  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `
  return (
    <Box
      width={'100%'}
      p={5}
      boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
    >
      <Grid templateColumns='repeat(5, 1fr)' gap={12}>
        {/* VULN DATA */}
        <GridItem
          w='100%'
          colSpan={2}
          display={'flex'}
          flexDirection={'column'}
          gap={4}
        >
          {/* Description */}
          <Box>
            <CustomText>Description :</CustomText>
            <Text mt={1} fontSize={14}>
              {vuln.desc}
            </Text>
          </Box>
          {/* Published At  */}
          <Box>
            <CustomText>Published:</CustomText>
            <Text mt={1} fontSize={14}>
              {getFullDateAndTime(vuln.publishedAt)}
            </Text>
          </Box>
          {/* Last Modified At */}
          <Box>
            <CustomText>Last Modified:</CustomText>
            <Text mt={1} fontSize={14}>
              {getFullDateAndTime(vuln.lastModifiedAt)}
            </Text>
          </Box>
          {/* CVSS Vector */}
          <Box>
            <CustomText>CVSS Vector :</CustomText>
            {vuln?.cvssVector ? (
              <Tooltip
                bg='gray.50'
                label={<CvssCard value={vuln?.cvssVector} />}
                placement='top'
              >
                <Tag
                  variant='subtle'
                  width={'fit-content'}
                  colorScheme={'cyan'}
                  cursor={'pointer'}
                  onClick={() => {
                    setActiveRow(data)
                    onCvssOpen()
                  }}
                >
                  {vuln?.cvssVector || '-'}
                </Tag>
              </Tooltip>
            ) : (
              <Tag
                variant='subtle'
                width={'fit-content'}
                colorScheme={'cyan'}
                cursor={'pointer'}
              >
                {vuln?.cvssVector || '-'}
              </Tag>
            )}
          </Box>
          {/* NVD ALIAS ID */}
          {vuln.nvdAliasId ? (
            <Box>
              <CustomText>NVD Alias ID:</CustomText>
              <Flex
                width={'fit-content'}
                mt={1}
                direction='row'
                alignItems={'center'}
                gap={2}
              >
                <Link href={linkURl('nvd', vuln.nvdAliasId)} target={'_blank'}>
                  <Icon
                    as={ExternalLinkIcon}
                    h={'16px'}
                    w={'16px'}
                    color={'blue.500'}
                  />
                </Link>
                <Tooltip label={vuln.nvdAliasId} placement={'top'}>
                  <Text width={'fit-content'} fontSize='sm' color={textColor}>
                    {vuln.nvdAliasId}
                  </Text>
                </Tooltip>
              </Flex>
            </Box>
          ) : null}
          {/* EPSS Percentile */}
          <Box>
            <CustomText>EPSS Percentile :</CustomText>
            <Text mt={1} fontSize={14}>
              {vuln?.vulnInfo?.epssPercentile
                ? (vuln?.vulnInfo?.epssPercentile * 100).toFixed()
                : 0}{' '}
              %
            </Text>
          </Box>
        </GridItem>
        {/* STATUS UPDATE */}
        <GridItem w='90%' ml='auto' colSpan={3}>
          {data && <VexStatusComponent data={data} />}
        </GridItem>
      </Grid>
    </Box>
  )
}

const Vulnerabilities = ({ sbomData }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const { userPermissions, prodVulnState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    severities,
    components,
    statues,
    include,
    kev,
    epss,
    filters,
    direct,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const vulnsPermissions = useHasPermission({
    parentKey: 'view_feeds'
  })

  const textColor = useColorModeValue('gray.700', 'white')
  const [activeRow, setActiveRow] = useState(null)
  const [vulnSearch, setVulnSearch] = useState(searchInput)

  useEffect(() => {
    if (sbomData?.sbom?.sbomParts?.length > 0) {
      prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    }
  }, [prodVulnDispatch, sbomData?.sbom?.sbomParts?.length])

  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 100,
    max: parseFloat(vulnEpss[1]) / 100
  }

  const { nodes, paginationProps, reset, refetch, loading } =
    usePaginatatedQuery(ShareVulnData, {
      skip: sbomId && activeTab === 'vulnerabilities' ? false : true,
      selector: 'shareLynkQuery.sbom.vulns',
      variables: {
        sbomId: sbomId,
        search: searchInput !== '' ? searchInput : undefined,
        severity: severities.length > 0 ? severities : undefined,
        source: include.includes('parts') ? undefined : 'COMPONENT',
        componentName: components.length > 0 ? components : undefined,
        status: statues.length > 0 ? statues : undefined,
        kev:
          kev === 'all' || kev === ''
            ? undefined
            : kev === 'yes'
              ? true
              : false,
        epss: epss !== '' && epss !== 'all' ? range : undefined,
        direct: direct === 'direct only' ? true : undefined,
        includeRetracted: include.includes('retracted') ? true : false,
        vexComplete: vexComplete === 'all' ? undefined : false,
        field: field,
        direction: direction
      }
    })

  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const firstDegreePart = nodes?.filter(
    (item) => item.isFirstDegreePart === true
  )
  const componentVulnIds = firstDegreePart?.map((item) => item?.id)
  const sbomIds = firstDegreePart?.map((item) => item?.component?.sbom?.id)

  useQuery(FirstDegreePartVulns, {
    skip:
      firstDegreePart?.length > 0 &&
      !signedUrlParams &&
      activeTab === 'vulnerabilities'
        ? false
        : true,
    variables: { sbomIds, componentVulnIds },
    onCompleted: (data) => console.log('Parts', data)
  })

  // GET VULN FILTER HEADS
  useQuery(ShareVulnFilters, {
    variables: {
      sbomId: sbomId
    },
    onCompleted: (data) => {
      prodVulnDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: data?.shareLynkQuery?.sbom?.filters
      })
    }
  })

  const {
    isOpen: isCvssOpen,
    onOpen: onCvssOpen,
    onClose: onCvssClose
  } = useDisclosure()

  const cvssColor = (cvss) => {
    if (cvss >= 9.0) {
      return 'red'
    } else if (cvss >= 7.0) {
      return 'orange'
    } else if (cvss >= 6.0) {
      return 'yellow'
    } else {
      return 'gray'
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
        const { vuln, isPart, component, externalUrls, currentExternalUrls } =
          row
        const website =
          externalUrls?.find((item) => item.name === 'website') ||
          currentExternalUrls?.find((item) => item.name === 'website')
        const distribution =
          externalUrls?.find((item) => item.name === 'distribution') ||
          currentExternalUrls?.find((item) => item.name === 'distribution')
        const issueTracker =
          externalUrls?.find((item) => item.name === 'issue-tracker') ||
          currentExternalUrls?.find((item) => item.name === 'issue-tracker')
        const vcs =
          externalUrls?.find((item) => item.name === 'vcs') ||
          currentExternalUrls?.find((item) => item.name === 'vcs')
        const { sbom } = component
        const { projectVersion, project } = sbom
        const { vulnInfo } = vuln
        const { kev } = vulnInfo ? vulnInfo : ''
        return (
          <Flex direction='row' alignItems={'flex-start'} gap={2} my={3}>
            <Link href={linkURl(vuln.source, vuln.vulnId)} target={'_blank'}>
              <Icon
                as={ExternalLinkIcon}
                h={'16px'}
                w={'16px'}
                color={'blue.500'}
              />
            </Link>
            <Stack direction={'column'} spacing={1.5}>
              <Tooltip label={vuln.vulnId} placement={'top'}>
                <Text fontSize='sm' color={textColor} data-tag='allowRowEvents'>
                  {vuln.vulnId !== null ? `${vuln.vulnId}` : ''}
                </Text>
              </Tooltip>
              {isPart && (
                <Text
                  fontSize={'xs'}
                  fontWeight={'medium'}
                  width={'fit-content'}
                >
                  {project?.projectGroup?.name || ''} : {projectVersion || ''}
                </Text>
              )}
              {/* EXTERNAL REFERENCE */}
              <Stack direction={'row'} alignItems={'center'}>
                {/* WEBSITE */}
                <Tooltip placement='top' label={website?.url}>
                  <Link href={website?.url} isExternal>
                    <IconButton
                      type='button'
                      size='xs'
                      variant='solid'
                      isDisabled={!website}
                      colorScheme='gray'
                      icon={<FaGlobe fontSize={16} />}
                    />
                  </Link>
                </Tooltip>
                {/* DISTRIBUTION */}
                <Tooltip placement='top' label={vcs?.url}>
                  <Link href={vcs?.url} isExternal>
                    <IconButton
                      type='button'
                      size='xs'
                      variant='solid'
                      colorScheme='gray'
                      isDisabled={!vcs}
                      icon={<FaSitemap fontSize={16} />}
                    />
                  </Link>
                </Tooltip>
                {/* ADVISORIES */}
                <Tooltip placement='top' label={issueTracker?.url}>
                  <Link href={issueTracker?.url} isExternal>
                    <IconButton
                      type='button'
                      size='xs'
                      variant='solid'
                      colorScheme='gray'
                      isDisabled={!issueTracker}
                      icon={<FaHouseUser fontSize={16} />}
                    />
                  </Link>
                </Tooltip>
                {/* SUPPORT */}
                <Tooltip placement='top' label={distribution?.url}>
                  <Link href={distribution?.url} isExternal>
                    <IconButton
                      type='button'
                      size='xs'
                      variant='solid'
                      isDisabled={!distribution}
                      colorScheme='gray'
                      icon={<FaLightbulb fontSize={16} />}
                    />
                  </Link>
                </Tooltip>
              </Stack>
              {kev === true && (
                <Badge width={'fit-content'} variant='subtle' colorScheme='red'>
                  KEV
                </Badge>
              )}
            </Stack>
          </Flex>
        )
      },
      width: '15%',
      sortable: true
    },
    // COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Stack
            direction='column'
            alignItems={'flex-start'}
            spacing={1}
            my={3}
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
          >
            <Text>{component?.name || ''}</Text>
            <Text>{component?.version || ''}</Text>
          </Stack>
        )
      },
      wrap: true,
      width: '12%',
      sortable: true
    },
    // SEVERITY
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => {
        const { vuln } = row
        return (
          <Tag
            size='md'
            variant='subtle'
            width={'80px'}
            colorScheme={sevColor(vuln?.sev)}
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vuln?.sev || '-'}
            </TagLabel>
          </Tag>
        )
      },
      width: '9%',
      sortable: true,
      wrap: true
    },
    // SOURCE
    {
      id: 'VULNS_SOURCE',
      name: 'SOURCE',
      selector: (row) => {
        const { vuln } = row
        return (
          <Tag
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            size='sm'
            key='md'
            variant='solid'
            colorScheme={vuln.source === 'osv' ? 'red' : 'blue'}
            textTransform={'uppercase'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <TagLabel>{vuln.source}</TagLabel>
          </Tag>
        )
      },
      width: '9%',
      sortable: true,
      wrap: true
    },
    // CVSS
    {
      id: 'VULNS_CVSS_SCORE',
      name: 'CVSS',
      selector: (row) => {
        const { vuln } = row
        return (
          <Flex
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            minWidth='max-content'
            alignItems='center'
            gap='2'
          >
            <Tag
              size='md'
              key='md'
              variant='subtle'
              width={'50px'}
              colorScheme={cvssColor(vuln.cvssScore)}
            >
              <TagLabel mx={'auto'}>
                {vuln.cvssScore ? vuln.cvssScore : '-'}
              </TagLabel>
            </Tag>
          </Flex>
        )
      },
      width: '7%',
      sortable: true,
      wrap: true
    },
    // EPSS
    {
      id: 'VULN_INFOS_EPSS_SCORES',
      name: 'EPSS',
      selector: (row) => {
        const { vuln } = row
        const { vulnInfo } = vuln
        const { epssScores } = vulnInfo ? vulnInfo : ''
        return (
          <Flex
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            alignItems='center'
            gap='0'
          >
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
                  <ChevronUpIcon w={5} h={5} color='green.500' />
                </Tooltip>
              ) : epssScores[0] < epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Down from ${(epssScores[epssScores.length - 1] * 100).toFixed(3)} % last week`}
                >
                  <ChevronDownIcon w={5} h={5} color='red.500' />
                </Tooltip>
              ) : null
            ) : null}
          </Flex>
        )
      },
      width: '10%',
      sortable: true,
      wrap: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row.component.version} placement='top'>
          <Text
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            textAlign='right'
            my={2}
          >
            {row.component.version}
          </Text>
        </Tooltip>
      ),
      wrap: true,
      width: '12%',
      sortable: true,
      right: 'true',
      omit: true
    },
    // STATUS
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(
              vexStatus ? vexStatus.name : 'Unspecified'
            )}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vexStatus !== null ? vexStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true,
      sortable: true
    },
    // UPDATED AT
    {
      id: 'COMPONENT_VULNS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip
          label={getFullDateAndTime(row.vuln.updatedAt)}
          placement={'top'}
        >
          <Text
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            textAlign={'right'}
          >
            {timeSince(row.vuln.updatedAt)}
          </Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.vuln.updatedAt)
        const dateB = new Date(b.vuln.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '10%',
      wrap: true,
      right: 'true'
    }
  ]

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setVulnSearch('')
    prodVulnDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    reset()
  }, [prodVulnDispatch, reset])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setVulnSearch(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    (event) => {
      const { value } = event.target
      if (event.key === 'Enter') {
        prodVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        reset()
      }
    },
    [prodVulnDispatch, reset]
  )

  const handleRefresh = useCallback(() => {
    refetch()
    reset()
  }, [refetch, reset])

  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'flex-start'}
        justifyContent={'space-between'}
        gap={2}
      >
        <Flex
          flexDirection={'row'}
          alignItems={'flex-start'}
          flexWrap={'wrap'}
          gap={3}
        >
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='vuln'
            filterText={vulnSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />
          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filters ? (
            <VulnFilters reset={() => reset()} />
          ) : (
            <Stack direction='row' spacing={4}>
              {[1, 2, 3, 4].map((_, index) => (
                <Skeleton key={index} width={'100px'} height={'38px'} />
              ))}
            </Stack>
          )}
        </Flex>
        {/* REFRESH */}
        <Tooltip label='Refresh'>
          <IconButton
            onClick={handleRefresh}
            colorScheme='blue'
            icon={<RepeatIcon />}
          />
        </Tooltip>
      </Flex>
    )
  }, [
    filters,
    handleClear,
    handleRefresh,
    handleSearch,
    onSearchInputChange,
    reset,
    vulnSearch
  ])

  const handleSort = (column, sortDirection) => {
    prodVulnDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (vulnsPermissions === false) {
    return (
      <Text mt={4} textAlign={'center'}>
        You do not have permission to access this data
      </Text>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        {/* TABLE */}
        <DataTable
          className='data-table-container'
          columns={columns}
          data={nodes}
          customStyles={customStyles}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          responsive={true}
          expandableRows
          expandOnRowClicked
          persistTableHead
          expandableRowsComponent={ExpandedComponent}
          expandableRowsComponentProps={{
            setActiveRow,
            onCvssOpen,
            textColor
          }}
        />
      </Flex>

      {/* PAGINATION */}
      {<Pagination {...paginationProps} />}

      {/* CVSS CARD */}
      {isCvssOpen && (
        <CvssCard
          isOpen={isCvssOpen}
          onClose={onCvssClose}
          value={activeRow?.vuln?.cvssVector}
        />
      )}
    </>
  )
}

export default Vulnerabilities

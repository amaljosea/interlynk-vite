import { useMutation, useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, linkURl, sevColor } from 'utils'
import { isCustomerView, timeSince } from 'utils'
import VexModal from 'views/Dashboard/Vulnerabilities/components/VexModal'
import ImportWizard from 'views/Sbom/components/ImportWizard'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import JiraCreateIssueModal from 'components/Connections/JiraCreateIssueModal'
import CustomLoader from 'components/CustomLoader'
import VulnLinkDrawer from 'components/Drawer/VulnLinkDrawer'
import { FixedIcon } from 'components/Icons/Icons'
import RefreshBtn from 'components/Icons/RefreshBtn'
import CvssCard from 'components/Misc/CvssCard'
import ExternalLink from 'components/Misc/ExternalLink'
import Pagination from 'components/Pagination'
import RowComponent from 'components/RowComponent'
import VexStatusComponent from 'components/VulnerabilityVex/VexStatusComponent'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { ManualVulnScan } from 'graphQL/Mutation'
import {
  FirstDegreePartVulns,
  GetCdxResponses,
  GetDefaultJiraProduct,
  GetOrgConnections,
  GetVulnData,
  GetVulnFilterData,
  ShareVulnFilters
} from 'graphQL/Queries'

import { BsCircleHalf } from 'react-icons/bs'
import { FaEllipsisV } from 'react-icons/fa'
import {
  FaBookOpen,
  FaBug,
  FaBullhorn,
  FaCopy,
  FaLink,
  FaListCheck,
  FaPen
} from 'react-icons/fa6'

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

const ExpandedComponent = (props) => {
  const { data, setActiveRow, onCvssOpen, isArchived } = props
  const { vuln, isPart, fixedVersions, lastAffectedVersions, currentExternalUrls, externalUrls } = data
  const advisories = isPart
    ? currentExternalUrls?.find((item) => item.name === 'advisories')
    : externalUrls?.find((item) => item.name === 'advisories')
  const documentation = isPart
    ? currentExternalUrls?.find((item) => item.name === 'documentation')
    : externalUrls?.find((item) => item.name === 'documentation')
  const other = isPart
    ? currentExternalUrls?.find((item) => item.name === 'other')
    : externalUrls?.find((item) => item.name === 'other')

  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `
  const { primaryBlueText, primaryTextColor } = useThemeColor(['primaryBlueText','primaryTextColor'])
  const onCheck = (item) => (item ? primaryBlueText : primaryTextColor)

  return (
    <Box
      width={'100%'}
      p={5}
      boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
    >
      <Grid templateColumns='repeat(5, 1fr)' gap={12} py={2}>
        {/* VULN DATA */}
        <GridItem
          colSpan={2}
          sx={{w:'100%', gap:4, display:'flex', flexDir:'column'}}
        >
          {/* Description */}
          <Box>
            <CustomText>Description :</CustomText>
            <Text color={primaryTextColor} mt={1} fontSize={14}>
              {vuln.desc}
            </Text>
          </Box>
          {/* EXTERNAL LINKS */}
          <Box>
            <CustomText>External Links :</CustomText>
            <Stack direction={'row'} alignItems={'center'} mt={1}>
              {/* advisories */}
              <ExternalLink
                link={advisories}
                icon={<FaBullhorn color={onCheck(advisories)} fontSize={16} />}
              />
              {/* documentation */}
              <ExternalLink
                link={documentation}
                icon={<FaBookOpen color={onCheck(documentation)} fontSize={16} />}
              />
              {/* other */}
              <ExternalLink
                link={other}
                icon={<FaLink color={onCheck(other)} fontSize={16} />}
              />
            </Stack>
          </Box>
          {/* Published At  */}
          <Box>
            <CustomText>Published:</CustomText>
            <Text color={primaryTextColor} mt={1} fontSize={14}>
              {getFullDateAndTime(vuln.publishedAt)}
            </Text>
          </Box>
          {/* Last Modified At */}
          <Box>
            <CustomText>Last Modified:</CustomText>
            <Text color={primaryTextColor} mt={1} fontSize={14}>
              {getFullDateAndTime(vuln.lastModifiedAt)}
            </Text>
          </Box>
          {/* Fixed Versions */}
          <Box>
            <CustomText>Fixed Version:</CustomText>
            <Flex mt={1} flexWrap={'wrap'} alignItems={'center'} gap={2}>
              {fixedVersions?.map((item, index) => (
                <Tag colorScheme='blue' size='sm' key={index}>
                  {item}
                </Tag>
              ))}
            </Flex>
          </Box>
          {/* Last Affected Versions */}
          <Box>
            <CustomText>Last Affected Version:</CustomText>
            <Flex mt={1} flexWrap={'wrap'} alignItems={'center'} gap={2}>
              {lastAffectedVersions?.map((item, index) => (
                <Tag colorScheme='blue' size='sm' key={index} pt={1}>
                  {item}
                </Tag>
              ))}
            </Flex>
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
                direction='row'
                sx={{w:'fit-content', mt:1, gap:2, alignItems:'center'}}
              >
                <Link href={linkURl('nvd', vuln.nvdAliasId)} target={'_blank'}>
                  <Icon
                    as={ExternalLinkIcon}
                    sx={{w:'16px', h:'16px'}}
                    color={primaryBlueText}
                  />
                </Link>
                <Tooltip label={vuln.nvdAliasId} placement={'top'}>
                  <Text
                    width={'fit-content'}
                    fontSize='sm'
                    color={primaryTextColor}
                  >
                    {vuln.nvdAliasId}
                  </Text>
                </Tooltip>
              </Flex>
            </Box>
          ) : null}
          {/* EPSS Percentile */}
          <Box>
            <CustomText>EPSS Percentile :</CustomText>
            <Text color={primaryTextColor} mt={1} fontSize={14}>
              {vuln?.vulnInfo?.epssPercentile
                ? (vuln?.vulnInfo?.epssPercentile * 100).toFixed()
                : 0}{' '}
              %
            </Text>
          </Box>
        </GridItem>
        {/* STATUS UPDATE */}
        <GridItem w='90%' ml={'auto'} colSpan={3}>
          {data && <VexStatusComponent data={data} isArchived={isArchived} />}
        </GridItem>
      </Grid>
    </Box>
  )
}

const Vulnerabilities = ({ sbomData }) => {
  const params = useParams()
  const navigate = useNavigate()
  const productId = params.productid
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const activeColor = useColorModeValue('#3182ce', '#63b3ed')
  const onCheck = (item) => (item ? activeColor : textColor)
  const {
    headingTextColor,
    primaryTextColor,
    primaryErrorColor,
    primarySuccessColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'primaryErrorColor',
    'primarySuccessColor'
  ])

  const isArchived = sbomData?.lifecycle === 'archived'

  const { data: configs } = useQuery(GetOrgConnections, {
    fetchPolicy: 'network-only'
  })

  const { data: settings } = useQuery(GetDefaultJiraProduct, {
    variables: { id: productId }
  })

  const [jiraConfigWarning, setJiraConfigWarning] = useState(false)

  const { showToast } = useCustomToast()
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')
  const customerView = isCustomerView()

  const { isFreeTier } = useGlobalQueryContext()
  const { totalRows, prodVulnState, dispatch } = useGlobalState()
  const {
    field,
    searchInput,
    severities,
    components,
    statues,
    include,
    kev,
    epss,
    direct,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 100,
    max: parseFloat(vulnEpss[1]) / 100
  }

  const { data: allCdx } = useQuery(GetCdxResponses)

  const orderBy = {
    field: prodVulnState?.field,
    direction: prodVulnState?.direction
  }

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetVulnData,
    {
      skip: sbomId && activeTab === 'vulnerabilities' ? false : true,
      selector: 'sbom.vulns',
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
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
        orderBy: searchInput === '' ? orderBy : undefined
      }
    }
  )

  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const firstDegreePart = nodes?.filter(
    (item) => item.isFirstDegreePart === true
  )
  const componentVulnIds = firstDegreePart?.map((item) => item?.id)
  const sbomIds = firstDegreePart?.map((item) => item?.component?.sbom?.id)
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
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

  const [activeRow, setActiveRow] = useState(null)
  const [vulnSearch, setVulnSearch] = useState(searchInput)
  const [toggleClear, setToggleClear] = useState(false)
  const [selectedVulns, setSelectedVulns] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')

  const VEX = useDisclosure()
  const LINK = useDisclosure()
  const JIRA = useDisclosure()
  const CVSS = useDisclosure()
  const IMPORT = useDisclosure()

  // GET VULN FILTER HEADS
  useQuery(signedUrlParams ? ShareVulnFilters : GetVulnFilterData, {
    variables: {
      projectId: signedUrlParams ? undefined : productId,
      sbomId: sbomId
    },
    onCompleted: (data) => {
      prodVulnDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: signedUrlParams
          ? data?.shareLynkQuery?.sbom?.filters
          : data?.sbom?.filters
      })
    }
  })

  const [onVulnScan] = useMutation(ManualVulnScan)

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  const updateCon = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'create_update_connection'
  })

  const handleChange = (state) => {
    setSelectedVulns(state?.selectedRows)
    setSelectedGroup(
      state?.selectedRows[0]?.component?.sbom?.project?.projectGroup?.id
    )
  }

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

  const onGlobalView = (id, vuln) => {
    localStorage.setItem('activeVuln', vuln)
    navigate(`/vendor/vulnerabilities?vulnId=${id}`)
  }

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'VULNS_VULN_ID',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { vuln, isPart, component } = row
        const { sbom } = component
        const { projectVersion, project } = sbom
        const { id, vulnInfo } = vuln
        const { kev } = vulnInfo ? vulnInfo : ''
        return (
          <Flex direction='row' alignItems={'flex-start'} gap={2} my={3}>
            <Tooltip label={vuln.source === 'osv' ? 'OSV View' : 'NVD View'}>
              <Link to={linkURl(vuln.source, vuln.vulnId)} target={'_blank'}>
                <Icon
                  as={ExternalLinkIcon}
                  sx={{ w: '16px', h: '16px', color: primaryBlueText }}
                />
              </Link>
            </Tooltip>
            <Stack direction={'column'} spacing={1.5}>
              <Text
                fontSize='sm'
                color={primaryBlueText}
                data-tag='allowRowEvents'
                onClick={() => onGlobalView(id, vuln.vulnId)}
              >
                {vuln.vulnId !== null ? `${vuln.vulnId}` : ''}
              </Text>
              {isPart && (
                <Text
                  fontWeight={'medium'}
                  sx={{w:'fit-content', fontSize: 'xs', color: primaryTextColor}}
                >
                  {project?.projectGroup?.name || ''} : {projectVersion || ''}
                </Text>
              )}
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
        const { component, fixedVersions } = row
        const { version } = component || ''
        const isExists = fixedVersions?.length > 0
        return (
          <Stack
            spacing={1}
            sx={{my:3, cursor:'pointer', alignItems:'flex-start', direction:'column'}}
          >
            <RowComponent content={component} />
            <Flex alignItems={'center'} gap={2}>
              <Text color={primaryTextColor}>{version || ''}</Text>
              <Tooltip
                label={'Fixed In: ' + fixedVersions?.join(', ')}
                placement='top'
              >
                <Icon as={FixedIcon} display={isExists ? 'flex' : 'none'} />
              </Tooltip>
            </Flex>
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
            sx={{w:'80px', bg: sevColor(vuln?.sev).bg, color: sevColor(vuln?.sev).text}}
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
            textTransform={'uppercase'}
            colorScheme={vuln.source === 'osv' ? 'red' : 'blue'}
            sx={{w:'100%', alignItems:'center', justifyContent:'center'}}
          >
            <TagLabel>{vuln.source}</TagLabel>
          </Tag>
        )
      },
      width: '8.3%',
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
            sx={{minW:'max-content',alignItems:'center',gap:'2'}}
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
            sx={{gap:0, alignItems:'center'}}
          >
            <Tooltip
              placement='top'
              label={ epssScores?.length > 0 ? `${(epssScores[0] * 100).toFixed(3)} %` : '-' }
            >
              <Tag
                size='md'
                key='md'
                variant='subtle'
                sx={{w:'100px', alignItems:'center', justifyContent:'center'}}
              >
                <TagLabel>
                  {epssScores?.length > 0 ? `${(epssScores[0] * 100).toFixed(3)} %` : '-'}
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
      width: '10%',
      sortable: true,
      wrap: true
    },
    // STATUS
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus, isComplete } = row
        return (
          <Tag
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            size='md'
            variant='solid'
            width={'160px'}
            colorScheme={statusColor(
              vexStatus ? vexStatus.name : 'Unspecified'
            )}
          >
            <TagLabel mx={'auto'} as={Flex} gap={2} alignItems='center'>
              {isComplete === false && <BsCircleHalf />}{' '}
              {vexStatus !== null ? vexStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      width: '13%',
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
            color={primaryTextColor}
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
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { isPart, currentExternalUrls, externalUrls } = row
        const issueTracker = isPart
          ? currentExternalUrls?.find((item) => item.name === 'issue-tracker')
          : externalUrls?.find((item) => item.name === 'issue-tracker')
        return (
          <Flex alignItems={'center'} gap={1}>
            <ExternalLink
              link={issueTracker}
              icon={<FaListCheck color={onCheck(issueTracker)} fontSize={16} />}
            />
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<FaEllipsisV />}
                variant='none'
                color='gray.400'
              />
              <Portal>
                <MenuList fontSize='sm'>
                  <MenuItem
                    isDisabled={!editVulns}
                    onClick={() => {
                      setActiveRow(row)
                      LINK.onOpen()
                    }}
                  >
                    Edit Links
                  </MenuItem>
                  {row?.externalUrls?.find(
                    (externalUrl) => externalUrl.name === 'issue-tracker'
                  ) ? (
                    <MenuItem
                      hidden={isFreeTier}
                      isDisabled={!updateCon}
                      onClick={() => {
                        window.open(
                          row.externalUrls.find(
                            (externalUrl) =>
                              externalUrl.name === 'issue-tracker'
                          ).url,
                          '_blank'
                        )
                      }}
                    >
                      View Jira Ticket
                    </MenuItem>
                  ) : (
                    <MenuItem
                      hidden={isFreeTier}
                      isDisabled={!updateCon}
                      onClick={() => {
                        if (jiraConfigWarning) {
                          showToast({
                            title: 'Jira Configuration not set.',
                            description:
                              'Please configure Jira connections in the Organization Settings -> Connections.',
                            status: 'error'
                          })
                        } else {
                          setActiveRow(row)
                          JIRA.onOpen()
                        }
                      }}
                    >
                      Create Jira Ticket
                    </MenuItem>
                  )}
                </MenuList>
              </Portal>
            </Menu>
          </Flex>
        )
      },
      wrap: true,
      right: 'true',
      omit: customerView || isArchived ? true : false
    }
  ]

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
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
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && value !== '') {
        prodVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        reset()
      }
    },
    [prodVulnDispatch, reset]
  )

  // SCAN VULN
  const handleScan = useCallback(async () => {
    await onVulnScan({
      variables: { id: sbomId }
    }).then((res) => {
      if (sbomData?.vulnRunStatus === 'IN_PROGRESS') {
        showToast({
          description: 'A scan is in-progress',
          status: 'info'
        })
      } else {
        if (res.data) {
          showToast({
            description: 'Vulnerability re-scan started',
            status: 'success'
          })
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
          reset()
        }
      }
    })
  }, [ onVulnScan, prodVulnDispatch, reset, sbomData?.vulnRunStatus, sbomId, showToast ])

  const subHeader = useMemo(() => {
    return (
      <Flex
        justifyContent={'space-between'}
        sx={{w:'100%', gap:2, alignItems:'flex-start'}}
      >
        <Flex sx={{gap:3, flexWrap:'wrap', alignItems:'flex-start'}}>
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='vuln'
            filterText={vulnSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />
          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          <VulnFilters reset={() => reset()} />
        </Flex>
        <Stack direction='row' alignItems={'center'} width={'fit-content'}>
          {/* UPDATE STATUES */}
          {selectedVulns.length > 0 && (
            <Tooltip label={'Set Status'}>
              <IconButton
                colorScheme='blue'
                onClick={VEX.onOpen}
                isDisabled={!editVulns}
                hidden={signedUrlParams}
                icon={<FaPen />}
              />
            </Tooltip>
          )}
          {/* SCAN VULN */}
          <Tooltip label={'Scan Vulnerabilities'}>
            <IconButton
              colorScheme='blue'
              onClick={handleScan}
              hidden={signedUrlParams || isArchived}
              icon={<FaBug />}
            />
          </Tooltip>
          {/* IMPORT STATUS */}
          <Tooltip label='Import Statuses'>
            <IconButton
              variant='solid'
              colorScheme='blue'
              fontWeight='normal'
              fontSize={'sm'}
              onClick={() => {
                prodVulnDispatch({ type: 'RESET_SELECTED_VULN' })
                IMPORT.onOpen()
              }}
              hidden={signedUrlParams || isArchived}
              isDisabled={!editVulns}
              icon={<FaCopy size={18} />}
            />
          </Tooltip>
          {/* REFRESH */}
          <RefreshBtn onClick={() => reset()} />
        </Stack>
      </Flex>
    )
  }, [
    editVulns,
    handleClear,
    handleScan,
    handleSearch,
    VEX,
    isArchived,
    onSearchInputChange,
    IMPORT,
    prodVulnDispatch,
    reset,
    selectedVulns.length,
    signedUrlParams,
    vulnSearch
  ])

  const handleSort = (column, sortDirection) => {
    prodVulnDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onCvssOpen = () => CVSS.onOpen()
  
  useEffect(() => {
    if (configs) {
      if (!configs?.organization?.connections?.nodes[0]?.connection) {
        setJiraConfigWarning(true)
      }
    }
  }, [configs])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        {/* TABLE */}
        <DataTable
          className='data-table-container'
          columns={columns}
          data={nodes}
          customStyles={customStyles(headingTextColor)}
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
            allCdx,
            setActiveRow,
            onCvssOpen,
            isArchived
          }}
          selectableRows={!signedUrlParams}
          clearSelectedRows={toggleClear}
          onSelectedRowsChange={handleChange}
        />
      </Flex>

      {/* PAGINATION */}
      <Pagination {...paginationProps} />

      {LINK.isOpen && (
        <VulnLinkDrawer
          data={activeRow}
          isOpen={LINK.isOpen}
          onClose={LINK.onClose}
          sbomId={sbomId}
        />
      )}
      {JIRA.isOpen && (
        <JiraCreateIssueModal
          isOpen={JIRA.isOpen}
          onClose={JIRA.onClose}
          row={activeRow}
          defaultProject={settings?.project?.projectSetting?.jiraProject}
        />
      )}
      {/* COPY DATA TABLE */}
      {IMPORT.isOpen && nodes && (
        <Drawer
          size='full'
          placement='bottom'
          isOpen={IMPORT.isOpen}
          onClose={IMPORT.onClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton
              onClick={() => prodVulnDispatch({ type: 'RESET_IMPORT_SBOMS' })}
            />
            <DrawerHeader>
              <Text fontSize={20} fontWeight={'medium'}>
                Import Vulnerability Status
              </Text>
            </DrawerHeader>
            <DrawerBody mt={2}>
              {/* IMPORT WIZARD */}
              <ImportWizard
                variant='circle'
                currentSbomId={sbomId}
                currentProductId={productId}
                onClose={IMPORT.onClose}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {VEX.isOpen && selectedVulns.length > 0 && (
        <VexModal
          isOpen={VEX.isOpen}
          onClose={VEX.onClose}
          checkEquals={true}
          selectedGroup={selectedGroup}
          selectedVulns={selectedVulns}
          setSelectedVulns={setSelectedVulns}
          setToggleClear={setToggleClear}
        />
      )}

      {/* CVSS CARD */}
      {CVSS.isOpen && (
        <CvssCard
          isOpen={CVSS.isOpen}
          onClose={CVSS.onClose}
          value={activeRow?.vuln?.cvssVector}
        />
      )}
    </>
  )
}

export default Vulnerabilities

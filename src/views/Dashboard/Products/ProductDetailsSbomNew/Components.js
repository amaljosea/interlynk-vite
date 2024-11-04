import { useLazyQuery, useMutation } from '@apollo/client'
import styled from '@emotion/styled'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { GetIcon, customStyles, timeSince, truncatedValue } from 'utils'
import { getFullDateAndTime, isCustomerView, isValidPurl } from 'utils'
import { getSignedUrlParams } from 'utils'
import { openSsf } from 'variables/general'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { AddIcon, ViewIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Portal,
  Stack,
  Text,
  Tooltip,
  VStack
} from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { useColorMode, useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import GraphDrawer from 'components/Drawer/GraphDrawer'
import RelationshipDrawer from 'components/Drawer/RelationshipDrawer'
import { HealthScore } from 'components/HealthScore'
import RefreshBtn from 'components/Icons/RefreshBtn'
import CpeCard from 'components/Misc/CpeCard'
import ExternalLink from 'components/Misc/ExternalLink'
import PurlCard from 'components/Misc/PurlCard'
import ComponentAddModal from 'components/Modal/ComponentAddModal'
import Pagination from 'components/Pagination'
import SupplierTag from 'components/SupplierTag'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { deleteComSupplier } from 'graphQL/Mutation'
import { GetComponentData, GetComponentPath } from 'graphQL/Queries'

import { BsFillPatchQuestionFill } from 'react-icons/bs'
import { FaEllipsisV, FaGlobe, FaLightbulb, FaSitemap } from 'react-icons/fa'
import { FaListCheck } from 'react-icons/fa6'
import { RiFundsBoxFill } from 'react-icons/ri'

import CompDrawer from '../components/CompDrawer'
import CompInsights from '../components/CompInsights'
import ExportCsv from '../components/ExportCsv'
import HealthMap from '../components/HealthMap'
import CompFilters from './CompFilters'

const Components = ({ sbomData }) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const { colorMode } = useColorMode()
  const customerView = isCustomerView()
  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const isArchived = sbomData?.lifecycle === 'archived'

  const {
    headingTextColor,
    primaryTextColor,
    inverseSecondaryBgColor,
    primaryBlueText,
    secondaryTextColor,
    secondaryTextInverse,
    primaryErrorColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'inverseSecondaryBgColor',
    'primaryBlueText',
    'secondaryTextColor',
    'secondaryTextInverse',
    'primaryErrorColor'
  ])

  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: ${secondaryTextInverse};
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `

  const { prodCompState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    ecosystems,
    kinds,
    licenses,
    suppliers,
    scope,
    direct,
    totalComp,
    expandedRows,
    include
  } = prodCompState
  const { prodCompDispatch } = dispatch

  const getUndefinedIfEmptyOrAll = (value, allValue = 'all') =>
    value.includes(allValue) || value.length === 0 ? undefined : value

  const compBtn = useRef(null)
  const [activeRow, setActiveRow] = useState(null)
  const [compSearch, setCompSearch] = useState(searchInput || '')

  const compData = useMemo(() => {
    return {
      ecosystem: getUndefinedIfEmptyOrAll(ecosystems),
      kind: getUndefinedIfEmptyOrAll(kinds),
      licenses: getUndefinedIfEmptyOrAll(licenses),
      supplierName: getUndefinedIfEmptyOrAll(suppliers),
      primary: scope === 'primary' ? true : undefined,
      internal: scope === 'internal' ? true : undefined,
      direct: direct === true ? true : undefined,
      includeParts: include === 'parts' ? true : undefined
    }
  }, [direct, ecosystems, include, kinds, licenses, scope, suppliers])

  // GET COMPONENT DATA
  const { nodes, error, paginationProps, reset, loading } = usePaginatedQuery(
    GetComponentData,
    {
      selector: 'sbom.components',
      variables: {
        ...compData,
        sbomId: sbomId,
        projectId: productId,
        orderBy: searchInput === '' ? { field, direction } : undefined,
        search: searchInput !== '' ? searchInput : undefined
      },
      onCompleted: (data) => {
        prodCompDispatch({
          type: 'SET_TOTAL_COMP',
          payload: data?.sbom?.components?.totalCount
        })
      }
    }
  )

  const { lifecycle, primaryComponent } = sbomData || ''

  const [activeComp, setActiveComp] = useState(null)

  const updateComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const [getComPath, { data: comPath, loading: comPathLoading }] =
    useLazyQuery(GetComponentPath)

  const MAP = useDisclosure()
  const CPE = useDisclosure()
  const EDIT = useDisclosure()
  const PURL = useDisclosure()
  const GRAPH = useDisclosure()
  const DELETE = useDisclosure()
  const RELATION = useDisclosure()
  const COMPONENT = useDisclosure()
  const INSIGHTS = useDisclosure()

  const onCreateComponent = useCallback(() => {
    setActiveRow(null)
    COMPONENT.onOpen()
  }, [COMPONENT])

  const onEditOpen = (row) => {
    setActiveRow(row)
    EDIT.onOpen()
  }

  const onRelOpen = (row) => {
    setActiveRow(row)
    getComPath({ variables: { compId: row.id, sbomId: sbomId } })
    RELATION.onOpen()
  }

  const onCheckPurl = (data) => {
    setActiveRow(data)
    PURL.onOpen()
  }

  const onCheckCpe = (data) => {
    setActiveRow(data)
    CPE.onOpen()
  }

  const hanldeAnalysis = (data) => {
    setActiveRow(data)
    INSIGHTS.onOpen()
  }

  // COLUMNS
  const columns = [
    // COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'NAME',
      selector: (row) => {
        const { purl, name, primary, internal, sbomId: bomId, sbom } = row
        const { projectVersion, project } = sbom || ''
        const { projectGroup } = project || ''
        const isPart = sbomId !== bomId
        const validPurl = isValidPurl(purl)
        const icon = validPurl ? (
          GetIcon(purl?.split('/')[0], colorMode)
        ) : (
          <BsFillPatchQuestionFill
            fontSize={24}
            color={inverseSecondaryBgColor}
          />
        )
        return (
          <Flex sx={{ alignItems: 'center', gap: 2, my: 3 }}>
            <Box width={'50px'}>
              <IconButton icon={icon} isRound={true} variant='solid' />
            </Box>
            <Flex
              flexDirection={'column'}
              sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
            >
              {/* COMPONENT NAME */}
              <Tooltip label={name}>
                <Text
                  color={primaryTextColor}
                  aria-label='component_name'
                  data-tag='allowRowEvents'
                >
                  {truncatedValue(name, 30)}
                </Text>
              </Tooltip>
              {isPart && (
                <Text
                  sx={{
                    fontSize: 'xs',
                    color: primaryTextColor,
                    w: 'fit-content'
                  }}
                  fontWeight={'medium'}
                >
                  {projectGroup?.name
                    ? truncatedValue(projectGroup?.name, 10)
                    : ''}{' '}
                  : {projectVersion ? truncatedValue(projectVersion, 10) : ''}
                </Text>
              )}
              {/* COMPONENT TYPE */}
              <Flex flexWrap={'wrap'} gap={2} alignItems={'center'}>
                {primary && (
                  <Tag
                    width={'fit-content'}
                    size={'sm'}
                    variant='subtle'
                    colorScheme='blue'
                  >
                    <TagLabel textTransform={'capitalize'}>Primary</TagLabel>
                  </Tag>
                )}
                {internal && (
                  <Tag
                    width={'fit-content'}
                    size={'sm'}
                    variant='subtle'
                    colorScheme='cyan'
                  >
                    <TagLabel textTransform={'capitalize'}>Internal</TagLabel>
                  </Tag>
                )}
              </Flex>
            </Flex>
          </Flex>
        )
      },
      width: '25%',
      wrap: true,
      sortable: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => <Text color={primaryTextColor}>{row?.version}</Text>,
      wrap: true,
      width: '10%',
      sortable: true
    },
    // COMPONENT HEALTH
    {
      id: 'COMPONENTS_HEALTH',
      name: 'HEALTH',
      selector: (row) => {
        const { healthScore } = row
        return <HealthScore isComponent value={healthScore} />
      },
      width: '10%',
      omit: isFreeTier
    },
    // IDENTIFIERS
    {
      id: 'IDENTIFIERS',
      name: 'IDENTIFIERS',
      selector: (row) => {
        const { purl, cpes } = row
        return (
          <Flex gap={2}>
            {cpes?.length > 0 && (
              <Tooltip label={cpes[0]}>
                <Button
                  size='xs'
                  color={primaryTextColor}
                  onClick={() => onCheckCpe(row)}
                >
                  CPE
                </Button>
              </Tooltip>
            )}
            {purl && (
              <Tooltip label={purl}>
                <Button
                  size='xs'
                  color={primaryTextColor}
                  onClick={() => onCheckPurl(row)}
                >
                  PURL
                </Button>
              </Tooltip>
            )}
          </Flex>
        )
      },
      width: '12%',
      wrap: true
    },
    // LICENSES
    {
      id: 'COMPONENTS_LICENSES_EXP',
      name: 'LICENSES',
      selector: (row) => {
        const { licenses, licensesExp, licensesCustom } = row
        const totalSpdx = licenses?.length > 1 && licenses.slice(1)
        const totalCustom =
          licensesCustom?.length > 1 && licensesCustom.slice(1)
        return (
          <Flex
            justifyContent={'flex-end'}
            sx={{ my: 2, gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}
          >
            {/* SPDX */}
            {licenses && (
              <Stack direction={'row'} spacing={2}>
                {licenses.length > 0 && (
                  <Tooltip label={licenses[0]} placement={'top'}>
                    <Tag
                      width={'150px'}
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                    >
                      <TagLabel mx={'auto'}>{licenses[0]}</TagLabel>
                    </Tag>
                  </Tooltip>
                )}
                {totalSpdx.length > 0 && (
                  <Tooltip
                    label={JSON.stringify(totalSpdx)
                      .slice(1, -1)
                      .replace(/"/g, '')}
                    placement={'top'}
                  >
                    <Tag
                      width={'150px'}
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                    >
                      <TagLabel mx={'auto'}>{`+${totalSpdx.length}`}</TagLabel>
                    </Tag>
                  </Tooltip>
                )}
              </Stack>
            )}
            {/* EXPRESSION */}
            {licensesExp && licensesExp !== '' && (
              <Tooltip label={licensesExp} placement={'top'}>
                <Tag
                  width={'150px'}
                  size={'md'}
                  variant='subtle'
                  colorScheme='green'
                >
                  <TagLabel mx={'auto'}>{licensesExp}</TagLabel>
                </Tag>
              </Tooltip>
            )}
            {/* CUSTOM */}
            {licensesCustom && (
              <Stack direction={'row'} spacing={2}>
                {licensesCustom.length > 0 && (
                  <Tooltip label={licensesCustom[0]} placement={'top'}>
                    <Tag
                      width={'150px'}
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                    >
                      <TagLabel mx={'auto'}>{licensesCustom[0]}</TagLabel>
                    </Tag>
                  </Tooltip>
                )}
                {totalCustom && (
                  <Tooltip
                    label={JSON.stringify(totalCustom)
                      .slice(1, -1)
                      .replace(/"/g, '')}
                    placement={'top'}
                  >
                    <Tag
                      width={'150px'}
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                    >
                      <TagLabel
                        mx={'auto'}
                      >{`+${totalCustom.length}`}</TagLabel>
                    </Tag>
                  </Tooltip>
                )}
              </Stack>
            )}
          </Flex>
        )
      },
      width: '13%',
      sortable: true,
      wrap: true
    },
    // UPDATED AT
    {
      id: 'COMPONENTS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row.updatedAt)}</Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '12%',
      wrap: true
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { status, primary, externalUrls } = row
        const website = externalUrls?.find((item) => item.name === 'website')
        const distribution = externalUrls?.find(
          (item) => item.name === 'distribution'
        )
        const issueTracker = externalUrls?.find(
          (item) => item.name === 'issue-tracker'
        )
        const vcs = externalUrls?.find((item) => item.name === 'vcs')
        const onCheck = (item) => (item ? primaryBlueText : primaryTextColor)
        return (
          <Stack direction={'row'} alignItems={'center'}>
            {/* WEBSITE */}
            <ExternalLink
              link={website}
              icon={<FaGlobe color={onCheck(website)} fontSize={16} />}
            />
            {/* DISTRIBUTION */}
            <ExternalLink
              link={vcs}
              icon={<FaSitemap color={onCheck(vcs)} fontSize={16} />}
            />
            {/* ADVISORIES */}
            <ExternalLink
              link={issueTracker}
              icon={<FaListCheck color={onCheck(issueTracker)} fontSize={16} />}
            />
            {/* SUPPORT */}
            <ExternalLink
              link={distribution}
              icon={<FaLightbulb color={onCheck(distribution)} fontSize={16} />}
            />
            {!customerView ? (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FaEllipsisV />}
                  variant='none'
                  color={secondaryTextColor}
                  data-testid='component-actions'
                />
                <Portal>
                  <MenuList fontSize={'sm'}>
                    <MenuItem
                      data-testid='edit_component'
                      onClick={() => onEditOpen(row)}
                      isDisabled={status === 'signed' || !updateComponent}
                    >
                      Edit Component
                    </MenuItem>
                    <MenuItem
                      hidden
                      onClick={() => onRelOpen(row)}
                      isDisabled={!updateComponent}
                    >
                      Edit Relationships
                    </MenuItem>
                    <MenuItem
                      data-testid='view_relation'
                      onClick={() => handleGraphView(row)}
                      isDisabled={
                        status === 'signed' ||
                        !updateComponent ||
                        totalComp?.length === 1
                      }
                    >
                      View Relationships
                    </MenuItem>
                    <MenuItem
                      data-testid='view_insights'
                      onClick={() => hanldeAnalysis(row)}
                      isDisabled={status === 'signed'}
                      hidden={isFreeTier}
                    >
                      Insights
                    </MenuItem>
                    <Divider />
                    {primary === false && (
                      <MenuItem
                        color={primaryErrorColor}
                        onClick={() => {
                          setActiveRow(row)
                          DELETE.onOpen()
                        }}
                        isDisabled={
                          status === 'signed' ||
                          !updateComponent ||
                          totalComp?.length === 1
                        }
                        data-testid='delete_component'
                      >
                        Delete
                      </MenuItem>
                    )}
                  </MenuList>
                </Portal>
              </Menu>
            ) : (
              <IconButton
                size='sm'
                icon={<ViewIcon />}
                onClick={() => {
                  setActiveRow(row)
                  COMPONENT.onOpen()
                }}
              />
            )}
          </Stack>
        )
      },
      wrap: true,
      right: 'true',
      omit: isArchived
    }
  ]

  const handleGraphView = (row) => {
    setActiveComp(row)
    GRAPH.onOpen()
  }
  const [deleteSupplier] = useMutation(deleteComSupplier)

  const handleSupRemove = async (item) => {
    await deleteSupplier({ variables: { id: item?.id } }).then(
      (res) => res.data
    )
  }

  // EXPAND SECTION
  const ExpandedComponent = ({ data }) => {
    const {
      scope,
      suppliers,
      purl,
      description,
      cpes,
      name,
      kind,
      internal,
      licenses,
      licensesExp,
      licensesCustom,
      supportLevel,
      endOfSupport,
      dependencyOf,
      dependsOn
    } = data
    const openSSF = openSsf?.find((item) => item?.name === purl)

    const textStyle = {
      color: primaryTextColor,
      mt: 1,
      fontSize: 14,
      workBreak: 'break-all'
    }

    return (
      <Box
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(3, 1fr)' py={2} gap={6}>
          <GridItem w='100%' colSpan={3}>
            <CustomText>Description :</CustomText>
            <Text sx={textStyle} width={'90%'}>
              {description !== null ? description : 'N/A'}
            </Text>
          </GridItem>
          <GridItem colSpan={3}>
            <CustomText>Depends On :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {dependsOn?.length > 0 ? (
                [...dependsOn]
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((comp, index) => (
                    <Tag
                      size='sm'
                      key={index}
                      variant='subtle'
                      colorScheme={'blue'}
                      sx={{ p: 1, workBreak: 'break-all' }}
                    >
                      <Text wordBreak={'break-all'}>
                        {comp.toComp.name}-{comp.toComp.version}
                      </Text>
                    </Tag>
                  ))
              ) : (
                <Text sx={textStyle}>N/A</Text>
              )}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>Dependency Of :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {dependencyOf?.length > 0 ? (
                dependencyOf?.map((comp, index) => (
                  <Tag
                    size='sm'
                    padding={1}
                    key={index}
                    variant='subtle'
                    colorScheme={'blue'}
                  >
                    <Text wordBreak={'break-all'}>
                      {comp.fromComp.name}-{comp.fromComp.version}
                    </Text>
                  </Tag>
                ))
              ) : (
                <Text sx={textStyle}>N/A</Text>
              )}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>Component :</CustomText>
            <Text sx={textStyle} width={'90%'}>
              {name || 'N/A'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Type :</CustomText>
            <Text sx={textStyle}>{kind || 'N/A'}</Text>
          </GridItem>
          <GridItem>
            <CustomText>Internal :</CustomText>
            <Text sx={textStyle}>{internal ? 'True' : 'False'}</Text>
          </GridItem>
          <GridItem>
            <CustomText>Supplier :</CustomText>
            <VStack spacing={4} mt={1} alignItems={'left'}>
              {!signedUrlParams && suppliers?.length > 0 ? (
                <>
                  {suppliers.map((item, index) => (
                    <SupplierTag
                      key={index}
                      item={item}
                      editable={false}
                      premission={isArchived}
                      onDelete={() => handleSupRemove(item)}
                    />
                  ))}
                </>
              ) : (
                <Text sx={textStyle}>N/A</Text>
              )}
            </VStack>
          </GridItem>
          <GridItem>
            <CustomText>PURL :</CustomText>
            <Text
              sx={textStyle}
              cursor={'pointer'}
              onClick={() => onCheckPurl(data)}
            >
              {purl !== null && purl !== '' ? decodeURI(purl) : 'N/A'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>CPES :</CustomText>
            <Flex
              flexDirection={'column'}
              sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}
            >
              {cpes?.length > 0 &&
                cpes.map((item, index) => (
                  <Text
                    key={index}
                    sx={textStyle}
                    cursor={'pointer'}
                    onClick={() => onCheckCpe(data)}
                  >
                    {item}
                  </Text>
                ))}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>Scope :</CustomText>
            <Text sx={textStyle} textTransform={'capitalize'}>
              {scope || 'N/A'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Licenses :</CustomText>
            <Flex alignItems={'center'} gap={2} flexWrap={'wrap'} my={2}>
              {/* SPDX */}
              {licenses?.length > 0 &&
                licenses.map((item, index) => (
                  <Tag
                    key={index}
                    size={'md'}
                    variant='subtle'
                    colorScheme='green'
                    sx={{ py: 1, w: 'fit-content' }}
                  >
                    <Text wordBreak={'break-all'}>{item}</Text>
                  </Tag>
                ))}
              {/* EXPRESSION */}
              {licensesExp && licensesExp !== '' && (
                <Tag
                  size={'md'}
                  variant='subtle'
                  colorScheme='green'
                  sx={{ py: 1, w: 'fit-content' }}
                >
                  <Text wordBreak={'break-all'}>{licensesExp}</Text>
                </Tag>
              )}
              {/* CUSTOM */}
              {licensesCustom?.length > 0 &&
                licensesCustom?.map((item, index) => (
                  <Tag
                    key={index}
                    size={'md'}
                    variant='subtle'
                    colorScheme='green'
                    sx={{ py: 1, w: 'fit-content' }}
                  >
                    <Text wordBreak={'break-all'}>{item}</Text>
                  </Tag>
                ))}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>OpenSSF Scorecard :</CustomText>
            <Tag mt={1.5} variant='subtle' colorScheme={'blue'}>
              {openSSF?.score || 'N/A'}
            </Tag>
          </GridItem>
          <GridItem>
            <CustomText>Support Level :</CustomText>
            <Text sx={textStyle}>{supportLevel || 'N/A'}</Text>
          </GridItem>
          <GridItem>
            <CustomText>End-of-Support Date :</CustomText>
            <Text sx={textStyle}>
              {endOfSupport ? getFullDateAndTime(endOfSupport) : 'N/A'}
            </Text>
          </GridItem>
        </Grid>
      </Box>
    )
  }

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setCompSearch('')
    prodCompDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    reset()
  }, [prodCompDispatch, reset])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setCompSearch(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && value !== '') {
        prodCompDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        reset()
      }
    },
    [prodCompDispatch, reset]
  )

  const debouncedResults = useMemo(() => {
    return debounce(onSearchInputChange, 1000)
  }, [onSearchInputChange])

  useEffect(() => {
    return () => {
      debouncedResults.cancel()
    }
  })

  const restricted = lifecycle === 'signed' || !updateComponent

  // HEADER SECTION
  const subHeader = useMemo(() => {
    return (
      <Flex
        sx={{ w: '100%', alignItems: 'center' }}
        justifyContent={'space-between'}
      >
        <Flex sx={{ w: '100%', gap: 4, alignItems: 'center' }}>
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='component'
            filterText={compSearch}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />
          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          <CompFilters reset={() => reset()} />
        </Flex>
        <Flex sx={{ w: '100%', gap: 2, justifyContent: 'flex-end' }}>
          {/* SHOW HEATMAP */}
          <Tooltip label='View Health Map'>
            <IconButton
              colorScheme='blue'
              onClick={MAP.onOpen}
              icon={<RiFundsBoxFill />}
              hidden={!shouldShowDemoFeatures}
            />
          </Tooltip>
          {/* CREATE COMPONENT */}
          <Tooltip label='Add Component'>
            <IconButton
              ref={compBtn}
              onClick={onCreateComponent}
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              name='add_component'
              isDisabled={restricted}
              hidden={signedUrlParams || isArchived}
              sx={{ fontSize: 'sm', fontWeight: 'normal' }}
            />
          </Tooltip>
          {/* EXPORT CSV */}
          <ExportCsv
            tableType='SBOM Components View'
            filters={{
              ...compData,
              orderBy: searchInput === '' ? { field, direction } : undefined,
              search: searchInput !== '' ? searchInput : undefined,
              includeParts: sbomData?.sbomParts?.length > 0
            }}
          />

          <RefreshBtn onClick={() => reset()} />
        </Flex>
      </Flex>
    )
  }, [
    compSearch,
    handleSearch,
    handleClear,
    onSearchInputChange,
    MAP.onOpen,
    shouldShowDemoFeatures,
    onCreateComponent,
    restricted,
    signedUrlParams,
    isArchived,
    compData,
    searchInput,
    field,
    direction,
    sbomData?.sbomParts?.length,
    reset
  ])

  const handleSort = async (column, sortDirection) => {
    prodCompDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  const handleRowClick = (row) => {
    prodCompDispatch({ type: 'SET_EXPAND', payload: row?.name })
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} height={'auto'}>
        <DataTable
          subHeader
          data={nodes}
          expandableRows
          persistTableHead
          responsive={true}
          columns={columns}
          expandOnRowClicked
          onSort={handleSort}
          defaultSortAsc={false}
          progressPending={loading}
          onRowClicked={handleRowClick}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
          expandableRowsComponent={ExpandedComponent}
          expandableRowExpanded={(row) => expandedRows?.includes(row?.name)}
        />
      </Flex>

      {/* PAGINATION */}
      <Pagination {...paginationProps} />

      {GRAPH.isOpen && (
        <GraphDrawer
          primaryComp={null}
          isOpen={GRAPH.isOpen}
          onClose={GRAPH.onClose}
          activeComp={activeComp}
        />
      )}

      {COMPONENT.isOpen && (
        <ComponentAddModal
          checkId={null}
          shortDesc={null}
          data={activeRow}
          isOpen={COMPONENT.isOpen}
          onClose={COMPONENT.onClose}
          primaryComp={primaryComponent}
        />
      )}

      {DELETE.isOpen && (
        <ComponentModal
          activeRow={activeRow}
          isOpen={DELETE.isOpen}
          onClose={DELETE.onClose}
        />
      )}

      {RELATION.isOpen && (
        <RelationshipDrawer
          activeRow={activeRow}
          isOpen={RELATION.isOpen}
          onClose={RELATION.onClose}
          comPathLoading={comPathLoading}
          compPath={comPath?.component?.pathToPrimary}
        />
      )}

      {PURL.isOpen && (
        <PurlCard
          value={activeRow?.purl}
          isOpen={PURL.isOpen}
          onClose={PURL.onClose}
        />
      )}

      {CPE.isOpen && (
        <CpeCard
          value={activeRow?.cpes[0]}
          isOpen={CPE.isOpen}
          onClose={CPE.onClose}
        />
      )}

      {MAP.isOpen && <HealthMap isOpen={MAP.isOpen} onClose={MAP.onClose} />}

      {EDIT.isOpen && (
        <CompDrawer
          data={activeRow}
          isOpen={EDIT.isOpen}
          onClose={EDIT.onClose}
          primaryComp={primaryComponent}
        />
      )}

      {INSIGHTS.isOpen && (
        <CompInsights
          isOpen={INSIGHTS.isOpen}
          onClose={INSIGHTS.onClose}
          id={activeRow?.id}
        />
      )}
    </>
  )
}

export default Components

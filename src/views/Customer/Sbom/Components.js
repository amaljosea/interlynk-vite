import styled from '@emotion/styled'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { GetIcon, customStyles, getFullDateAndTime, timeSince } from 'utils'
import { isValidPurl, truncatedValue } from 'utils'
import { openSsf } from 'variables/general'
import CompDrawer from 'views/Dashboard/Products/components/CompDrawer'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { ViewIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  VStack,
  useColorMode,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import CpeCard from 'components/Misc/CpeCard'
import ExternalLink from 'components/Misc/ExternalLink'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'
import SupplierTag from 'components/SupplierTag'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { ShareComponentData } from 'graphQL/Queries'

import { BsFillPatchQuestionFill } from 'react-icons/bs'
import { FaGlobe, FaHouseUser, FaLightbulb, FaSitemap } from 'react-icons/fa'

import CompFilters from './CompFilters'

const CustomText = styled(Text)`
  font-size: 13px;
  font-weight: bold;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.6px;
`

const Components = ({ sbomData }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const location = useLocation()
  const { colorMode } = useColorMode()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const {
    headingTextColor,
    primaryTextColor,
    inverseSecondaryBgColor,
    primaryBlueText
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'inverseSecondaryBgColor',
    'primaryBlueText'
  ])

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
    direct
  } = prodCompState
  const { prodCompDispatch } = dispatch

  const getUndefinedIfEmptyOrAll = (value, allValue = 'all') =>
    value.includes(allValue) || value.length === 0 ? undefined : value

  const compData = useMemo(() => {
    return {
      ecosystem: getUndefinedIfEmptyOrAll(ecosystems),
      kind: getUndefinedIfEmptyOrAll(kinds),
      licenses: getUndefinedIfEmptyOrAll(licenses),
      supplierName: getUndefinedIfEmptyOrAll(suppliers),
      primary: scope === 'primary' ? true : undefined,
      internal: scope === 'internal' ? true : undefined,
      direct: direct === true ? true : undefined
    }
  }, [direct, ecosystems, kinds, licenses, scope, suppliers])

  const {
    nodes: components,
    error,
    loading,
    reset,
    paginationProps
  } = usePaginatedQuery(ShareComponentData, {
    skip: activeTab !== 'components',
    selector: 'shareLynkQuery.sbom.components',
    variables: {
      sbomId: sbomId,
      search: searchInput !== '' ? searchInput : undefined,
      ...compData,
      field: field,
      direction: direction
    }
  })

  const { primaryComponent } = sbomData || ''

  const [activeRow, setActiveRow] = useState(null)
  const [compSearch, setCompSearch] = useState('')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const PURL = useDisclosure()
  const CPE = useDisclosure()

  const onCheckPurl = (data) => {
    setActiveRow(data)
    PURL.onOpen()
  }

  const onCheckCpe = (data) => {
    setActiveRow(data)
    CPE.onOpen()
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
              <Text color={primaryTextColor} data-tag='allowRowEvents'>
                {name}
              </Text>
              {isPart && (
                <Text
                  fontSize={'xs'}
                  w={'fit-content'}
                  fontWeight={'medium'}
                  color={primaryTextColor}
                >
                  {projectGroup?.name && truncatedValue(projectGroup?.name, 10)}
                  {projectVersion && `: ${truncatedValue(projectVersion, 10)}`}
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
      width: '30%',
      wrap: true,
      sortable: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => <Text color={primaryTextColor}>{row?.version}</Text>,
      wrap: true,
      width: '12%',
      sortable: true
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
              <Button
                size='xs'
                color={primaryTextColor}
                onClick={() => onCheckCpe(row)}
              >
                CPE
              </Button>
            )}
            {purl && (
              <Button
                size='xs'
                color={primaryTextColor}
                onClick={() => onCheckPurl(row)}
              >
                PURL
              </Button>
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
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        const { externalUrls } = row
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
              icon={<FaHouseUser color={onCheck(issueTracker)} fontSize={16} />}
            />
            {/* SUPPORT */}
            <ExternalLink
              link={distribution}
              icon={<FaLightbulb color={onCheck(distribution)} fontSize={16} />}
            />
            <IconButton
              size='sm'
              sx={{ ml: 2, color: primaryTextColor }}
              icon={<ViewIcon />}
              onClick={() => {
                setActiveRow(row)
                onOpen()
              }}
            />
          </Stack>
        )
      },
      wrap: true,
      right: 'true'
    }
  ]

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
      dependencyOf,
      dependsOn,
      supportLevel,
      endOfSupport
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
              {suppliers?.length > 0 ? (
                <>
                  {suppliers.map((item, index) => (
                    <SupplierTag key={index} item={item} editable={false} />
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
                    width={'fit-content'}
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
                  width={'fit-content'}
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
                    width={'fit-content'}
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

  // HEADER SECTION
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'center'}
        >
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
        </Stack>
        <RefreshBtn onClick={() => reset()} />
      </Flex>
    )
  }, [compSearch, handleSearch, handleClear, onSearchInputChange, reset])

  const handleSort = async (column, sortDirection) => {
    prodCompDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  if (error) {
    return (
      <Card>
        <Text color={primaryTextColor}>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} height={'auto'}>
        <DataTable
          columns={columns}
          data={components}
          onSort={handleSort}
          customStyles={customStyles(headingTextColor)}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          expandableRows
          expandOnRowClicked
          persistTableHead
          expandableRowsComponent={ExpandedComponent}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      <Pagination {...paginationProps} />

      {isOpen && (
        <CompDrawer
          data={activeRow}
          isOpen={isOpen}
          onClose={onClose}
          primaryComp={primaryComponent}
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
    </>
  )
}

export default Components

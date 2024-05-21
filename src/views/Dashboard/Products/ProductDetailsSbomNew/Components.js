import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { GetIcon, customStyles, getFullDateAndTime, timeSince } from 'utils'
import { openSsf } from 'variables/general'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import SupplierModal from 'views/Sbom/components/SupplierModal'

import { AddIcon, RepeatIcon, ViewIcon } from '@chakra-ui/icons'
import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Tooltip,
  VStack,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import GraphDrawer from 'components/Drawer/GraphDrawer'
import LinksDrawer from 'components/Drawer/LinksDrawer'
import RelationshipDrawer from 'components/Drawer/RelationshipDrawer'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { deleteComSupplier } from 'graphQL/Mutation'
import {
  GetCompFilterData,
  GetComponentData,
  GetComponentPath,
  ShareCompFilters
} from 'graphQL/Queries'

import { BsFillPatchQuestionFill } from 'react-icons/bs'
import {
  FaEllipsisV,
  FaGlobe,
  FaHouseUser,
  FaLightbulb,
  FaSitemap
} from 'react-icons/fa'

import CompFilters from './CompFilters'

const Components = ({ sbomData, sbomRefetch }) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')
  const customerView = location.pathname.startsWith('/customer')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { userPermissions, prodCompState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    ecosystems,
    kinds,
    licenses,
    suppliers,
    scope,
    filters,
    direct,
    totalComp
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

  // GET COMPONENT DATA
  const { nodes, refetch, error, paginationProps, reset, loading } =
    usePaginatatedQuery(GetComponentData, {
      selector: 'sbom.components',
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: searchInput !== '' ? searchInput : undefined,
        ...compData,
        field: field,
        direction: direction
      }
    })

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [loading])

  const { lifecycle, primaryComponent } = sbomData || ''

  // GET COMPONENT FILTER HEADS
  const { refetch: getCompFilters } = useQuery(
    signedUrlParams ? ShareCompFilters : GetCompFilterData,
    {
      fetchPolicy: activeTab === 'components' ? false : true,
      variables: {
        projectId: signedUrlParams ? undefined : productId,
        sbomId: sbomId
      },
      onCompleted: (data) => {
        prodCompDispatch({
          type: 'ADD_FILTER_HEADS',
          payload: signedUrlParams
            ? data?.shareLynkQuery?.sbom?.filters
            : data?.sbom?.filters
        })
      }
    }
  )

  const [activeComp, setActiveComp] = useState(null)

  const sboms = userPermissions?.find((item) => item.key === 'view_sbom')
  const updateComponent = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'update_sbom_components' && permission.value === true
  )
  const updateSboms = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'update_sbom' && permission.value === true
  )

  const fetchCompData = () => {
    reset()
    refetch()
  }

  const compBtn = useRef(null)
  const linkRef = useRef(null)
  const [activeRow, setActiveRow] = useState(null)
  const [compSearch, setCompSearch] = useState(searchInput)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [getComPath, { data: comPath }] = useLazyQuery(GetComponentPath)

  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()
  const {
    isOpen: isGraphOpen,
    onOpen: onGraphOpen,
    onClose: onGraphClose
  } = useDisclosure()
  const {
    isOpen: isSupOpen,
    onOpen: onSupOpen,
    onClose: onSupClose
  } = useDisclosure()
  const {
    isOpen: isLinkOpen,
    onOpen: onLinkOpen,
    onClose: onLinkClose
  } = useDisclosure()
  const {
    isOpen: isRelationOpen,
    onOpen: onRelationOpen,
    onClose: onRelationClose
  } = useDisclosure()
  const {
    isOpen: isCompOpen,
    onOpen: onCompOpen,
    onClose: onCompClose,
    onToggle: onCompToggle
  } = useDisclosure()
  const {
    isOpen: isPurlOpen,
    onOpen: onPurlOpen,
    onClose: onPurlClose
  } = useDisclosure()
  const {
    isOpen: isCpeOpen,
    onOpen: onCpeOpen,
    onClose: onCpeClose
  } = useDisclosure()

  const onLicenseOpen = (row) => {
    setActiveRow(row)
    prodCompDispatch({ type: 'SET_LICENSES', payload: row })
    onOpen()
  }

  const onCreateComponent = useCallback(() => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    onCompOpen()
  }, [onCompOpen, prodCompDispatch])

  const handleOpen = (row) => {
    setActiveRow(row)
    onRelationOpen()
    getComPath({ variables: { compId: row.id, sbomId: sbomId } })
  }

  // ADD KEYBOARD SHORTCUT FOR TOGGLE COMPONENT DRAWER
  const handleCompDown = useCallback(
    (event) => {
      if (event.altKey && event.key === '1') {
        onCompToggle()
      }
    },
    [onCompToggle]
  )

  // KEYBOARD EVENT LISTNER FOR COMPONENT DRAWER
  useEffect(() => {
    window.addEventListener('keydown', handleCompDown)
    return () => {
      window.removeEventListener('keydown', handleCompDown)
    }
  }, [handleCompDown])

  // COLUMNS
  const columns = [
    // COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'NAME',
      selector: (row) => {
        const { purl, name, primary, internal, externalUrls } = row
        const website = externalUrls?.find((item) => item.name === 'website')
        const distribution = externalUrls?.find(
          (item) => item.name === 'distribution'
        )
        const issueTracker = externalUrls?.find(
          (item) => item.name === 'issue-tracker'
        )
        const vcs = externalUrls?.find((item) => item.name === 'vcs')
        return (
          <Grid templateColumns='repeat(7, 1fr)' gap={2} my={3}>
            <GridItem colSpan={1} width={'50px'}>
              {purl !== null && purl !== '' ? (
                <IconButton
                  isRound={true}
                  variant='solid'
                  colorScheme='gray'
                  icon={GetIcon(purl.split('/')[0])}
                />
              ) : (
                <IconButton
                  isRound={true}
                  variant='solid'
                  colorScheme='gray'
                  icon={
                    <BsFillPatchQuestionFill color='#4299E1' fontSize={24} />
                  }
                />
              )}
            </GridItem>
            <GridItem
              colSpan={6}
              display={'flex'}
              flexWrap={'wrap'}
              flexDirection={'column'}
              gap={2}
            >
              {/* COMPONENT NAME */}
              <Tooltip placement='top' label={name}>
                <Text data-tag='allowRowEvents'>{name}</Text>
              </Tooltip>
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
            </GridItem>
          </Grid>
        )
      },
      wrap: true,
      width: '18%',
      sortable: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => <Text textAlign='right'>{row?.version}</Text>,
      width: '12%',
      wrap: true,
      sortable: true,
      right: 'true'
    },
    // PURL
    {
      id: 'COMPONENTS_PURL',
      name: 'PURL',
      selector: (row) => {
        const { purl } = row
        return (
          <>
            {purl !== null && purl !== '' ? (
              <Text
                my={3}
                onClick={() => {
                  setActiveRow(row)
                  onPurlOpen()
                }}
              >
                {purl}
              </Text>
            ) : (
              ''
            )}
          </>
        )
      },
      sortable: true,
      width: '20%',
      wrap: true,
      grow: 2
    },
    // LICENSES
    {
      id: 'COMPONENTS_LICENSES_EXP',
      name: 'LICENSES',
      width: '14%',
      selector: (row) => {
        const { licenses, licensesExp, licensesCustom } = row
        const totalSpdx = licenses?.length > 1 && licenses.slice(1)
        const totalCustom =
          licensesCustom?.length > 1 && licensesCustom.slice(1)
        return (
          <Flex
            alignItems={'flex-end'}
            justifyContent={'flex-end'}
            gap={2}
            flexWrap={'wrap'}
            my={2}
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
      sortable: true,
      wrap: true
    },
    // UPDATED AT
    {
      id: 'COMPONENTS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          {timeSince(row.updatedAt)}
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      right: 'true',
      wrap: true
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { suppliers, status, primary } = row
        return (
          <>
            {!customerView ? (
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label='Options'
                  icon={<FaEllipsisV />}
                  variant='none'
                  color='gray.400'
                />
                <Portal>
                  <MenuList size='sm'>
                    <MenuItem
                      onClick={() => onLicenseOpen(row)}
                      isDisabled={status === 'signed' || !updateComponent}
                    >
                      Edit Component
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleOpen(row)}
                      isDisabled={!updateComponent}
                    >
                      Edit Relationships
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setActiveRow(row)
                        onSupOpen()
                      }}
                      isDisabled={status === 'signed' || !updateComponent}
                    >
                      {suppliers.length > 0 ? 'Edit' : 'Add'} Supplier
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setActiveRow(row)
                        onLinkOpen()
                      }}
                      isDisabled={status === 'signed' || !updateComponent}
                    >
                      Edit Links
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleGraphView(row)}
                      isDisabled={
                        status === 'signed' ||
                        !updateComponent ||
                        totalComp?.length === 1
                      }
                    >
                      View Relationships
                    </MenuItem>
                    <Divider />
                    {primary === false && (
                      <MenuItem
                        color='red'
                        onClick={() => {
                          setActiveRow(row)
                          onDelOpen()
                        }}
                        isDisabled={
                          status === 'signed' ||
                          !updateComponent ||
                          totalComp?.length === 1
                        }
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
                  onOpen()
                }}
              />
            )}
          </>
        )
      },
      width: '10%',
      wrap: true,
      right: 'true'
    }
  ]

  const handleGraphView = (row) => {
    setActiveComp(row)
    onGraphOpen()
  }
  const [deleteSupplier] = useMutation(deleteComSupplier)

  const handleSupRemove = async (id) => {
    try {
      await deleteSupplier({ variables: { id: id } }).then((res) => {
        if (res.data) {
          refetch()
        }
      })
    } catch (error) {
      console.log(`Mutation error`, error)
    }
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
      dependencyOf,
      dependsOn
    } = data
    const openSSF = openSsf?.find((item) => item?.name === purl)
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
        <Grid templateColumns='repeat(3, 1fr)' gap={6}>
          <GridItem w='100%' colSpan={3}>
            <CustomText>Description :</CustomText>
            <Text width={'90%'} mt={1} fontSize={14} wordBreak={'break-all'}>
              {description !== null ? description : ''}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Component :</CustomText>
            <Text width={'90%'} mt={1} fontSize={14} wordBreak={'break-all'}>
              {name}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Type :</CustomText>
            <Text mt={1} fontSize={14} textTransform={'capitalize'}>
              {kind}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Internal :</CustomText>
            <Text mt={1} fontSize={14} wordBreak={'break-all'}>
              {internal ? 'True' : 'False'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Supplier :</CustomText>
            <VStack spacing={4} mt={1} alignItems={'left'}>
              {suppliers &&
                suppliers.map((item, index) => (
                  <Tag
                    size={'md'}
                    key={index}
                    variant='subtle'
                    colorScheme='orange'
                    width={'fit-content'}
                  >
                    <Text wordBreak={'break-all'}>
                      {item?.contactName}
                      {item?.contactEmail && ` (${item?.contactEmail})`}
                      {item?.url ? (
                        <Link
                          href={
                            item?.url?.startsWith(`https://`) === true
                              ? item?.url
                              : `https://${item?.url}`
                          }
                          isExternal
                        >
                          {' '}
                          {item.name}
                        </Link>
                      ) : (
                        ` ${item.name}`
                      )}
                    </Text>
                    <TagCloseButton
                      hidden={signedUrlParams}
                      onClick={() => handleSupRemove(item.id)}
                    />
                  </Tag>
                ))}
            </VStack>
          </GridItem>
          <GridItem>
            <CustomText>PURL :</CustomText>
            <Text
              wordBreak={'break-all'}
              mt={1}
              fontSize={14}
              cursor={'pointer'}
              onClick={() => {
                setActiveRow(data)
                onPurlOpen()
              }}
            >
              {purl !== null && purl !== '' ? purl : ''}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>CPES :</CustomText>
            <Flex
              mt={1}
              flexDirection={'column'}
              alignItems={'flex-start'}
              gap={1}
              flexWrap={'wrap'}
            >
              {cpes?.length > 0 &&
                cpes.map((item, index) => (
                  <Text
                    key={index}
                    fontSize={14}
                    wordBreak={'break-all'}
                    cursor={'pointer'}
                    onClick={() => {
                      setActiveRow(data)
                      onCpeOpen()
                    }}
                  >
                    {item}
                  </Text>
                ))}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>Depends On :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {dependsOn?.length > 0 &&
                [...dependsOn]
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((comp, index) => (
                    <Tooltip
                      key={index}
                      label={comp.toComp.name}
                      placement='top'
                    >
                      <Tag
                        size='sm'
                        padding={1}
                        variant='subtle'
                        colorScheme={'blue'}
                        wordBreak={'break-all'}
                      >
                        <Text wordBreak={'break-all'}>
                          {comp.toComp.name}-{comp.toComp.version}
                        </Text>
                      </Tag>
                    </Tooltip>
                  ))}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>Dependency Of :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {dependencyOf?.length > 0 &&
                dependencyOf?.map((comp, index) => (
                  <Tooltip
                    key={index}
                    label={comp.fromComp.name}
                    placement='top'
                  >
                    <Tag
                      size='sm'
                      padding={1}
                      variant='subtle'
                      colorScheme={'blue'}
                    >
                      <Text wordBreak={'break-all'}>
                        {comp.fromComp.name}-{comp.fromComp.version}
                      </Text>
                    </Tag>
                  </Tooltip>
                ))}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>Scope :</CustomText>
            <Text mt={1} fontSize={14} textTransform={'capitalize'}>
              {scope}
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
              {openSSF?.score || '-'}
            </Tag>
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
          {filters && <CompFilters reset={() => reset()} />}
        </Stack>
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={2}
          justifyContent={'flex-end'}
        >
          {/* CREATE COMPONENT */}
          <Tooltip label='Add Component'>
            <IconButton
              ref={compBtn}
              onClick={onCreateComponent}
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              fontWeight='normal'
              fontSize={'sm'}
              hidden={signedUrlParams}
              isDisabled={
                lifecycle === 'signed' || !updateComponent || !updateSboms
              }
            />
          </Tooltip>
          <Tooltip label='Refresh'>
            <IconButton
              onClick={() => refetch()}
              colorScheme='blue'
              icon={<RepeatIcon />}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    compSearch,
    handleSearch,
    handleClear,
    onSearchInputChange,
    filters,
    onCreateComponent,
    signedUrlParams,
    lifecycle,
    updateComponent,
    updateSboms,
    reset,
    refetch
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
          columns={columns}
          data={nodes}
          onSort={handleSort}
          customStyles={customStyles}
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

      {isGraphOpen && activeComp && (
        <GraphDrawer
          isOpen={isGraphOpen}
          onClose={onGraphClose}
          primaryComp={null}
          activeComp={activeComp}
        />
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {isOpen && (
            <ComponentDrawer
              data={activeRow}
              isOpen={isOpen}
              onClose={onClose}
              sbomRefetch={sbomRefetch}
              fetchCompData={fetchCompData}
              filterRefetch={getCompFilters}
              shortDesc={null}
              checkId={null}
              primaryComp={primaryComponent}
            />
          )}

          {isDelOpen && (
            <ComponentModal
              isOpen={isDelOpen}
              onClose={onDelClose}
              id={activeRow.id}
              sbomRefetch={sbomRefetch}
              fetchCompData={fetchCompData}
            />
          )}

          {isSupOpen && (
            <SupplierModal
              id={activeRow.id}
              refetch={fetchCompData}
              filterRefetch={getCompFilters}
              isOpen={isSupOpen}
              onClose={onSupClose}
              data={activeRow}
              shortDesc={null}
              checkId={null}
            />
          )}

          {isLinkOpen && (
            <LinksDrawer
              component={activeRow}
              btnRef={linkRef}
              isOpen={isLinkOpen}
              onClose={onLinkClose}
              fetchCompData={fetchCompData}
              productId={productId}
              sbomId={sbomId}
            />
          )}

          {isRelationOpen && comPath && (
            <RelationshipDrawer
              isOpen={isRelationOpen}
              onClose={onRelationClose}
              data={activeRow}
              compPath={comPath.component.pathToPrimary}
              fetchCompData={fetchCompData}
            />
          )}
        </>
      )}

      {/* COMPONENT DRAWER */}
      {isCompOpen && (
        <ComponentDrawer
          isOpen={isCompOpen}
          onClose={onCompClose}
          fetchCompData={fetchCompData}
          filterRefetch={getCompFilters}
          sbomRefetch={sbomRefetch}
          primaryComp={primaryComponent}
          shortDesc={null}
          checkId={null}
          data={null}
        />
      )}

      {isPurlOpen && (
        <PurlCard
          value={activeRow?.purl}
          isOpen={isPurlOpen}
          onClose={onPurlClose}
        />
      )}

      {isCpeOpen && (
        <CpeCard
          value={activeRow?.cpes[0]}
          isOpen={isCpeOpen}
          onClose={onCpeClose}
        />
      )}
    </>
  )
}

export default Components

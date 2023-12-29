// Chakra imports
import { AddIcon, ViewIcon } from '@chakra-ui/icons'
import {
  Flex,
  Text,
  Stack,
  Box,
  IconButton,
  Tooltip,
  MenuButton,
  Menu,
  Portal,
  MenuList,
  MenuItem,
  useDisclosure,
  Tag,
  TagLabel,
  Grid,
  GridItem,
  TagCloseButton,
  Link,
  Button,
  Divider,
  VStack
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { BsFillPatchQuestionFill } from 'react-icons/bs'
import {
  FaEllipsisV,
  FaGlobe,
  FaHouseUser,
  FaLightbulb,
  FaSitemap
} from 'react-icons/fa'
import { timeSince, GetIcon, getFullDateAndTime, customStyles } from 'utils'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import SupplierModal from 'views/Sbom/components/SupplierModal'
import LinksDrawer from 'components/Drawer/LinksDrawer'
import styled from '@emotion/styled'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GetComponentPath, GetCompDependency } from 'graphQL/Queries'
import { deleteComSupplier } from 'graphQL/Mutation'
import CompFilterMenu from 'views/Sbom/components/CompFilterMenu'
import CustomLoader from 'components/CustomLoader'
import RelationshipDrawer from 'components/Drawer/RelationshipDrawer'
import RowLimit from 'views/Sbom/components/RowLimit'
import { useGlobalState } from 'hooks/useGlobalState'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { GetCompFilterData } from 'graphQL/Queries'

const ComponentTable = ({ lifecycle, data, refetch, primaryComp }) => {
  // GET COMPONENT FILTER HEADS
  const [getCompFilters] = useLazyQuery(GetCompFilterData)

  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const customerView = location.pathname.startsWith('/customer')
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const currentProduct = JSON.parse(localStorage.getItem(`product`))
  const x = window.matchMedia('(min-width: 2500px)')
  const y = window.matchMedia('(max-width: 1440px)')

  const { totalRows, setTotalRows, setActiveSbomTab, prodCompState, dispatch } =
    useGlobalState()
  const {
    field,
    direction,
    pageIndex,
    searchInput,
    ecosystems,
    kinds,
    licenses,
    suppliers,
    scope,
    filters,
    totalComp
  } = prodCompState
  const { prodCompDispatch } = dispatch

  const fetchCompData = async () => {
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      search: searchInput !== '' ? searchInput : undefined,
      ecosystem:
        ecosystems.includes('all') || ecosystems.length === 0
          ? undefined
          : ecosystems,
      kind: kinds.includes('all') || kinds.length === 0 ? undefined : kinds,
      licenses:
        licenses.includes('all') || licenses.length === 0
          ? undefined
          : licenses,
      supplierName:
        suppliers.includes('all') || suppliers.length === 0
          ? undefined
          : suppliers,
      primary: scope === 'primary' ? true : undefined,
      internal: scope === 'internal' ? true : undefined,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    })
  }

  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState('')

  const compBtn = useRef(null)
  const linkRef = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [getComPath, { data: comPath }] = useLazyQuery(GetComponentPath)
  const [getDependency, { data: compDependency }] = useLazyQuery(
    GetCompDependency,
    {
      fetchPolicy: 'network-only'
    }
  )

  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
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

  const onLicenseOpen = (row) => {
    setActiveRow(row)
    console.log('row', row)
    prodCompDispatch({ type: 'SET_LICENSES', payload: row })
    onOpen()
  }

  const onCreateComponent = () => {
    prodCompDispatch({ type: 'CLEAR_LICENSES' })
    onCompOpen()
  }

  const handleOpen = (row) => {
    setActiveRow(row)
    getComPath({
      variables: {
        compId: row.id,
        sbomId: sbomId
      }
    }).then((res) => {
      if (res.data) {
        onRelationOpen()
      }
    })
  }

  // ADD KEYBOARD SHORTCUT FOR TOGGLE COMPONENT DRAWER
  const handleCompDown = (event) => {
    if (event.altKey && event.key === '1') {
      onCompToggle()
    }
  }

  // KEYBOARD EVENT LISTNER FOR COMPONENT DRAWER
  useEffect(() => {
    window.addEventListener('keydown', handleCompDown)

    return () => {
      window.removeEventListener('keydown', handleCompDown)
    }
  }, [])

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
          <Grid templateColumns='repeat(7, 1fr)' gap={2} width={'80%'} my={2}>
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
            </GridItem>
          </Grid>
        )
      },
      wrap: true,
      width: '24%',
      sortable: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => <p style={{ textWrap: 'pretty' }}>{row.version}</p>,
      width: '16%',
      sortable: true
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
              <Tooltip placement='top' label={purl}>
                <p style={{ textWrap: 'pretty' }}>{purl}</p>
              </Tooltip>
            ) : (
              ''
            )}
          </>
        )
      },
      sortable: true,
      width: x.matches ? '30%' : '20%',
      grow: 2
    },
    // LICENSES
    {
      id: 'COMPONENTS_LICENSES',
      name: 'LICENSES',
      width: '16%',
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
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{licenses[0]}</TagLabel>
                    </Tag>
                  </Tooltip>
                )}
                {totalSpdx && (
                  <Tooltip
                    label={JSON.stringify(totalSpdx)
                      .slice(1, -1)
                      .replace(/"/g, '')}
                    placement={'top'}
                  >
                    <Tag
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{`+${totalSpdx.length}`}</TagLabel>
                    </Tag>
                  </Tooltip>
                )}
              </Stack>
            )}

            {/* EXPRESSION */}
            {licensesExp && licensesExp !== '' && (
              <Tooltip label={licensesExp} placement={'top'}>
                <Tag
                  size={'md'}
                  variant='subtle'
                  colorScheme='green'
                  width={'fit-content'}
                >
                  <TagLabel>{licensesExp}</TagLabel>
                </Tag>
              </Tooltip>
            )}

            {/* CUSTOM */}
            {licensesCustom && (
              <Stack direction={'row'} spacing={2}>
                {licensesCustom.length > 0 && (
                  <Tooltip label={licensesCustom[0]} placement={'top'}>
                    <Tag
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{licensesCustom[0]}</TagLabel>
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
                      size={'md'}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{`+${totalCustom.length}`}</TagLabel>
                    </Tag>
                  </Tooltip>
                )}
              </Stack>
            )}
          </Flex>
        )
      },
      right: 'true',
      sortable: true
    },
    // UPDATED AT
    {
      id: 'COMPONENTS_UPDATED_AT',
      name: 'UPDATED AT',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          {timeSince(row.updatedAt)}
        </Tooltip>
      ),
      sortable: true,
      width: '12%',
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      right: 'true'
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { suppliers, status, primary, id } = row

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
                      isDisabled={status === 'signed'}
                    >
                      Edit Component
                    </MenuItem>
                    <MenuItem onClick={() => handleOpen(row)}>
                      Edit Relationships
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setActiveRow(row)
                        onSupOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      {suppliers.length > 0 ? 'Edit' : 'Add'} Supplier
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setActiveRow(row)
                        onLinkOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      Edit Links
                    </MenuItem>
                    <Divider />
                    {primary === false && (
                      <MenuItem
                        color='red'
                        onClick={() => {
                          setActiveRow(row)
                          onDelOpen()
                        }}
                        isDisabled={status === 'signed'}
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
      right: 'true'
    }
  ]

  const [deleteSupplier] = useMutation(deleteComSupplier)

  const handleRowClicked = (state, data) => {
    const { id } = data
    if (state === true) {
      getDependency({
        variables: {
          compId: id,
          sbomId: sbomId
        }
      })
    }
  }

  const handleSupRemove = async (id) => {
    try {
      await deleteSupplier({
        variables: {
          id: id
        }
      }).then((res) => {
        if (res.data) {
          refetch({
            projectId: productId,
            sbomId: sbomId,
            first: totalRows,
            field: field,
            direction: direction
          })
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
      licensesCustom
    } = data

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
        <Grid
          templateColumns='repeat(3, 1fr)'
          gap={6}
          width={'80%'}
          margin={'0 auto'}
        >
          <GridItem w='100%' colSpan={3}>
            <CustomText>Description :</CustomText>
            <Text mt={1} fontSize={14}>
              {description !== null ? description : ''}
            </Text>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>Component :</CustomText>
            <Text mt={1} fontSize={14}>
              {name}
            </Text>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>Type :</CustomText>
            <Text mt={1} fontSize={14} textTransform={'capitalize'}>
              {kind}
            </Text>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>Internal :</CustomText>
            <Text mt={1} fontSize={14}>
              {internal ? 'True' : 'False'}
            </Text>
          </GridItem>
          <GridItem w='100%'>
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
                    <TagLabel>
                      {item.contactName}
                      {item.contactEmail && ` (${item.contactEmail})`}
                      {item.url ? (
                        <Link href={item.url} isExternal>
                          {' '}
                          {item.name}
                        </Link>
                      ) : (
                        ` ${item.name}`
                      )}
                    </TagLabel>
                    <TagCloseButton onClick={() => handleSupRemove(item.id)} />
                  </Tag>
                ))}
            </VStack>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>PURL :</CustomText>
            <Text mt={1} fontSize={14}>
              {purl !== null && purl !== '' ? purl : ''}
            </Text>
          </GridItem>
          <GridItem w='100%'>
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
                  <Text key={index} fontSize={14}>
                    {item}
                  </Text>
                ))}
            </Flex>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>Depends On :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {compDependency &&
                compDependency.component.dependsOn.length > 0 &&
                [...compDependency.component.dependsOn]
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((comp, index) => (
                    <Tooltip
                      key={index}
                      label={comp.toComp.name}
                      placement='top'
                    >
                      <Tag
                        size={'sm'}
                        variant='subtle'
                        colorScheme={'blue'}
                        width={'fit-content'}
                      >
                        <TagLabel>
                          {comp.toComp.name}-{comp.toComp.version}
                        </TagLabel>
                      </Tag>
                    </Tooltip>
                  ))}
            </Flex>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>Dependency Of :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {compDependency &&
                compDependency.component.dependencyOf.length > 0 &&
                compDependency.component.dependencyOf.map((comp, index) => (
                  <Tooltip
                    key={index}
                    label={comp.fromComp.name}
                    placement='top'
                  >
                    <Tag
                      size={'sm'}
                      variant='subtle'
                      colorScheme={'blue'}
                      width={'fit-content'}
                    >
                      <TagLabel>
                        {comp.fromComp.name}-{comp.fromComp.version}
                      </TagLabel>
                    </Tag>
                  </Tooltip>
                ))}
            </Flex>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>Scope :</CustomText>
            <Text mt={1} fontSize={14} textTransform={'capitalize'}>
              {scope}
            </Text>
          </GridItem>
          <GridItem w='100%'>
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
                    <TagLabel>{item}</TagLabel>
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
                  <TagLabel>{licensesExp}</TagLabel>
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
                    <TagLabel>{item}</TagLabel>
                  </Tag>
                ))}
            </Flex>
          </GridItem>
        </Grid>
      </Box>
    )
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    prodCompDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: e.target.value })
  }

  const compData = {
    projectId: productId,
    sbomId: sbomId,
    search: searchInput !== '' ? searchInput : undefined,
    ecosystem:
      ecosystems.includes('all') || ecosystems.length === 0
        ? undefined
        : ecosystems,
    kind: kinds.includes('all') || kinds.length === 0 ? undefined : kinds,
    licenses:
      licenses.includes('all') || licenses.length === 0 ? undefined : licenses,
    supplierName:
      suppliers.includes('all') || suppliers.length === 0
        ? undefined
        : suppliers,
    primary: scope === 'primary' ? true : undefined,
    internal: scope === 'internal' ? true : undefined,
    field: field,
    direction: direction
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    if (event.key === 'Enter' && searchInput !== '') {
      await refetch({
        ...compData,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined
      }).then(
        (res) => res.data && prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
      )
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      ...compData,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined
    }).then(
      (res) => res.data && prodCompDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      before: undefined,
      field: customerView ? signedCompField : field,
      direction: customerView ? signedCompDirection : direction
    }).then(
      (res) => res.data && prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
    )
  }

  // HEADER SECTION
  const subHeaderComponentMemo = useMemo(() => {
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
            filterText={searchInput}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filters && (
            <CompFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
            />
          )}
        </Stack>

        {/* CREATE COMPONENT */}
        {!customerView && (
          <Tooltip label='Add Component'>
            <IconButton
              ref={compBtn}
              onClick={onCreateComponent}
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              fontWeight='normal'
              fontSize={'sm'}
              isDisabled={lifecycle === 'signed'}
            />
          </Tooltip>
        )}
      </Flex>
    )
  }, [searchInput, onSearchInputChange, handleClear, handleSearch, filters])

  const handleRefetch = (after, before) => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: after ? totalRows : undefined,
      after: after ? after : undefined,
      last: before ? totalRows : undefined,
      before: before ? before : undefined,
      search: searchInput !== '' ? searchInput : undefined,
      ecosystem:
        ecosystems.includes('all') || ecosystems.length === 0
          ? undefined
          : ecosystems,
      kind: kinds.includes('all') || kinds.length === 0 ? undefined : kinds,
      licenses:
        licenses.includes('all') || licenses.length === 0
          ? undefined
          : licenses,
      supplierName:
        suppliers.includes('all') || suppliers.length === 0
          ? undefined
          : suppliers,
      primary: scope === 'primary' ? true : undefined,
      internal: scope === 'internal' ? true : undefined,
      field: customerView ? signedCompField : field,
      direction: customerView ? signedCompDirection : direction
    })
  }

  const handleSort = async (column, sortDirection) => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      search: searchInput !== '' ? searchInput : undefined,
      ecosystem:
        ecosystems.includes('all') || ecosystems.length === 0
          ? undefined
          : ecosystems,
      kind: kinds.includes('all') || kinds.length === 0 ? undefined : kinds,
      licenses:
        licenses.includes('all') || licenses.length === 0
          ? undefined
          : licenses,
      supplierName:
        suppliers.includes('all') || suppliers.length === 0
          ? undefined
          : suppliers,
      primary: scope === 'primary' ? true : undefined,
      internal: scope === 'internal' ? true : undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    }).then((res) => {
      if (res.data) {
        prodCompDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
        })
      }
    })
  }

  const handlePreviousPage = async () => {
    handleRefetch(null, data.pageInfo.startCursor)
    prodCompDispatch({
      type: 'DECREMENT_PAGE',
      payload: data.pageInfo.startCursor
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNextPage = async () => {
    handleRefetch(data.pageInfo.endCursor, null)
    prodCompDispatch({
      type: 'INCREMENT_PAGE',
      payload: {
        total: data.totalCount,
        after: data.pageInfo.endCursor
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (data) {
      getCompFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          prodCompDispatch({
            type: 'ADD_FILTER_HEADS',
            payload: res.data.sbom.filters
          })
        }
      })
    }
  }, [data])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data && data.nodes}
          onSort={handleSort}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={customerView ? signedCompField : field}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          expandableRows
          expandOnRowClicked
          persistTableHead
          onRowExpandToggled={handleRowClicked}
          expandableRowsComponent={ExpandedComponent}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      {data && (
        <Flex
          width={'100%'}
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          justifyContent={'space-between'}
          mt={6}
        >
          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Button
              colorScheme='blue'
              onClick={handlePreviousPage}
              isDisabled={!data.pageInfo.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleNextPage}
              isDisabled={!data.pageInfo.hasNextPage}
            >
              Next
            </Button>
            <Box>
              Page {pageIndex} of{' '}
              {data.totalCount === 0
                ? 1
                : Math.ceil(data.totalCount / totalRows)}
            </Box>
          </Stack>

          {/* ROW LIMIT */}
          <RowLimit onChange={handleSetRow} name='componentRow' />
        </Flex>
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {isOpen && (
            <ComponentDrawer
              data={activeRow}
              isOpen={isOpen}
              onClose={onClose}
              fetchCompData={fetchCompData}
              filterRefetch={getCompFilters}
              shortDesc={null}
              checkId={null}
              primaryComp={primaryComp}
            />
          )}

          {isDelOpen && (
            <ComponentModal
              isOpen={isDelOpen}
              onClose={onDelClose}
              id={activeRow.id}
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
              total={totalComp}
              fetchCompData={fetchCompData}
              refetch={getDependency}
            />
          )}
        </>
      )}

      {/* COMPONENT DRAWER */}
      {isCompOpen && !customerView && (
        <ComponentDrawer
          isOpen={isCompOpen}
          onClose={onCompClose}
          fetchCompData={fetchCompData}
          filterRefetch={getCompFilters}
          primaryComp={primaryComp}
          shortDesc={null}
          checkId={null}
          data={null}
        />
      )}
    </>
  )
}

export default ComponentTable

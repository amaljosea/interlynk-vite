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
  HStack,
  TagCloseButton,
  Link,
  Button,
  Divider,
  Select
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
import { timeSince, GetIcon } from 'utils'
import { useState, useMemo, useRef, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import SupplierModal from 'views/Sbom/components/SupplierModal'
import LinksDrawer from 'components/Drawer/LinksDrawer'
import styled from '@emotion/styled'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { deleteComSupplier } from 'graphQL/Mutation'
import { licenseOptions } from 'variables/licenses'
import CompFilterMenu from 'views/Sbom/components/CompFilterMenu'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { getFullDateAndTime } from 'utils'
import GlobalContext from 'context/GlobalContext'
import CustomLoader from 'components/CustomLoader'
import RelationshipDrawer from 'components/Drawer/RelationshipDrawer'
import RowLimit from 'views/Sbom/components/RowLimit'
import { GetComponentPath } from 'graphQL/Queries'
import { GetCompDependency } from 'graphQL/Queries'

const customStyles = {
  headCells: {
    style: {
      width: '100%',
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const ComponentTable = ({
  lifecycle,
  data,
  totalComp,
  refetch,
  primaryComp,
  totalRows,
  setTotalRows,
  filterRefetch
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const customerView = location.pathname.startsWith('/customer')
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const x = window.matchMedia('(min-width: 2500px)')
  const y = window.matchMedia('(max-width: 1440px)')

  const {
    compSearchInput,
    setCompSearchInput,
    compFilters,
    compField,
    setCompField,
    compDirection,
    setCompDirection,
    signedCompField,
    signedCompDirection,
    setSignedCompField,
    setSignedCompDirection,
    comPageIndex,
    setComPageIndex
  } = useContext(GlobalContext)

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
                <p style={{ textWrap: 'pretty' }}>{name}</p>
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
                  variant='outline'
                  colorScheme='blue'
                >
                  <TagLabel textTransform={'capitalize'}>Internal</TagLabel>
                </Tag>
              )}
            </GridItem>
          </Grid>
        )
      },
      wrap: true,
      width: '20%',
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
        const { licenses } = row

        const filtered =
          licenses &&
          licenseOptions.filter((item) => licenses.includes(item.licenseId))

        return (
          <Flex
            alignItems={'flex-end'}
            justifyContent={'flex-end'}
            gap={2}
            flexWrap={'wrap'}
            my={2}
          >
            {filtered.length > 0 &&
              filtered.map((item, index) => (
                <Tooltip
                  key={index}
                  label={item.name}
                  placement={'top'}
                  textTransform={'capitalize'}
                >
                  <Link
                    href={item.reference}
                    target='_blank'
                    pointerEvents={item.reference === '#' ? 'none' : 'auto'}
                    overflow={'auto'}
                  >
                    <Tag
                      size={'sm'}
                      key={index}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                      textTransform={'capitalize'}
                    >
                      <TagLabel>{item.licenseId}</TagLabel>
                    </Tag>
                  </Link>
                </Tooltip>
              ))}
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

        const handleOpen = () => {
          getComPath({
            variables: {
              compId: id,
              sbomId: sbomId
            }
          }).then((res) => {
            if (res.data) {
              setActiveRow(row)
              onRelationOpen()
            }
          })
        }

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
                      onClick={() => {
                        setActiveRow(row)
                        onOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      Edit Component
                    </MenuItem>
                    <MenuItem onClick={handleOpen}>Edit Relationships</MenuItem>
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
            variables: {
              projectId: productId,
              sbomId: sbomId,
              first: totalRows,
              field: compField,
              direction: compDirection
            }
          })
        }
      })
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  // EXPAND SECTION
  const ExpandedComponent = ({ data }) => {
    const { id, suppliers, purl, description, cpes, name, kind, internal } =
      data

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
            <HStack spacing={4} mt={1}>
              {suppliers &&
                suppliers.map((item, index) => (
                  <Tag
                    size={'md'}
                    key={index}
                    variant='subtle'
                    colorScheme='orange'
                  >
                    <TagLabel>
                      {item.name}
                      {item.contactEmail && ` - ${item.contactEmail}`}
                    </TagLabel>
                    <TagCloseButton onClick={() => handleSupRemove(item.id)} />
                  </Tag>
                ))}
            </HStack>
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
              {cpes.length > 0 &&
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
        </Grid>
      </Box>
    )
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    if (event.key === 'Enter' && compSearchInput !== '') {
      await refetch({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          search: compSearchInput,
          first: totalRows,
          field: compField,
          direction: compDirection
        }
      })
      setComPageIndex(1)
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        search: undefined,
        first: totalRows,
        field: compField,
        direction: compDirection
      }
    })
    setCompSearchInput('')
    setComPageIndex(1)
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: Number(e.target.value),
        last: undefined,
        after: undefined,
        before: undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
    setFilterText('')
    setComPageIndex(1)
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
            filterText={compSearchInput}
            setFilterText={setCompSearchInput}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {compFilters && (
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
              onClick={onCompOpen}
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
  }, [compSearchInput, handleClear, handleSearch, compFilters])

  const handleSort = (column, sortDirection) => {
    // console.log(`column`, column)
    // console.log(`sortDirection`, sortDirection)
    if (customerView) {
      setSignedCompField(column.id)
      setSignedCompDirection(sortDirection === 'asc' ? 'ASC' : 'DESC')
    } else {
      setCompField(column.id)
      setCompDirection(sortDirection === 'asc' ? 'ASC' : 'DESC')
    }

    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        last: undefined,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  const [compAfter, setCompAfter] = useState('')
  const [compBefore, setCompBefore] = useState('')

  const handlePreviousPage = async () => {
    setComPageIndex((prev) => comPageIndex !== 0 && prev - 1)
    setCompBefore(data.pageInfo.startCursor)
    setCompAfter('')
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        last: totalRows,
        before: data.pageInfo.startCursor,
        after: undefined,
        first: undefined,
        search: compSearchInput !== '' ? compSearchInput : undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
  }

  const handleNextPage = async () => {
    setComPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    setCompAfter(data.pageInfo.endCursor)
    setCompBefore('')
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        after: data.pageInfo.endCursor,
        last: undefined,
        before: undefined,
        search: compSearchInput !== '' ? compSearchInput : undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data && data.nodes}
          onSort={handleSort}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={customerView ? signedCompField : compField}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          expandableRows
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
              Page {comPageIndex} of{' '}
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
              id={activeRow.id}
              isOpen={isOpen}
              onClose={onClose}
              btnRef={compBtn}
              component={activeRow.name}
              version={activeRow.version}
              license={activeRow.licenses !== null ? activeRow.licenses : []}
              type={activeRow.kind}
              refetch={refetch}
              filterRefetch={filterRefetch}
              cpes={activeRow.cpes}
              purl={activeRow.purl}
              primary={activeRow.primary}
              internal={activeRow.internal}
              shortDesc={null}
              checkId={null}
              group={activeRow.group}
              primaryComp={primaryComp}
              after={compAfter}
              before={compBefore}
            />
          )}

          {isDelOpen && (
            <ComponentModal
              isOpen={isDelOpen}
              onClose={onDelClose}
              id={activeRow.id}
              refetch={refetch}
              after={compAfter}
              before={compBefore}
            />
          )}

          {isSupOpen && (
            <SupplierModal
              id={activeRow.id}
              refetch={refetch}
              filterRefetch={filterRefetch}
              isOpen={isSupOpen}
              onClose={onSupClose}
              suppliers={activeRow.suppliers}
              shortDesc={null}
              checkId={null}
              after={compAfter}
              before={compBefore}
            />
          )}

          {isLinkOpen && (
            <LinksDrawer
              component={activeRow}
              btnRef={linkRef}
              isOpen={isLinkOpen}
              onClose={onLinkClose}
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
              after={compAfter}
              before={compBefore}
            />
          )}

          {isRelationOpen && comPath && (
            <RelationshipDrawer
              isOpen={isRelationOpen}
              onClose={onRelationClose}
              data={activeRow}
              compPath={comPath.component.pathToPrimary}
              total={totalComp}
              refetch={refetch}
              after={compAfter}
              before={compBefore}
            />
          )}
        </>
      )}

      {/* COMPONENT DRAWER */}
      {isCompOpen && !customerView && (
        <ComponentDrawer
          isOpen={isCompOpen}
          onClose={onCompClose}
          btnRef={compBtn}
          component={''}
          version={''}
          license={''}
          type={''}
          cpes={[]}
          purl={''}
          primary={false}
          internal={false}
          refetch={refetch}
          filterRefetch={filterRefetch}
          shortDesc={null}
          checkId={null}
          primaryComp={primaryComp}
          after={compAfter}
          before={compBefore}
        />
      )}
    </>
  )
}

export default ComponentTable

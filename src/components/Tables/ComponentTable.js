// Chakra imports
import { AddIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons'
import {
  Flex,
  Text,
  Stack,
  Box,
  IconButton,
  Tooltip,
  MenuButton,
  Menu,
  MenuOptionGroup,
  MenuItemOption,
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
  Input,
  Badge,
  Divider,
  chakra,
  Select,
  Skeleton
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
import { useState, useMemo, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import SupplierModal from 'views/Sbom/components/SupplierModal'
import LinksDrawer from 'components/Drawer/LinksDrawer'
import styled from '@emotion/styled'
import { useMutation } from '@apollo/client'
import { deleteComSupplier } from 'graphQL/Mutation'
import { licenseOptions } from 'variables/licenses'
import CompFilterMenu from 'views/Sbom/components/CompFilterMenu'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const customStyles = {
  headCells: {
    style: {
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
  type,
  lifecycle,
  data,
  error,
  refetch,
  pageIndex,
  setPageIndex,
  primaryComp,
  totalRows,
  setTotalRows,
  filterHeads,
  filterRefetch
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const customerView = location.pathname.startsWith('/customer')

  const [activeRow, setActiveRow] = useState(null)

  const [filterText, setFilterText] = useState('')

  const compBtn = useRef(null)
  const linkRef = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
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
      id: 'name',
      name: 'NAME',
      selector: (row) => {
        const { purl, name, primary, internal } = row
        return (
          <Stack
            width={'100%'}
            px={0}
            py='.8rem'
            direction={'row'}
            alignItems={'flex-center'}
          >
            <Box width={'50px'}>
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
            </Box>
            <Box
              display={'flex'}
              flexWrap={'wrap'}
              flexDirection={'column'}
              gap={2}
            >
              {/* COMPONENT NAME */}
              <Tooltip placement='top' label={name}>
                <Text fontSize={'14px'}>
                  {name.length > 30 ? `${name.substring(0, 30)}...` : name}
                </Text>
              </Tooltip>

              {/* EXTERNAL REFERENCE */}
              <Stack direction={'row'} alignItems={'center'}>
                {/* WEBSITE */}
                <Tooltip placement='top' label='github.com/mypackage'>
                  <IconButton
                    type='button'
                    size='xs'
                    variant='solid'
                    colorScheme='gray'
                    icon={<FaGlobe fontSize={16} />}
                  />
                </Tooltip>
                {/* DISTRIBUTION */}
                <Tooltip placement='top' label='github.com/distribution'>
                  <IconButton
                    type='button'
                    size='xs'
                    variant='solid'
                    colorScheme='gray'
                    icon={<FaSitemap fontSize={16} />}
                  />
                </Tooltip>
                {/* ADVISORIES */}
                <Tooltip placement='top' label='ghcr.io/advisory'>
                  <IconButton
                    type='button'
                    size='xs'
                    variant='solid'
                    colorScheme='gray'
                    icon={<FaHouseUser fontSize={16} />}
                  />
                </Tooltip>
                {/* SUPPORT */}
                <Tooltip placement='top' label='github.com/support-url'>
                  <IconButton
                    type='button'
                    size='xs'
                    variant='solid'
                    colorScheme='gray'
                    icon={<FaLightbulb fontSize={16} />}
                  />
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
            </Box>
          </Stack>
        )
      },
      width: '400px',
      sortable: true
    },
    // VERSION
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => row.version,
      width: '200px',
      sortable: true
    },
    // PURL
    {
      id: 'purl',
      name: 'PURL',
      selector: (row) => {
        const { purl } = row
        return (
          <>
            {purl !== null && purl !== '' ? (
              <Tooltip placement='top' label={purl}>{`${purl.substring(
                0,
                25
              )}...`}</Tooltip>
            ) : (
              ''
            )}
          </>
        )
      },
      sortable: true
    },
    // LICENSES
    {
      id: 'licenses',
      name: 'LICENSES',
      selector: (row) => {
        const { licenses } = row

        const filtered =
          licenses &&
          licenseOptions.filter((item) => licenses.includes(item.licenseId))

        return (
          <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
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
      sortable: true
    },
    // UPDATED AT
    {
      id: 'updatedAt',
      name: 'UPDATED_AT',
      selector: (row) => timeSince(row.updatedAt),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      }
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
                      onClick={() => {
                        setActiveRow(row)
                        onOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      Edit Component
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
      }
    }
  ]

  // EXPAND SECTION
  const ExpandedComponent = ({ data }) => {
    const { suppliers, purl, description, cpes } = data

    const [deleteSupplier] = useMutation(deleteComSupplier)

    const handleSupRemove = async (id) => {
      try {
        await deleteSupplier({
          variables: {
            id: suppliers[0].id
          }
        }).then((res) => {
          if (res) {
            window.location.reload()
          }
        })
      } catch (error) {
        console.log(`Mutation error`, error)
      }
    }

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
                      {item.name} - {item.contactEmail}
                    </TagLabel>
                    <TagCloseButton onClick={handleSupRemove} />
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
        </Grid>
      </Box>
    )
  }

  // SEARCH COMPONENT
  // const handleSearch = async (event) => {
  //   if (event.key === 'Enter') {
  //     await refetch({
  //       projectId: productId,
  //       sbomId: sbomId,
  //       search: filterText,
  //       first: totalRows,
  //       last: undefined,
  //       after: undefined,
  //       last: undefined,
  //       field: 'UPDATED_AT',
  //       direction: 'DESC'
  //     })
  //     setPageIndex(1)
  //   }
  // }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      search: undefined,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
    setFilterText('')
    setPageIndex(1)
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
      last: undefined,
      search: undefined,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
    setFilterText('')
    setPageIndex(1)
  }

  const filteredItems =
    data &&
    data.nodes.filter(
      (item) =>
        (item.name &&
          item.name.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.version &&
          item.version.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.purl &&
          item.purl.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.licenses && item.licenses.includes(filterText))
    )

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
          {/* <Flex alignItems={'center'} gap={4}>
            <Box position='relative' width={'300px'}>
              <Input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={handleSearch}
                placeholder='Search components'
                ref={searchInputRef}
              />
              {filterText !== '' && (
                <CloseIcon
                  w={'18px'}
                  h={'18px'}
                  bg={'blue.500'}
                  color={'white'}
                  p={1}
                  rounded={'full'}
                  position={'absolute'}
                  zIndex={9999}
                  right={3}
                  top={'11px'}
                  onClick={handleClear}
                  cursor={'pointer'}
                />
              )}
            </Box>
          </Flex> */}

          <SearchFilter
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filterHeads && (
            <CompFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
              ecosystems={filterHeads.sbom.filters.ecosystems}
              kinds={filterHeads.sbom.filters.kinds}
              licenses={filterHeads.sbom.filters.licenses}
              suppliers={filterHeads.sbom.filters.supplierNames}
              setPageIndex={setPageIndex}
              totalRows={totalRows}
            />
          )}
        </Stack>

        {/* CREATE COMPONENT */}
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
      </Flex>
    )
  }, [filterText, filteredItems, handleClear])

  const handleSort = (column, sortDirection) => {
    // console.log(`column`, column)
    // console.log(`sortDirection`, sortDirection)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: column.name,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    })
  }

  const handlePreviousPage = () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data.pageInfo.startCursor,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
  }

  const handleNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      before: undefined,
      after: data.pageInfo.endCursor,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={filteredItems.length > 0 ? filteredItems : data.nodes}
          onSort={handleSort}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={'updatedAt'}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          expandableRows
          expandableRowsComponent={ExpandedComponent}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      {!filteredItems && (
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
              isDisabled={!data.pageInfo.hasPreviousPage || error}
            >
              Previous
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleNextPage}
              isDisabled={!data.pageInfo.hasNextPage || error}
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

          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Text>Show</Text>
            <Select width={20} value={totalRows} onChange={handleSetRow}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </Stack>
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
              totalRows={totalRows}
            />
          )}

          {isDelOpen && (
            <ComponentModal
              isOpen={isDelOpen}
              onClose={onDelClose}
              id={activeRow.id}
              refetch={refetch}
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
              totalRows={totalRows}
            />
          )}

          {isLinkOpen && (
            <LinksDrawer
              component={activeRow.name}
              btnRef={linkRef}
              isOpen={isLinkOpen}
              onClose={onLinkClose}
            />
          )}
        </>
      )}

      {/* COMPONENT DRAWER */}
      {isCompOpen && data && !customerView && (
        <ComponentDrawer
          isOpen={isCompOpen}
          onClose={onCompClose}
          btnRef={compBtn}
          component={''}
          version={''}
          license={''}
          type={type}
          cpes={[]}
          purl={''}
          primary={false}
          internal={false}
          refetch={refetch}
          filterRefetch={filterRefetch}
          shortDesc={null}
          checkId={null}
          totalRows={totalRows}
        />
      )}
    </>
  )
}

export default ComponentTable

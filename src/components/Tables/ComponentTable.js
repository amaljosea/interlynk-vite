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
  Skeleton
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { BsFillPatchQuestionFill } from 'react-icons/bs'
import {
  FaEllipsisV,
  FaFilter,
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

const FilterComponent = ({ filterText, onFilter, onClear }) => {
  const searchInputRef = useRef()

  const focusSearchInput = () => {
    if (searchInputRef?.current) {
      searchInputRef?.current.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === '/') {
      focusSearchInput()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <>
      <Input
        width={'400px'}
        id='search'
        type='text'
        placeholder='Search'
        aria-label='Search Input'
        ref={searchInputRef}
      />
    </>
  )
}

const ComponentTable = ({ type, lifecycle, data, refetch }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const customerView = location.pathname.startsWith('/customer')

  const [activeRow, setActiveRow] = useState(null)
  const [pageIndex, setPageIndex] = useState(1)

  const [filterNpm, setFilterNpm] = useState([])
  const [filterNuget, setFilterNuget] = useState([])
  const [filterRuby, setFilterRuby] = useState([])

  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const filteredItems =
    data &&
    data.nodes.filter(
      (item) =>
        item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
    )

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
      }
    },
    // LICENSES
    {
      id: 'licenses',
      name: 'LICENSES',
      selector: (row) => {
        const { licenses } = row
        // const [filteredLicense, setFilteredLicense] = useState([])

        // useEffect(() => {
        //   if (licenses !== null && licenses.length > 0) {
        //     // console.log(`license item`, licenses)
        //     const filtered = licenseOptions.filter((item) =>
        //       licenses.includes(item.licenseId)
        //     )
        //     // console.log(`filtered item`, filtered)
        //     setFilteredLicense(filtered)
        //   }
        // }, [licenses])

        return (
          <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
            {licenses.length > 0 &&
              licenses.map((item, index) => (
                <Tooltip
                  key={index}
                  label={item}
                  placement={'top'}
                  textTransform={'capitalize'}
                >
                  <Link href={'#'} target='_blank'>
                    <Tag
                      size={'sm'}
                      key={index}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                      textTransform={'capitalize'}
                    >
                      <TagLabel>{item}</TagLabel>
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
      name: 'UPDATED AT',
      selector: (row) => timeSince(row.updatedAt)
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
                        onSupOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      {suppliers.length > 0 ? 'Update' : 'Add'} Supplier
                    </MenuItem>
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
                        onLinkOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      Edit Links
                    </MenuItem>
                    {primary === false && (
                      <MenuItem
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

  const ExpandedComponent = ({ data }) => {
    const { suppliers, purl, description, cpes } = data

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const productId = queryParams.get('p')
    const sbomId = queryParams.get('sbom')

    const [deleteSupplier] = useMutation(deleteComSupplier)

    const handleSupRemove = async (id) => {
      try {
        await deleteSupplier({
          variables: {
            id: suppliers[0].id
          }
        }).then((res) => {
          if (res) {
            refetch({
              productId: productId,
              sbomId: sbomId
            })
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
          templateColumns='repeat(2, 1fr)'
          gap={6}
          width={'80%'}
          margin={'0 auto'}
        >
          <GridItem w='100%'>
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

  const activeFiltersCount =
    filterNpm.length + filterNuget.length + filterRuby.length

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }

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
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />
          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}

          <Box width={'fit-content'} position={'relative'}>
            <Menu closeOnSelect={true}>
              {activeFiltersCount > 0 && (
                <Badge
                  variant='solid'
                  colorScheme='teal'
                  position={'absolute'}
                  right={-2}
                  top={-1.5}
                  zIndex={11}
                >
                  {activeFiltersCount}
                </Badge>
              )}
              <MenuButton
                as={Button}
                colorScheme='blue'
                fontWeight='normal'
                fontSize={'sm'}
                leftIcon={<FaFilter size={14} />}
              >
                Ecosystem
              </MenuButton>
              <MenuList>
                <MenuOptionGroup
                  type='radio'
                  onChange={() => window.location.reload()}
                >
                  <MenuItemOption value={'All'} fontSize={'sm'}>
                    All
                  </MenuItemOption>
                </MenuOptionGroup>
                <MenuOptionGroup
                  type='checkbox'
                  onChange={(value) => setFilterNpm(value)}
                >
                  <MenuItemOption value={'NPM'} fontSize={'sm'}>
                    NPM
                  </MenuItemOption>
                </MenuOptionGroup>
                <MenuOptionGroup
                  type='checkbox'
                  onChange={(value) => setFilterNuget(value)}
                >
                  <MenuItemOption value={'NuGet'} fontSize={'sm'}>
                    NuGet
                  </MenuItemOption>
                </MenuOptionGroup>
                <MenuOptionGroup
                  type='checkbox'
                  onChange={(value) => setFilterRuby(value)}
                >
                  <MenuItemOption value={'RubyGems'} fontSize={'sm'}>
                    RubyGems
                  </MenuItemOption>
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </Box>
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
  }, [
    filterText,
    resetPaginationToggle,
    activeFiltersCount,
    filterNpm,
    filterNuget,
    filterRuby
  ])

  const handleSort = (column, sortDirection) => {
    console.log(`column`, column)
    console.log(`sortDirection`, sortDirection)
    refetch({
      projectId: productId,
      sbomId: sbomId,
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
      last: 10,
      before: data.pageInfo.startCursor,
      after: ''
    })
  }

  const handleNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: ''
    })
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={filteredItems}
          onSort={handleSort}
          customStyles={customStyles}
          defaultSortAsc
          defaultSortFieldId={'name'}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          expandableRows
          expandableRowsComponent={ExpandedComponent}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      <Flex
        flexDir={'row'}
        gap={4}
        alignItems={'center'}
        mt={6}
        justifyContent={'flex-start'}
      >
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
          Page {pageIndex} of {Math.ceil(data.totalCount / 10)}
        </Box>
      </Flex>


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
              license={activeRow.licenses}
              type={activeRow.kind}
              refetch={refetch}
              cpes={activeRow.cpes}
              purl={activeRow.purl}
              primary={activeRow.primary}
              internal={activeRow.internal}
              suppliers={activeRow.suppliers}
              shortDesc={null}
              group={activeRow.group}
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
              isOpen={isSupOpen}
              onClose={onSupClose}
              suppliers={activeRow.suppliers}
              shortDesc={null}
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
          suppliers={null}
          shortDesc={null}
        />
      )}
    </>
  )
}

export default ComponentTable

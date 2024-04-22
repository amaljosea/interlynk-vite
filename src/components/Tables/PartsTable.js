import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  capitalizeFirstLetter,
  customStyles,
  envOrderList,
  isDefaultEnv,
  parseJSONSafely
} from 'utils'
import { getProductVersionDetailPageUrl } from 'utils/url'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  Select,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  UnorderedList,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'

import { SbomPartCreate, SbomPartDelete } from 'graphQL/Mutation'
import {
  CheckDeepParts,
  GetProductData,
  GetProject,
  GetProjectGroups,
  GetSbomParts
} from 'graphQL/Queries'

import { FaEllipsisV, FaFilter } from 'react-icons/fa'

const PartsTable = ({ data, refetch, getVulnData, getCompData }) => {
  const location = useLocation()
  const params = useParams()
  const sbomId = params.sbomid
  const prodId = params.productid
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'
  const group = JSON.parse(localStorage.getItem('product'))
  const subProduct = (() => {
    try {
      return parseJSONSafely(localStorage.getItem('subProduct'))
    } catch (error) {
      console.log(error)
      return null
    }
  })()
  const currentSbom = (() => {
    try {
      return parseJSONSafely(localStorage.getItem('currentSBOM'))
    } catch (error) {
      console.log(error)
      return null
    }
  })()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const filterData =
    data?.length > 0 &&
    data?.filter(
      (item) =>
        item?.part?.id !== currentSbom?.id &&
        item?.part?.id !== subProduct?.sbomId &&
        item?.part?.id !== subProduct?.childOne?.sbomId &&
        item?.part?.id !== subProduct?.childTwo?.sbomId &&
        item?.part?.id !== subProduct?.childThree?.sbomId &&
        item?.part?.id !== subProduct?.childFour?.sbomId
    )

  const {
    setActiveProdTab,
    totalRows,
    prodState,
    prodCompState,
    prodVulnState,
    userPermissions,
    dispatch
  } = useGlobalState()
  const { enabled, field, direction } = prodState
  const { prodVulnDispatch } = dispatch

  const sboms = userPermissions?.find((item) => item.key === 'view_sbom')
  const updateSboms = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'update_sbom' && permission.value === true
  )

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const addBtn = useRef()
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeRow, setActiveRow] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [envList, setEnvList] = useState([])
  const [newPartExists, setNewPartExists] = useState(false)

  const { data: allProjects } = useQuery(GetProjectGroups, {
    variables: {
      first: totalRows,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction
    }
  })

  const { refetch: sbomRefetch } = useQuery(GetProductData, {
    fetchPolicy: 'network-only',
    skip: newPartExists ? false : true,
    variables: { projectId: prodId, sbomId: sbomId }
  })

  const { data: partsData } = useQuery(GetSbomParts, {
    fetchPolicy: 'network-only',
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion }
  })

  // GET SBOM PARTS
  const { data: deep } = useQuery(CheckDeepParts, {
    fetchPolicy: 'network-only',
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion },
    onCompleted: (data) => console.log('Deep parts', data)
  })

  const isExists = partsData?.sbom?.sbomParts?.some(
    (item) => item?.part?.project?.id === prodId && item?.part?.id === sbomId
  )

  const existingNodes = deep?.sbom?.deepParts?.some(
    (item) => item?.id === sbomId
  )

  const [createSbomPart] = useMutation(SbomPartCreate)
  const [deleteSbomPart] = useMutation(SbomPartDelete)

  const handleCreatePart = async () => {
    setNewPartExists(true)
    await createSbomPart({
      variables: { parentSbomId: sbomId, partSbomId: selectedVersion }
    })
      .then((res) => {
        if (res.data) {
          sbomRefetch({ projectId: prodId, sbomId: sbomId })
          prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
          refetch({ variables: { projectId: prodId, sbomId: sbomId } })
        }
      })
      .finally(() => {
        setNewPartExists(false)
        setSelectedGroup('')
        setSelectedProd('')
        setSelectedVersion('')
        onClose()
      })
  }

  const handleRemove = async () => {
    await deleteSbomPart({
      variables: {
        id: activeRow.id
      }
    })
      .then((res) => {
        if (res.data) {
          refetch({
            variables: {
              projectId: prodId,
              sbomId: sbomId
            }
          })
        }
      })
      .finally(() => onDeleteClose())
  }

  const [getProduct] = useLazyQuery(GetProject, {
    skip: signedUrlParams ? true : false
  })

  const handleSelectGroup = (e) => {
    const { value } = e.target
    if (value !== '') {
      setSelectedGroup(value)
      setSelectedProd('')
      setSelectedVersion('')
      const activeGroup =
        allProjects &&
        allProjects?.organization?.projectGroups?.nodes.find(
          (item) => item.id === value
        )
      const productList =
        activeGroup &&
        activeGroup.projects
          .filter((item) => item.enabled === true)
          .map((option) => ({
            value: option.id,
            label: option.name
          }))
      setEnvList(productList)
    } else {
      setSelectedGroup('')
      setSelectedProd('')
      setSelectedVersion('')
      setEnvList('')
    }
  }

  const handleSelectProduct = (e) => {
    const { value } = e.target
    setSelectedProd(value)
    const env = e.target.options[e.target.selectedIndex].text
    if (value === '') {
      setSelectedVersion('')
    } else {
      getProduct({
        variables: { id: value }
      })
    }
  }

  const activeGroup =
    allProjects &&
    allProjects?.organization?.projectGroups?.nodes.find(
      (item) => item.id === selectedGroup
    )

  const product = activeGroup?.projects?.find(
    (item) => item.id === selectedProd
  )

  const existingVersions = []

  data?.map((item) =>
    existingVersions.push({
      group: item?.part?.project?.projectGroup?.name,
      env: item?.part?.project?.name,
      version: item?.part?.projectVersion
    })
  )

  const sbomVersions = []

  product?.sboms?.length > 0 &&
    product.sboms.map((project) => {
      const myProduct = {
        group: product?.projectGroup?.name,
        env: product?.name,
        version: project?.projectVersion
      }
      const isVersionIncluded = existingVersions?.some(
        (item) => JSON.stringify(item) === JSON.stringify(myProduct)
      )
      if (!isVersionIncluded) {
        sbomVersions.push({
          label: project?.projectVersion,
          value: project?.id,
          creationAt: project?.createdAt
        })
      }
    })

  const getComponents = () => {
    localStorage.setItem('activeSbomTab', 2)
    getCompData({
      variables: {
        projectId: prodId,
        sbomId: sbomId,
        first: totalRows,
        field: prodCompState.field,
        direction: prodCompState.direction
      }
    })
  }

  const onFilterSev = async (value) => {
    await getVulnData({
      projectId: prodId,
      sbomId: sbomId,
      severity: value,
      first: totalRows,
      field: prodVulnState.field,
      direction: prodVulnState.direction
    }).then((res) => {
      if (res.data) {
        prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
        localStorage.setItem('activeSbomTab', 3)
      }
    })
  }

  const onSelectPart = (part) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    localStorage.setItem('activeSbomTab', 0)
    const { id, project, projectVersion } = part
    const { projectGroup } = project
    if (
      subProduct?.name &&
      !subProduct?.childOne &&
      !subProduct?.childTwo &&
      !subProduct?.childThree &&
      !subProduct?.childFour
    ) {
      localStorage.setItem(
        'subProduct',
        JSON.stringify({
          ...subProduct,
          childOne: {
            name: projectGroup?.name,
            version: projectVersion,
            projectId: project?.id,
            sbomId: id
          }
        })
      )
    } else {
      localStorage.setItem(
        'subProduct',
        JSON.stringify({
          name: projectGroup?.name,
          version: projectVersion,
          projectId: project?.id,
          sbomId: id
        })
      )
    }
    if (subProduct?.childOne?.name) {
      localStorage.setItem(
        'subProduct',
        JSON.stringify({
          ...subProduct,
          childTwo: {
            name: projectGroup?.name,
            version: projectVersion,
            projectId: project?.id,
            sbomId: id
          }
        })
      )
    }
    if (subProduct?.childTwo?.name) {
      localStorage.setItem(
        'subProduct',
        JSON.stringify({
          ...subProduct,
          childThree: {
            name: projectGroup?.name,
            version: projectVersion,
            projectId: project?.id,
            sbomId: id
          }
        })
      )
    }
    if (subProduct?.childThree?.name) {
      localStorage.setItem(
        'subProduct',
        JSON.stringify({
          ...subProduct,
          childFour: {
            name: projectGroup?.name,
            version: projectVersion,
            projectId: project?.id,
            sbomId: id
          }
        })
      )
    }
    setActiveProdTab(0)
  }

  // COLUMNS
  const columns = [
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { part } = row

        const link = getProductVersionDetailPageUrl({
          productgroupid: params.productgroupid,
          productid: part.project.id,
          sbomid: part.id,
          paramsObj: {
            parts: true
          }
        })

        return (
          <Link to={link}>
            <Text
              color={'blue.500'}
              minWidth='100%'
              fontSize={14}
              onClick={() => onSelectPart(part)}
            >
              {part.project.projectGroup.name}
            </Text>
          </Link>
        )
      },
      wrap: true,
      width: '200px'
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { part } = row
        return (
          <Text fontSize={14} my={2}>
            {part?.projectVersion}
          </Text>
        )
      },
      width: '200px',
      right: 'true',
      wrap: true
    },
    {
      id: 'SUPPLIER',
      name: 'SUPPLIER',
      selector: (row) => {
        const { part } = row
        return (
          <>
            {part.suppliers.length > 0 &&
              part.suppliers.map((item, index) => (
                <Tooltip
                  key={index}
                  label={`${item.contactName} ${item.contactEmail && `- ${item.contactEmail}`}`}
                  placement='top'
                >
                  <Tag
                    size={'md'}
                    key={index}
                    fontSize={14}
                    variant='subtle'
                    colorScheme='orange'
                  >
                    <TagLabel>
                      {item.contactName || ''}
                      {item.contactEmail && ` - ${item.contactEmail}`}
                    </TagLabel>
                  </Tag>
                </Tooltip>
              ))}
          </>
        )
      }
    },
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { part } = row

        const link = getProductVersionDetailPageUrl({
          productgroupid: params.productgroupid,
          productid: part.project.id,
          sbomid: part.id,
          paramsObj: {
            parts: true
          }
        })

        return (
          <Link to={link} onClick={getComponents}>
            <Tag
              size='md'
              variant='subtle'
              width={16}
              colorScheme={'blue'}
              cursor={'pointer'}
            >
              <TagLabel mx={'auto'}>{part.stats.compCount}</TagLabel>
            </Tag>
          </Link>
        )
      },
      width: '150px'
    },
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { part } = row
        return (
          <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
            <TagLabel mx={'auto'}> {part.stats.compLicenseCount}</TagLabel>
          </Tag>
        )
      },
      width: '150px'
    },
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { part } = row
        const link = getProductVersionDetailPageUrl({
          productgroupid: params.productgroupid,
          productid: part.project.id,
          sbomid: part.id
        })

        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <Link to={link}>
              <VulnBadge
                color='red'
                label='Critical'
                onClick={() => onFilterSev(['critical'])}
              >
                {part?.stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link to={link}>
              <VulnBadge
                color='orange'
                label='High'
                onClick={() => onFilterSev(['high'])}
              >
                {part?.stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link to={link}>
              <VulnBadge
                color='yellow'
                label='Medium'
                onClick={() => onFilterSev(['medium'])}
              >
                {part?.stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link to={link}>
              <VulnBadge
                color='green'
                label='Low'
                onClick={() => onFilterSev(['low'])}
              >
                {part?.stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link to={link}>
              <VulnBadge
                color='gray'
                label='Unknown'
                onClick={() => onFilterSev(['unknown'])}
              >
                {part?.stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Link>
          </Stack>
        )
      },
      width: '360px'
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { part } = row
        return (
          <Tag width={24} colorScheme='cyan' textTransform={'capitalize'}>
            <TagLabel mx={'auto'}>{part.lifecycle}</TagLabel>
          </Tag>
        )
      }
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList size='sm'>
                <MenuItem
                  isDisabled={!updateSboms || signedUrlParams}
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                >
                  Remove
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  // SEARCH COMPONENT
  const handleSearch = () => console.log('hello')

  // CLEAR SERACH
  const handleClear = () => setSearchInput('')

  const handleRefresh = async () => {
    await refetch({ variables: { projectId: prodId, sbomId: sbomId } }).then(
      (res) => res?.data && sbomRefetch({ projectId: prodId, sbomId: sbomId })
    )
  }

  // SUB HEADER
  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={2}
          alignItems={'flex-start'}
          justifyContent={'flex-end'}
        >
          <HStack spacing={4} display={'none'}>
            {/* SEARCH COMPONENTS */}
            <SearchFilter
              id='team'
              filterText={searchInput}
              setFilterText={setSearchInput}
              onFilter={handleSearch}
              onClear={handleClear}
            />
            {/* FILTER */}
            <Menu closeOnSelect={true}>
              <MenuButton
                as={Button}
                colorScheme='blue'
                fontWeight='normal'
                fontSize={'sm'}
                leftIcon={<FaFilter size={14} />}
              >
                Supplier
              </MenuButton>
              <MenuList>
                <MenuOptionGroup type='checkbox'>
                  {['Interlynk', 'Biotronik', 'Oracle'].map((item, index) => (
                    <MenuItemOption key={index} value={item} fontSize={'sm'}>
                      {item}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </HStack>

          <Tooltip label='Add Part' placement='top'>
            <IconButton
              display={
                subProduct?.name &&
                subProduct?.childOne?.name &&
                subProduct?.childTwo?.name &&
                subProduct?.childThree?.name &&
                subProduct?.childFour?.name
                  ? 'none'
                  : 'flex'
              }
              ref={addBtn}
              onClick={onOpen}
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              fontWeight='normal'
              fontSize={'sm'}
              isDisabled={!updateSboms || signedUrlParams}
            />
          </Tooltip>
          <Tooltip label='Refresh'>
            <IconButton
              onClick={handleRefresh}
              colorScheme='blue'
              icon={<RepeatIcon />}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [searchInput, handleSearch, handleClear])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={filterData}
          customStyles={customStyles}
          persistTableHead
          subHeader
          progressPending={data ? false : true}
          subHeaderComponent={subHeaderComponent}
          progressComponent={<CustomLoader />}
          responsive={true}
        />
      </Flex>

      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Parts</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4} direction={'column'} gap={2}>
                {/* PROJECTS */}
                <FormControl fontSize={'sm'}>
                  <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
                    Project
                  </FormLabel>
                  <Select
                    fontSize={'sm'}
                    name='groups'
                    id='groups'
                    value={selectedGroup}
                    onChange={handleSelectGroup}
                  >
                    <option value={''}>-- Select --</option>
                    {allProjects?.organization?.projectGroups?.nodes
                      .filter(
                        (item) =>
                          item.id !== group?.groupId &&
                          item?.name !== subProduct?.name &&
                          item?.name !== subProduct?.childOne?.name &&
                          item?.name !== subProduct?.childTwo?.name &&
                          item?.name !== subProduct?.childThree?.name &&
                          item?.name !== subProduct?.childFour?.name
                      )
                      .map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                {/* ENVIRONMENTS */}
                <FormControl fontSize={'sm'}>
                  <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
                    Environment
                  </FormLabel>
                  <Select
                    fontSize={'sm'}
                    name='product'
                    id='product'
                    value={selectedProd}
                    onChange={handleSelectProduct}
                  >
                    <option value={''}>-- Select --</option>
                    {envList?.length > 0 &&
                      envOrderList(envList).map((item, index) => (
                        <option
                          key={index}
                          value={item.value}
                          label={
                            isDefaultEnv(item.label)
                              ? capitalizeFirstLetter(item.label)
                              : item.label
                          }
                        >
                          {item.label}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                {/* Version */}
                <FormControl fontSize={'sm'}>
                  <FormLabel htmlFor='versions' fontSize='md' color='gray.600'>
                    Version
                  </FormLabel>
                  {sbomVersions?.length === 0 ? (
                    <Alert borderRadius={'md'} py={'8px'} status='info'>
                      <AlertIcon />
                      No version available
                    </Alert>
                  ) : (
                    <Select
                      fontSize={'sm'}
                      name='versions'
                      id='versions'
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                    >
                      <option value={''}>-- Select --</option>
                      {sbomVersions.map((item, index) => (
                        <option key={index} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
                {(isExists === true || existingNodes) && (
                  <Alert borderRadius={4} status='error'>
                    <AlertIcon />
                    <AlertDescription>
                      Same version already exists inside selected SBOM
                    </AlertDescription>
                  </Alert>
                )}
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} fontSize={'sm'} onClick={onClose}>
                Close
              </Button>
              <Button
                fontSize={'sm'}
                variant='solid'
                colorScheme='blue'
                onClick={handleCreatePart}
                disabled={
                  selectedVersion === '' ||
                  isExists === true ||
                  existingNodes === true
                }
              >
                Add
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* DISABLED */}
      {isDeleteOpen && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Part</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Deleting this version will: </Text>
              <UnorderedList>
                <Flex flexDir={'column'} gap={1} mt={4}>
                  {[
                    'remove this versions and its SBOM',
                    'remove access to this version for all users'
                  ].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>
              <Text mt={6}>Are you sure you wish to continue ?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onDeleteClose}>
                No
              </Button>
              <Button onClick={handleRemove} colorScheme='red'>
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default PartsTable

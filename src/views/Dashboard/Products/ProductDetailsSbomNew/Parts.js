import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  capitalizeFirstLetter,
  customStyles,
  envOrderList,
  isDefaultEnv
} from 'utils'
import { GetIcon, isUnknown } from 'utils'
import { ProductGeneralTabs } from 'utils/TabsObjects'
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
  Grid,
  GridItem,
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
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { SbomPartCreate, SbomPartDelete } from 'graphQL/Mutation'
import {
  CheckDeepParts,
  GetProject,
  GetProjectGroups,
  GetSbomParts
} from 'graphQL/Queries'

import { BsFillPatchQuestionFill } from 'react-icons/bs'
import { FaEllipsisV, FaFilter } from 'react-icons/fa'

const Parts = ({ sbomRefetch }) => {
  const location = useLocation()
  const params = useParams()
  const partsContext = usePartsContext()
  const sbomId = params.sbomid
  const prodId = params.productid
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { totalRows, prodState, userPermissions, dispatch } = useGlobalState()

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { enabled, field, direction } = prodState
  const { prodVulnDispatch } = dispatch

  const { PARTS } = ProductGeneralTabs

  // GET SBOM PARTS
  const { data, refetch, error } = useQuery(GetSbomParts, {
    skip: activeTab === PARTS ? false : true,
    variables: { projectId: prodId, sbomId, first: totalRows }
  })

  const { sbomParts } = data?.sbom || ''

  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

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

  const { data: allProjects } = useQuery(GetProjectGroups, {
    skip: activeTab === PARTS ? false : true,
    variables: {
      first: totalRows,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction
    }
  })

  const { data: partsData } = useQuery(GetSbomParts, {
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion }
  })

  // GET SBOM PARTS
  const { data: deep } = useQuery(CheckDeepParts, {
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
    await createSbomPart({
      variables: { parentSbomId: sbomId, partSbomId: selectedVersion }
    })
      .then((res) => {
        if (res.data) {
          sbomRefetch({ projectId: prodId, sbomId: sbomId })
          prodVulnDispatch({ type: 'FILTER_SOURCE', payload: true })
          prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
          refetch({ projectId: prodId, sbomId })
        }
      })
      .finally(() => {
        setSelectedGroup('')
        setSelectedProd('')
        setSelectedVersion('')
        onClose()
      })
  }

  const handleRemove = async () => {
    await deleteSbomPart({
      variables: { id: activeRow.id }
    })
      .then((res) => {
        if (res.data) {
          sbomRefetch({ projectId: prodId, sbomId: sbomId })
          refetch({ projectId: prodId, sbomId })
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
    if (value === '') {
      setSelectedVersion('')
    } else {
      getProduct({
        variables: { id: value }
      })
    }
  }

  const getSbomVersions = () => {
    if (!selectedGroup) {
      return []
    }

    if (!selectedProd) {
      return []
    }

    const activeGroup = allProjects?.organization?.projectGroups?.nodes.find(
      (item) => item.id === selectedGroup
    )

    const activeEnv = activeGroup?.projects?.find(
      (item) => item.id === selectedProd
    )

    const allSboms = activeEnv.sboms

    const allowedSboms = allSboms.filter((item) => {
      const previousUrls = partsContext.parts.map((i) => i.url)
      const allUrl = [...previousUrls, location.pathname]
      const urlHasId = allUrl.find((url) => url.includes(item.id))
      return !urlHasId
    })

    return allowedSboms.map((sbom) => ({
      label: sbom?.projectVersion,
      value: sbom?.id,
      creationAt: sbom?.createdAt
    }))
  }

  const sbomVersions = getSbomVersions()

  const onSelectPart = () => {
    partsContext.push()
  }

  const onFilterSev = (part, value) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    onSelectPart(part)
  }

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      const inProgress = sbomParts?.some(
        (item) => item?.vulnRunStatus === 'IN_PROGRESS'
      )
      if (inProgress) {
        refetch()
      } else {
        clearInterval(refetchInterval)
      }
    }, 5000)
    return () => clearInterval(refetchInterval)
  }, [sbomParts, refetch])

  // COLUMNS
  const columns = [
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { part } = row
        const { primaryComponent } = part || ''
        const { purl, cpes } = primaryComponent || ''
        const unknown = isUnknown(cpes, purl)

        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productgroupid: part.project.projectGroup.id,
          productid: part.project.id,
          sbomid: part.id,
          paramsObj: {
            parts: true
          }
        })

        const icon = unknown ? (
          <BsFillPatchQuestionFill color='#4299E1' fontSize={24} />
        ) : (
          GetIcon(purl?.split('/')[0])
        )

        return (
          <Grid
            my={3}
            gap={2}
            alignItems={'center'}
            templateColumns='repeat(7, 1fr)'
          >
            <GridItem colSpan={1} width={'50px'}>
              <IconButton
                isRound={true}
                variant='solid'
                colorScheme='gray'
                icon={icon}
              />
            </GridItem>
            <GridItem colSpan={6}>
              <Link to={link} replace>
                <Text
                  fontSize={14}
                  color={'blue.500'}
                  onClick={() => onSelectPart(part)}
                >
                  {part?.project?.projectGroup?.name}
                </Text>
              </Link>
            </GridItem>
          </Grid>
        )
      },
      width: '10%',
      wrap: true
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { part } = row
        return (
          <Text color={textColor} fontSize={14} my={2} textAlign='right'>
            {part?.projectVersion}
          </Text>
        )
      },
      width: '10%',
      right: 'true',
      wrap: true
    },
    {
      id: 'SUPPLIER',
      name: 'SUPPLIER',
      selector: (row) => {
        const { part } = row
        const { suppliers } = part || ''
        return (
          <>
            {suppliers?.map((item, index) => (
              <Tooltip
                key={index}
                label={`${item?.name || item.contactName || ''} ${item.contactEmail && `- ${item.contactEmail}`}`}
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
                    {item?.name || item?.contactName || ''}
                    {item?.contactEmail && ` - ${item?.contactEmail}`}
                  </TagLabel>
                </Tag>
              </Tooltip>
            ))}
          </>
        )
      },
      width: '15%'
    },
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { part } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productid: part?.project?.id,
          sbomid: part?.id,
          paramsObj: {
            tab: 'components',
            parts: true
          }
        })

        return (
          <Link to={link} onClick={() => onSelectPart(part)}>
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
      width: '11%'
    },
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { part } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productid: part?.project?.id,
          sbomid: part?.id,
          paramsObj: {
            tab: 'licenses',
            parts: true
          }
        })
        return (
          <Link to={link} onClick={() => onSelectPart(part)}>
            <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
              <TagLabel mx={'auto'}>{part.stats.compLicenseCount}</TagLabel>
            </Tag>
          </Link>
        )
      },
      width: '8%'
    },
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { part, vulnRunStatus } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productid: part.project.id,
          sbomid: part.id,
          paramsObj: {
            tab: 'vulnerabilities',
            parts: true
          }
        })
        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <Link to={link}>
              <VulnBadge
                color='red'
                label='Critical'
                onClick={() => onFilterSev(part, ['critical'])}
                status={vulnRunStatus}
              >
                {part?.stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link to={link}>
              <VulnBadge
                color='orange'
                label='High'
                onClick={() => onFilterSev(part, ['high'])}
                status={vulnRunStatus}
              >
                {part?.stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link to={link}>
              <VulnBadge
                color='yellow'
                label='Medium'
                onClick={() => onFilterSev(part, ['medium'])}
                status={vulnRunStatus}
              >
                {part?.stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link to={link}>
              <VulnBadge
                color='green'
                label='Low'
                onClick={() => onFilterSev(part, ['low'])}
                status={vulnRunStatus}
              >
                {part?.stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link to={link}>
              <VulnBadge
                color='gray'
                label='Unknown'
                onClick={() => onFilterSev(part, ['unknown'])}
                status={vulnRunStatus}
              >
                {part?.stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Link>
          </Stack>
        )
      },
      width: '26%'
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
      width: '10%',
      right: 'true'
    }
  ]

  // SEARCH COMPONENT
  const handleSearch = () => console.log('hello')

  // CLEAR SERACH
  const handleClear = () => setSearchInput('')

  const handleRefresh = useCallback(async () => {
    await refetch({ projectId: prodId, sbomId }).then(
      (res) => res?.data && sbomRefetch({ projectId: prodId, sbomId: sbomId })
    )
  }, [prodId, refetch, sbomId, sbomRefetch])

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
  }, [searchInput, onOpen, updateSboms, signedUrlParams, handleRefresh])

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={sbomParts}
          customStyles={customStyles(headColor)}
          persistTableHead
          subHeader
          progressPending={sbomParts ? false : true}
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
                    {allProjects?.organization?.projectGroups?.nodes.map(
                      (item, index) => (
                        <option key={index} value={item.id}>
                          {item.name}
                        </option>
                      )
                    )}
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
                          {item?.label?.length > 40
                            ? `${item?.label?.substring(0, 40)}...`
                            : item?.label}
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

export default Parts

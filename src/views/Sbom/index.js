// Chakra imports
import {
  Flex,
  Stack,
  Icon,
  Button,
  Grid,
  GridItem,
  Text,
  Tag,
  TagLabel,
  Select,
  IconButton,
  useDisclosure,
  Box,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Skeleton,
  Spinner,
  UnorderedList,
  ListItem,
  Badge,
  useToast,
  HStack
} from '@chakra-ui/react'
import React, { useState, useRef, useEffect, useContext } from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMTable from './components/SBOMTable'
import {
  FaBalanceScale,
  FaCube,
  FaCubes,
  FaLayerGroup,
  FaFileDownload,
  FaBug,
  FaAngleLeft
} from 'react-icons/fa'
import { TbSignature, TbSignatureOff } from 'react-icons/tb'
import { useLocation, useHistory, Link } from 'react-router-dom'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { timeSince, getFullDateAndTime } from 'utils'
import SigningModal from './components/SigningModal'
import DownloadModal from './components/DownloadModal'
import CopyModal from './components/CopyModal'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import {
  GetProductData,
  GetProject,
  GetProjectData,
  GetAllComponents,
  GetVulnData,
  GetComponentData
} from 'graphQL/Queries'
import { sbomDelete } from 'graphQL/Mutation'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import CheckModal from './components/CheckModal'
import GlobalContext from 'context/GlobalContext'
import { BsBoxFill } from 'react-icons/bs'
import ReactSelect from 'react-select'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function SBOM() {
  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const btnRef = useRef()

  const location = useLocation()
  const history = useHistory()
  const toast = useToast()

  const {
    prodField,
    prodDirection,
    setActiveProdTab,
    vulnField,
    vulnDirection,
    setComPageIndex,
    setCompSearchInput,
    setCompEcosystem,
    setCompType,
    setCompLicense,
    setCompSupplier,
    setCompScope,
    setVulnSeverity,
    setVulnComponent,
    setVulnStatus,
    setVulnKev,
    setVulnEpss,
    setMinVal,
    setMaxVal,
    totalRows,
    setCheckSearchInput,
    setCheckRules,
    setCheckCategory,
    setCheckSeverity,
    setCheckStatus,
    setCheckDirection,
    setVulnIndex,
    setVulnSearchInput,
    compField,
    compDirection
  } = useContext(GlobalContext)

  const customerView = location.pathname.startsWith('/customer')
  const currentProduct = JSON.parse(localStorage.getItem(`product`))
  const queryParams = new URLSearchParams(location.search)
  const parts = queryParams.get('parts')
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const { isOpen, onOpen, onClose, onToggle } = useDisclosure()

  const [status, setStatus] = useState('created')
  const [components, setComponents] = useState([])
  const [signedData, setSignedData] = useState(null)

  const [selectedVersion, setSelectedVersion] = useState({
    label: '',
    value: '',
    creationAt: ''
  })

  useEffect(() => {
    if (!idRegex.test(productId) || !idRegex.test(sbomId)) {
      window.location.href = `/vendor/products`
    }
  }, [productId, sbomId])

  const { data: allProjects } = useQuery(GetProjectData, {
    variables: {
      first: 10,
      field: prodField,
      direction: prodDirection
    }
  })

  // GET COMPONENT DATA
  const [getCompData, { data: compData, error: compError }] = useLazyQuery(
    GetComponentData,
    {
      fetchPolicy: 'network-only'
    }
  )

  // GET VULN DATA
  const [getVulnData, { data: vulnData, refetch: vulnRefetch }] = useLazyQuery(
    GetVulnData,
    {
      fetchPolicy: 'network-only'
    }
  )

  const selectedProject =
    allProjects &&
    allProjects.projects.nodes.find((item) => item.id === productId)

  const {
    isOpen: isSBMOpen,
    onOpen: setSBMOpen,
    onClose: setSBMClose
  } = useDisclosure()

  const {
    isOpen: isVerifyOpen,
    onOpen: setVerifyOpen,
    onClose: setVerifyClose
  } = useDisclosure()

  const {
    isOpen: isDelete,
    onOpen: setDeleteOpen,
    onClose: setDeleteClose
  } = useDisclosure()

  const {
    isOpen: isCopied,
    onOpen: onCopiedOpen,
    onClose: onCopiedClose
  } = useDisclosure()

  const {
    isOpen: isPrimaryOpen,
    onOpen: onPrimaryOpen,
    onClose: onPrimaryClose
  } = useDisclosure()

  const {
    data: sbomData,
    refetch,
    error
  } = useQuery(GetProductData, {
    variables: {
      projectId: productId,
      sbomId: sbomId
    }
  })

  useEffect(() => {
    if (error) {
      toast({
        description: error.message,
        status: 'error',
        duration: 2000,
        position: 'top'
      })
      history.push('/vendor/products')
    }
  }, [error])

  const { data } = useQuery(GetProject, {
    variables: {
      id: productId
    }
  })

  const [deleteSbom] = useMutation(sbomDelete)

  const uniqVersions = []

  data &&
    data.project.sboms.map((project) => {
      if (project.primaryComponent) {
        uniqVersions.push({
          label: project.primaryComponent.version,
          value: project.id,
          creationAt: project.creationAt
        })
      }
    })

  // remove duplicates
  const removeDuplicatesAndLatest = (arr) => {
    const uniqueVersions = {}

    for (const item of arr) {
      if (
        !uniqueVersions[item.label] ||
        item.updatedAt > uniqueVersions[item.label].creationAt
      ) {
        uniqueVersions[item.label] = item
      }
    }

    return Object.values(uniqueVersions)
  }

  const filteredData = uniqVersions
    ? removeDuplicatesAndLatest(uniqVersions)
    : []

  filteredData?.sort((a, b) => {
    const dateA = new Date(a.creationAt)
    const dateB = new Date(b.creationAt)
    return dateB - dateA
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteSbom({
        variables: {
          id: sbomId
        }
      }).then((res) => {
        setIsLoading(false)
        history.push(`/vendor/products`)
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const refetchSBOM = async (id) => {
    await refetch({
      projectId: productId,
      sbomId: id
    }).then((res) => res.data && history.push(`/vendor/products?p=${productId}&sbom=${id}`))
  }

  const handleSBOMChange = (select) => {
    setActiveProdTab(0)
    setCompSearchInput('')
    setCompEcosystem([])
    setCompType([])
    setCompLicense([])
    setCompSupplier([])
    setCompScope('')
    setVulnSeverity([])
    setVulnComponent([])
    setVulnStatus([])
    setVulnKev('')
    setVulnEpss('')
    setMinVal(0)
    setMaxVal(10000)
    setCheckSearchInput('')
    setCheckRules([])
    setCheckCategory([])
    setCheckSeverity([])
    setCheckStatus([])
    setCheckDirection('DESC')
    setSelectedVersion(select)
    refetchSBOM(select.value)
  }

  const sbomVersions = []

  data &&
    data.project.sboms.map((project) => {
      if (project.primaryComponent === true) {
        sbomVersions.push({
          label: project.primaryComponent.version,
          value: project.primaryComponent.id
        })
      }
    })

  const filterVersion =
    data && data.project.sboms.find((item) => item.id === sbomId)

  useEffect(() => {
    if (data) {
      setSelectedVersion({
        label: filterVersion.primaryComponent
          ? filterVersion.primaryComponent.version
          : 'No version available',
        value: filterVersion.id,
        creationAt: filterVersion.creationAt
      })
    }
  }, [data])

  // ADD KEYBOARD SHORTCUT FOR TOGGLE DOWNLOAD MODAL
  const handleKeyDownload = (event) => {
    if (event.altKey && event.key === '3') {
      onToggle()
    }
  }

  // KEYBOARD EVENT LISTNER FOR TOGGLE DOWNLOAD MODAL
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownload)

    return () => {
      window.removeEventListener('keydown', handleKeyDownload)
    }
  }, [])

  const [totalComp, setTotalComp] = useState(0)

  const primaryComp = sbomData && sbomData.sbom.primaryComponent

  const [getAllComps, { data: allComponents }] = useLazyQuery(GetAllComponents)

  const handleEditSbom = () => {
    if (sbomData.sbom.primaryComponent) {
      setSBMOpen()
    } else {
      getAllComps({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalComp,
          field: 'COMPONENTS_UPDATED_AT',
          direction: 'DESC'
        }
      }).then(() => onPrimaryOpen())
    }
  }

  const onSelectComp = () => {
    setActiveProdTab(2)
    setComPageIndex(1)
    setCompSearchInput('')
    setCompScope('')
    setCompEcosystem([])
    setCompLicense([])
    setCompSupplier([])
    setCompType([])
    getCompData({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        field: compField,
        direction: compDirection
      }
    })
  }

  const onFilterVuln = (value) => {
    setActiveProdTab(3)
    setCompPa
    setVulnIndex(1)
    setVulnSearchInput('')
    setVulnComponent([])
    setVulnStatus([])
    setVulnKev('')
    setVulnEpss('')
    setMinVal(0)
    setMaxVal(10000)
    if (value) {
      setVulnSeverity(value)
      getVulnData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          severity: value,
          first: totalRows,
          field: vulnField,
          direction: vulnDirection
        }
      })
    } else {
      setVulnSeverity([])
      getVulnData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          field: vulnField,
          direction: vulnDirection
        }
      })
    }
  }

  return (
    <>
      {productId && sbomId && (
        <>
          <Flex
            direction='column'
            pt={{ base: '120px', md: '74px' }}
            pr={2}
            pl={5}
          >
            {/* Product Info */}
            {sbomData ? (
              <Card mb='6'>
                <CardBody>
                  <Grid
                    width={'100%'}
                    templateColumns='repeat(5, 1fr)'
                    alignItems={'top'}
                    gap={40}
                  >
                    {/* LEFT */}
                    <GridItem colSpan={2}>
                      <Flex
                        direction={'row'}
                        alignItems={'flex-start'}
                        gap={5}
                        width={'100%'}
                      >
                        <Icon
                          as={FaCubes}
                          h={'64px'}
                          w={'64px'}
                          color='blue.300'
                        />
                        <Flex direction={'column'} gap={0.5}>
                          {/* PRODUCT TITLE */}
                          <Stack
                            direction={'column'}
                            spacing={1}
                            alignItems={'left'}
                          >
                            {currentProduct && parts && (
                              <Link
                                to={`/vendor/products?&p=${currentProduct.id}&sbom=${currentProduct.sbomId}`}
                              >
                                <HStack onClick={() => setActiveProdTab(1)}>
                                  <FaAngleLeft size={18} color='#3182CE' />
                                  <Text
                                    fontWeight={'semibold'}
                                    fontSize={18}
                                    color={'blue.500'}
                                    textDecor={'underline'}
                                  >
                                    {currentProduct.name} :{' '}
                                    {currentProduct.version}
                                    <br />
                                  </Text>
                                </HStack>
                              </Link>
                            )}
                            <Text fontWeight={'semibold'} fontSize={25}>
                              {sbomData.sbom.project.name} :{' '}
                              {sbomData.sbom.primaryComponent?.version}
                            </Text>
                          </Stack>
                          {sbomData.sbom.primaryComponent && (
                            <Text fontSize={'sm'} my={0.5}>
                              {sbomData.sbom.primaryComponent.description === 'NONE' ? '' : sbomData.sbom.primaryComponent.description}
                            </Text>
                          )}
                          <Tooltip
                            placement='top'
                            label={getFullDateAndTime(sbomData.sbom.updatedAt)}
                          >
                            <Text fontSize='xs' cursor={'pointer'}>
                              Updated {timeSince(sbomData.sbom.updatedAt)}
                            </Text>
                          </Tooltip>
                          <HStack mt={1} spacing={2} alignItems={'center'}>
                            <Tag
                              w={'fit-content'}
                              size={'sm'}
                              variant='solid'
                              colorScheme='blue'
                            >
                              <Tooltip label='Lifecycle stage' fontSize='md'>
                                <TagLabel textTransform={'capitalize'}>
                                  {sbomData.sbom.lifecycle}
                                </TagLabel>
                              </Tooltip>
                            </Tag>
                            {sbomData.sbom.vulnRunStatus === 'IN_PROGRESS' && (
                              <Tag
                                w={'fit-content'}
                                size={'sm'}
                                variant='solid'
                                colorScheme='blue'
                              >
                                <Tooltip
                                  label='Vulnerability scan in progress'
                                  fontSize='md'
                                >
                                  <TagLabel textTransform={'capitalize'}>
                                    scanning
                                  </TagLabel>
                                </Tooltip>
                              </Tag>
                            )}
                          </HStack>
                          {/* --------------- STATS ------------------- */}
                          <Flex
                            flexDir={'row'}
                            alignItems={'center'}
                            gap={4}
                            mt={12}
                          >
                            {/* components */}
                            <Stack
                              direction={'row'}
                              alignItems={'flex-start'}
                              spacing={2}
                            >
                              <Icon h={4} w={4} color='#777' as={FaCube} />
                              <Box>
                                <Badge
                                  mr={1}
                                  fontSize={'xl'}
                                  fontWeight={'medium'}
                                  bg={'none'}
                                >
                                  {sbomData.sbom.stats.compCount}
                                </Badge>
                                <Text
                                  fontSize={'xs'}
                                  onClick={onSelectComp}
                                  cursor={'pointer'}
                                  _hover={{ textDecoration: 'underline' }}
                                >
                                  Components
                                </Text>
                              </Box>
                            </Stack>
                            {/* license */}
                            <Stack
                              direction={'row'}
                              alignItems={'flex-start'}
                              spacing={2}
                            >
                              <Icon
                                h={'20px'}
                                w={'20px'}
                                color='#777'
                                as={FaBalanceScale}
                              />
                              <Box>
                                <Badge
                                  mr={1}
                                  fontSize={'xl'}
                                  fontWeight={'medium'}
                                  bg={'none'}
                                >
                                  {sbomData.sbom.stats.compLicenseCount}
                                </Badge>
                                <Text fontSize={'xs'}>Licenses</Text>
                              </Box>
                            </Stack>
                            {/* vulnerabilities */}
                            <Stack
                              direction={'row'}
                              alignItems={'flex-start'}
                              spacing={2}
                            >
                              <Icon h={4} w={4} color='#777' as={FaBug} />
                              <Box>
                                <Stack fontWeight={'medium'} direction={'row'}>
                                  <Tooltip label='Critical' placement='top'>
                                    <Badge
                                      fontSize={'xl'}
                                      fontWeight={'medium'}
                                      variant='subtle'
                                      colorScheme='red'
                                      borderRadius='md'
                                      cursor={'pointer'}
                                      onClick={() => onFilterVuln(['critical'])}
                                    >
                                      {sbomData.sbom.stats.vulnStats.critical
                                        ? sbomData.sbom.stats.vulnStats.critical
                                        : 0}
                                    </Badge>
                                  </Tooltip>
                                  <Tooltip label='High' placement='top'>
                                    <Badge
                                      fontSize={'xl'}
                                      fontWeight={'medium'}
                                      variant='subtle'
                                      colorScheme='orange'
                                      borderRadius='md'
                                      cursor={'pointer'}
                                      onClick={() => onFilterVuln(['high'])}
                                    >
                                      {sbomData.sbom.stats.vulnStats.high
                                        ? sbomData.sbom.stats.vulnStats.high
                                        : 0}
                                    </Badge>
                                  </Tooltip>
                                  <Tooltip label='Medium' placement='top'>
                                    <Badge
                                      fontSize={'xl'}
                                      fontWeight={'medium'}
                                      variant='subtle'
                                      colorScheme='yellow'
                                      borderRadius='md'
                                      cursor={'pointer'}
                                      onClick={() => onFilterVuln(['medium'])}
                                    >
                                      {sbomData.sbom.stats.vulnStats.medium
                                        ? sbomData.sbom.stats.vulnStats.medium
                                        : 0}
                                    </Badge>
                                  </Tooltip>
                                  <Tooltip label='Low' placement='top'>
                                    <Badge
                                      fontSize={'xl'}
                                      fontWeight={'medium'}
                                      variant='subtle'
                                      colorScheme='green'
                                      borderRadius='md'
                                      cursor={'pointer'}
                                      onClick={() => onFilterVuln(['low'])}
                                    >
                                      {sbomData.sbom.stats.vulnStats.low
                                        ? sbomData.sbom.stats.vulnStats.low
                                        : 0}
                                    </Badge>
                                  </Tooltip>
                                </Stack>
                                <Text
                                  fontSize={'xs'}
                                  onClick={() => onFilterVuln(null)}
                                  style={{ cursor: 'pointer' }}
                                  _hover={{ textDecoration: 'underline' }}
                                >
                                  Vulnerabilities
                                </Text>
                              </Box>
                            </Stack>
                          </Flex>
                        </Flex>
                      </Flex>
                    </GridItem>

                    {/* RIGHT */}
                    {sbomData && (
                      <GridItem colSpan={3}>
                        <Flex
                          direction={'row'}
                          gap={3}
                          justifyContent='flex-end'
                          ml={'auto'}
                          flexWrap={'wrap'}
                        >
                          {/* CHANGE ENVIRONMENT */}
                          <Flex
                            flexDirection={'row'}
                            alignItems={'center'}
                            gap={2}
                            display={'none'}
                          >
                            <BsBoxFill size={22} color='#718096' />
                            <Select
                              name='environment'
                              id='environment'
                              size='md'
                            >
                              {[
                                'All',
                                'Development',
                                'Release',
                                'Staging',
                                'Settings'
                              ].map((item, index) => (
                                <option value={item} key={index}>
                                  {item}
                                </option>
                              ))}
                            </Select>
                          </Flex>

                          {/* SBOM VERSIONS */}
                          <Flex
                            flexDirection={'row'}
                            alignItems={'center'}
                            gap={2}
                          >
                            <FaLayerGroup size={21} color='#4299E1' />
                            <ReactSelect
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused
                                    ? 'inherit'
                                    : 'inherit',
                                  fontSize: '14px',
                                  padding: '2px 0',
                                  '&:hover': {
                                    borderColor: '#CBD5E0'
                                  }
                                })
                              }}
                              components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null
                              }}
                              value={selectedVersion}
                              onChange={handleSBOMChange}
                              className='react-select'
                              isSearchable={
                                filterVersion && filterVersion.primaryComponent
                                  ? true
                                  : false
                              }
                              name='versions'
                              options={filteredData}
                              noOptionsMessage={() => null}
                            />
                          </Flex>

                          {/* EDIT SBOM */}
                          <Tooltip label='Edit'>
                            <IconButton
                              isDisabled={status === 'signed'}
                              colorScheme='blue'
                              icon={<EditIcon />}
                              onClick={handleEditSbom}
                            ></IconButton>
                          </Tooltip>

                          {/* SIGNED SBOM */}
                          {status === 'signed' ? (
                            <Tooltip label='Signed'>
                              <IconButton
                                colorScheme='blue'
                                icon={<TbSignature size={22} />}
                                onClick={setVerifyOpen}
                              ></IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip label='Unsigned'>
                              <IconButton
                                colorScheme='blue'
                                icon={<TbSignatureOff size={22} />}
                                onClick={setVerifyOpen}
                              ></IconButton>
                            </Tooltip>
                          )}

                          {/* DOWNLOAD SBOM */}
                          <Tooltip label='Download'>
                            <IconButton
                              icon={<FaFileDownload />}
                              onClick={onOpen}
                              size='md'
                              colorScheme='blue'
                            />
                          </Tooltip>

                          {/* DELETE SBOM */}
                          <Tooltip label='Delete'>
                            <IconButton
                              colorScheme='red'
                              icon={<DeleteIcon />}
                              onClick={setDeleteOpen}
                            ></IconButton>
                          </Tooltip>
                        </Flex>
                      </GridItem>
                    )}
                  </Grid>
                </CardBody>
              </Card>
            ) : (
              <Card mb={6}>
                <Flex width={'100%'} gap={4} direction={'row'}>
                  <Skeleton width={'100%'} height='30px' />
                  <Skeleton width={'100%'} height='30px' />
                </Flex>
              </Card>
            )}

            {/* SBOM DETAILS */}
            {sbomData && (
              <SBOMTable
                filteredData={filteredData}
                data={sbomData.sbom}
                refetch={refetch}
                status={status}
                setComponents={setComponents}
                totalComp={totalComp}
                setTotalComp={setTotalComp}
                getVulnData={getVulnData}
                getCompData={getCompData}
                compData={compData}
                error={compError}
                vulnData={vulnData}
                vulnRefetch={vulnRefetch}
                type={
                  selectedProject?.sboms.length > 0 &&
                  selectedProject.sboms[0].format
                }
              />
            )}
          </Flex>

          {/*  COMPONENT PRIMARY MODAL */}
          {isPrimaryOpen && allComponents && (
            <CheckModal
              refetch={refetch}
              shortDesc={'Document has a primary component'}
              checkId={null}
              isOpen={isPrimaryOpen}
              components={allComponents.sbom.components.nodes}
              onClose={onPrimaryClose}
            />
          )}

          {isSBMOpen && sbomData && !customerView && (
            <ComponentDrawer
              isOpen={isSBMOpen}
              onClose={setSBMClose}
              btnRef={btnRef}
              component={primaryComp.name}
              version={primaryComp.version}
              license={primaryComp.licenses}
              group={primaryComp.group}
              type={primaryComp.kind}
              cpes={primaryComp.cpes}
              purl={primaryComp.purl}
              primary={primaryComp.primary}
              internal={primaryComp.internal}
              refetch={refetch}
              shortDesc={null}
              totalRows={null}
            />
          )}

          {isOpen && sbomData && !customerView && (
            <DownloadModal
              initialRef={initialRef}
              finalRef={finalRef}
              isOpen={isOpen}
              onClose={onClose}
              productId={productId}
              productName={sbomData.sbom.project.name}
              version={sbomData.sbom.primaryComponent?.version}
              sbomId={sbomId}
            />
          )}

          {isVerifyOpen && sbomData && (
            <SigningModal
              projectId={productId}
              sbomId={sbomId}
              status={status}
              setStatus={setStatus}
              signedData={signedData}
              setSignedData={setSignedData}
              refetch={refetch}
              isOpen={isVerifyOpen}
              onClose={setVerifyClose}
              sbomData={sbomData}
            />
          )}

          {isCopied && sbomData && (
            <CopyModal
              isOpen={isCopied}
              onClose={onCopiedClose}
              product={sbomData.sbom.project.name}
              version={sbomData.sbom.primaryComponent?.version}
            />
          )}

          {/* delete */}
          <Modal isOpen={isDelete} onClose={setDeleteClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Delete Version</ModalHeader>
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
                <br />
                <Text mt={10}>Are you sure you wish to continue?</Text>
              </ModalBody>
              <ModalFooter>
                <Flex
                  width={'100%'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  gap={4}
                >
                  <Stack>{isLoading && <Spinner color='red.500' />}</Stack>
                  <Stack direction='row' alignItems='center' gap={1}>
                    <Button onClick={setDeleteClose}>No</Button>
                    <Button
                      colorScheme='red'
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Deleting...' : 'Yes'}
                    </Button>
                  </Stack>
                </Flex>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  )
}

export default SBOM

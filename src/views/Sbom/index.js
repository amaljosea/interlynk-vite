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
  chakra,
  Badge
} from '@chakra-ui/react'
import React, { useState, useRef, useEffect } from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMTable from './components/SBOMTable'
import {
  FaBalanceScale,
  FaCubes,
  FaLayerGroup,
  FaFileDownload,
  FaProjectDiagram,
  FaRadiation
} from 'react-icons/fa'
import { TbSignature, TbSignatureOff } from 'react-icons/tb'
import { useLocation, useHistory } from 'react-router-dom'
import { CalendarIcon, DeleteIcon, EditIcon, LockIcon } from '@chakra-ui/icons'
import { timeSince, getFullDateAndTime } from 'utils'
import SigningModal from './components/SigningModal'
import DownloadModal from './components/DownloadModal'
import CopyModal from './components/CopyModal'

import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { GetProductData, GetProject, GetProjectData } from 'graphQL/Queries'
import { sbomDelete } from 'graphQL/Mutation'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import CheckModal from './components/CheckModal'
import { GetAllComponents } from 'graphQL/Queries'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function SBOM() {
  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const btnRef = useRef()

  const location = useLocation()
  const history = useHistory()

  const customerView = location.pathname.startsWith('/customer')

  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const { isOpen, onOpen, onClose, onToggle } = useDisclosure()

  const [status, setStatus] = useState('created')
  const [components, setComponents] = useState([])
  const [signedData, setSignedData] = useState(null)

  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    if (!idRegex.test(productId) || !idRegex.test(sbomId)) {
      window.location.href = `/vendor/products`
    }
  }, [productId, sbomId])

  const { data: allProjects } = useQuery(GetProjectData, {
    variables: {
      first: 10
    }
  })

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

  const { data: sbomData, refetch } = useQuery(GetProductData, {
    variables: {
      projectId: productId,
      sbomId: sbomId
    }
  })

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
          version: project.primaryComponent.version,
          id: project.id,
          updatedAt: project.updatedAt
        })
      }
    })

  // remove duplicates
  const removeDuplicatesAndLatest = (arr) => {
    const uniqueVersions = {}

    for (const item of arr) {
      if (
        !uniqueVersions[item.version] ||
        item.updatedAt > uniqueVersions[item.version].updatedAt
      ) {
        uniqueVersions[item.version] = item
      }
    }

    return Object.values(uniqueVersions)
  }

  const filteredData = uniqVersions
    ? removeDuplicatesAndLatest(uniqVersions)
    : []

  const [selectedVersion, setSelectedVersion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteSbom({
        variables: {
          id: sbomId
        }
      }).then((res) => {
        if (res.data.sbomDelete.errors === null) {
          setIsLoading(false)
          history.push(`/vendor/products`)
        }
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const tab = window.localStorage.getItem('activeProdTab')

  const refetchSBOM = async (id) => {
    try {
      await refetch({
        projectId: productId,
        sbomId: id
      }).then(() => {
        if (customerView) {
          history.push(`/sharelynk?p=${productId}&sbom=${id}`)
        } else {
          history.push(`/vendor/products?p=${productId}&sbom=${id}`)
        }
      })
    } catch (error) {
      console.log(`fetch error`, error)
    }
  }

  const handleSBOMChange = async (e) => {
    setSelectedVersion(e.target.value)
    refetchSBOM(e.target.value)
  }

  const sbomVersions = []

  data &&
    data.project.sboms.map((project) => {
      if (project.primaryComponent === true) {
        sbomVersions.push({
          version: project.primaryComponent.version,
          id: project.primaryComponent.id
        })
      }
    })

  const handleOpen = () => {
    setSelectedVersion(sbomVersions[0].id)
    history.push(`/sharelynk?p=${productId}&sbom=${sbomVersions[0].id}`)
  }

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
          field: 'UPDATED_AT',
          direction: 'DESC'
        }
      }).then(() => onPrimaryOpen())
    }
  }

  return (
    <>
      {productId && sbomId && (
        <>
          <Flex direction='column' pt={{ base: '120px', md: '74px' }} px={2}>
            {/* product info */}
            {sbomData ? (
              <Card mb='6'>
                <CardBody>
                  <Grid
                    width={'100%'}
                    templateColumns='repeat(5, 1fr)'
                    alignItems={'center'}
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
                            direction={'row'}
                            spacing={2}
                            alignItems={'center'}
                          >
                            <Text fontWeight={'semibold'} fontSize={20}>
                              {sbomData.sbom.project.name} :{' '}
                              {sbomData.sbom.primaryComponent?.version}
                            </Text>
                          </Stack>

                          <Text fontSize={'sm'} my={0.5}>
                            A common specification for continous delivery events
                          </Text>
                          <Tooltip
                            placement='top'
                            label={getFullDateAndTime(sbomData.sbom.updatedAt)}
                          >
                            <Text fontSize='sm' cursor={'pointer'}>
                              Last updated at :{' '}
                              {timeSince(sbomData.sbom.updatedAt)}
                            </Text>
                          </Tooltip>

                          {!customerView && (
                            <Tag
                              mt={1}
                              w={'fit-content'}
                              size={'sm'}
                              variant='outline'
                              colorScheme='blue'
                            >
                              <TagLabel textTransform={'capitalize'}>
                                {sbomData.sbom.lifecycle}
                              </TagLabel>
                            </Tag>
                          )}
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
                              <Icon
                                h={4}
                                w={4}
                                color='#777'
                                as={FaProjectDiagram}
                              />
                              <Box>
                                <Badge
                                  mr={1}
                                  fontSize={'md'}
                                  fontWeight={'medium'}
                                >
                                  {sbomData.sbom.stats.compCount}
                                </Badge>
                                <Text fontSize={'xs'}>Components</Text>
                              </Box>
                            </Stack>
                            {/* vulnerabilities */}
                            <Stack
                              direction={'row'}
                              alignItems={'flex-start'}
                              spacing={2}
                            >
                              <Icon h={4} w={4} color='#777' as={FaRadiation} />
                              <Box>
                                <Stack fontWeight={'medium'} direction={'row'}>
                                  <Badge
                                    mr={1}
                                    fontSize={'md'}
                                    fontWeight={'medium'}
                                    variant='subtle'
                                    colorScheme='red'
                                  >
                                    {sbomData.sbom.stats.vulnStats.critical
                                      ? sbomData.sbom.stats.vulnStats.critical
                                      : 0}
                                  </Badge>
                                  <Badge
                                    mr={1}
                                    fontSize={'md'}
                                    fontWeight={'medium'}
                                    variant='subtle'
                                    colorScheme='orange'
                                  >
                                    {sbomData.sbom.stats.vulnStats.high
                                      ? sbomData.sbom.stats.vulnStats.high
                                      : 0}
                                  </Badge>
                                  <Badge
                                    mr={1}
                                    fontSize={'md'}
                                    fontWeight={'medium'}
                                    variant='subtle'
                                    colorScheme='yellow'
                                  >
                                    {sbomData.sbom.stats.vulnStats.medium
                                      ? sbomData.sbom.stats.vulnStats.medium
                                      : 0}
                                  </Badge>
                                  <Badge
                                    mr={1}
                                    fontSize={'md'}
                                    fontWeight={'medium'}
                                    variant='subtle'
                                    colorScheme='green'
                                  >
                                    {sbomData.sbom.stats.vulnStats.low
                                      ? sbomData.sbom.stats.vulnStats.low
                                      : 0}
                                  </Badge>
                                </Stack>
                                <Text fontSize={'xs'}>Vulnerabilities</Text>
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
                                  fontSize={'md'}
                                  fontWeight={'medium'}
                                >
                                  {sbomData.sbom.stats.compLicenseCount}
                                </Badge>
                                <Text fontSize={'xs'}>Licenses</Text>
                              </Box>
                            </Stack>
                            {/* PURL */}
                            <Stack
                              direction={'row'}
                              alignItems={'flex-start'}
                              spacing={2}
                            >
                              <Icon
                                h={4}
                                w={4}
                                color='#777'
                                as={CalendarIcon}
                              />
                              <Box>
                                <Badge
                                  mr={1}
                                  fontSize={'md'}
                                  fontWeight={'medium'}
                                >
                                  {sbomData.sbom.stats.compPurlCount}
                                </Badge>
                                <Text fontSize={'xs'}>PURL</Text>
                              </Box>
                            </Stack>
                            {/* CPE */}
                            <Stack
                              direction={'row'}
                              alignItems={'flex-start'}
                              spacing={2}
                            >
                              <Icon h={4} w={4} color='#777' as={LockIcon} />
                              <Box>
                                <Badge
                                  mr={1}
                                  fontSize={'md'}
                                  fontWeight={'medium'}
                                >
                                  {sbomData.sbom.stats.compCpeCount}
                                </Badge>
                                <Text fontSize={'xs'}>CPE</Text>
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
                          gap={2}
                          justifyContent='flex-end'
                          ml={'auto'}
                        >
                          {/* CHANGE SBOM VERSION */}
                          <Flex
                            flexDirection={'row'}
                            alignItems={'center'}
                            gap={2}
                          >
                            <FaLayerGroup size={18} color='darkgray' />
                            <Select
                              id='version'
                              value={selectedVersion}
                              onChange={handleSBOMChange}
                              size='md'
                              color='gray.500'
                            >
                              {filteredData && filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                  <option
                                    key={index}
                                    value={item.id}
                                    name={item.version}
                                  >
                                    {item.version}
                                  </option>
                                ))
                              ) : (
                                <option value=''>-- --</option>
                              )}
                            </Select>
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
                          {/*
                          <Tooltip label='Copy'>
                            <IconButton
                              icon={<FaCopy />}
                              onClick={onCopiedOpen}
                              size='md'
                              colorScheme='blue'
                            />
                          </Tooltip>
 */}
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
                setTotalComp={setTotalComp}
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

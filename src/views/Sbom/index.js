// Chakra imports
import {
  Flex,
  Stack,
  Spacer,
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
  Skeleton
} from '@chakra-ui/react'
import React, { useState, useRef, useEffect } from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMTable from './components/SBOMTable'
import SBOMStatistics from './components/SBOMStatistics'
import {
  FaBalanceScale,
  FaCubes,
  FaLayerGroup,
  FaFileDownload,
  FaCopy,
  FaProjectDiagram
} from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import { CalendarIcon, DeleteIcon, EditIcon, LockIcon } from '@chakra-ui/icons'
import { useMutation, useQuery } from '@apollo/client'
import { GetProject } from 'graphQL/Queries'
import { timeSince } from 'utils'
import SigningModal from './components/SigningModal'
import DownloadModal from './components/DownloadModal'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import { sbomDelete } from 'graphQL/Mutation'

import { TbSignature, TbSignatureOff } from 'react-icons/tb'
import CopyModal from './components/CopyModal'
import { GetProjectData } from 'graphQL/Queries'

import { getFullDateAndTime } from 'utils'
import { GetProductData } from 'graphQL/Queries'

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
  const [signedData, setSignedData] = useState(null)

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

  const { data: sbomData, refetch } = useQuery(GetProductData, {
    variables: {
      projectId: productId,
      sbomId: sbomId
    }
  })

  // useEffect(() => {
  //   if (sbomData) {
  //     console.log(`sbomData`, sbomData.sbom)
  //   }
  // }, [sbomData])

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

  const handleDelete = async () => {
    try {
      await deleteSbom({
        variables: {
          id: sbomId
        }
      }).then(() => history.push(`/vendor/products`))
      // .finally(() => window.location.reload())
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const refetchSBOM = async (id) => {
    try {
      await refetch({
        projectId: productId,
        sbomId: id
      }).then(() => {
        if (customerView) {
          history.push(`/sharelynk?p=${productId}&sbom=${id}`)
        } else {
          history.push(`/vendor/products?tab=general&p=${productId}&sbom=${id}`)
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

  return (
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
                    <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
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
                          Last updated at : {timeSince(sbomData.sbom.updatedAt)}
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
                            <Text fontWeight={'medium'} fontSize={'md'}>
                              {sbomData.sbom.stats.compCount}
                            </Text>
                            <Text fontSize={'xs'}>Components</Text>
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
                            <Text fontWeight={'medium'} fontSize={'md'}>
                              {sbomData.sbom.stats.compLicenseCount}
                            </Text>
                            <Text fontSize={'xs'}>Licenses</Text>
                          </Box>
                        </Stack>
                        {/* PURL */}
                        <Stack
                          direction={'row'}
                          alignItems={'flex-start'}
                          spacing={2}
                        >
                          <Icon h={4} w={4} color='#777' as={CalendarIcon} />
                          <Box>
                            <Text fontWeight={'medium'} fontSize={'md'}>
                              {sbomData.sbom.stats.compPurlCount}
                            </Text>
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
                            <Text fontWeight={'medium'} fontSize={'md'}>
                              {sbomData.sbom.stats.compCpeCount}
                            </Text>
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
                      <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
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
                          onClick={setSBMOpen}
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

                      {/* COPY SBOM */}
                      <Tooltip label='Copy'>
                        <IconButton
                          icon={<FaCopy />}
                          onClick={onCopiedOpen}
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
        <SBOMTable
          status={status}
          sbomId={sbomId}
          productId={productId}
          data={sbomData && sbomData}
          lifecycle={sbomData && sbomData.sbom.lifecycle}
          refetch={refetch}
          type={
            selectedProject?.sboms.length > 0 && selectedProject.sboms[0].format
          }
        />
      </Flex>

      {isSBMOpen && sbomData && (
        <ProductSbomDrawer
          isOpen={isSBMOpen}
          onClose={setSBMClose}
          btnRef={btnRef}
          projectId={productId}
          name={sbomData.sbom.project.name}
          refetch={refetch}
          sbomData={sbomData.sbom}
          type={
            selectedProject?.sboms.length > 0 && selectedProject.sboms[0].format
          }
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
          <ModalHeader>Delete ?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize={'lg'}>Deleting this version will : </Text>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[
                'Remove this version and its SBOMs from the product list',
                'Remove access to this version on connected Share Lynks'
              ].map((item, index) => (
                <Text key={index} fontSize={'sm'}>
                  {item}
                </Text>
              ))}
            </Flex>
            <br />
            <Text mt={4} fontSize={'sm'}>
              Are you sure you want to continue with the deletion of this
              version?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={setDeleteClose}>
              No
            </Button>
            <Button colorScheme='red' onClick={handleDelete}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SBOM

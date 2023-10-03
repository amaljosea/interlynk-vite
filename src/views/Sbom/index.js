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
  Code,
  Table,
  Thead,
  Tr,
  Th,
  Box,
  Tbody,
  Td,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter
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
  FaCopy
} from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { useMutation, useQuery } from '@apollo/client'
import { GetSBOM, GetProject } from 'graphQL/Queries'
import { timeSince } from 'utils'
import SigningModal from './components/SigningModal'
import DownloadModal from './components/DownloadModal'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import { sbomDelete } from 'graphQL/Mutation'

import { TbSignature, TbSignatureOff } from 'react-icons/tb'
import CopyModal from './components/CopyModal'
import { GetProjectData } from 'graphQL/Queries'

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
  const [pageIndex, setPageIndex] = useState(1)

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

  const { data: sbomData, refetch } = useQuery(GetSBOM, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      field: 'NAME',
      direction: 'ASC'
    }
  })

  // useEffect(() => {
  //   if (sbomData) {
  //     console.log(`sbomData`, sbomData.sbom)
  //   }
  // }, [sbomData])

  const handlePreviousPage = () => {
    setPageIndex((prev) => prev !== 0 && prev - 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: undefined,
      last: 10,
      before: sbomData.sbom.components.pageInfo.startCursor,
      after: ''
    })
  }

  const handleNextPage = () => {
    setPageIndex(
      (prev) =>
        prev < Math.ceil(sbomData?.sbom.components.totalCount) && prev + 1
    )
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      last: undefined,
      after: sbomData.sbom.components.pageInfo.endCursor,
      before: ''
    })
  }

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

  // console.log(`filteredData`, filteredData)

  const totalLicenses =
    sbomData &&
    sbomData.sbom.components.nodes.filter((item) => item.licenses.length > 0)

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
        productId: productId,
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

  const captions = ['Product', 'versions', 'Description', 'Updated At']

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
    if (event.altKey && event.key === '/') {
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

  if (!sbomId) {
    return (
      <Flex direction='column' pt={{ base: '120px', md: '74px' }} px={2}>
        <Card mb='6'>
          <CardBody width={'100%'}>
            {data ? (
              <Table mt={4} width={'100%'}>
                <Thead>
                  <Tr my='.8rem'>
                    {captions.map((caption, idx) => {
                      return (
                        <Th color='gray.800' key={idx} pl={0}>
                          <Box>{caption}</Box>
                        </Th>
                      )
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td pl={0}>
                      <Text
                        color={'blue.500'}
                        minWidth='100%'
                        onClick={handleOpen}
                        cursor={'pointer'}
                      >
                        {data.project.name}
                      </Text>
                    </Td>
                    <Td pl={0}>{data.project.sboms.length}</Td>
                    <Td pl={0}>{data.project.description}</Td>
                    <Td pl={0}>{timeSince(data.project.updatedAt)}</Td>
                  </Tr>
                </Tbody>
              </Table>
            ) : (
              <Flex
                width={'100%'}
                alignItems={'cener'}
                justifyContent={'center'}
                py={6}
              >
                Get a valid sharelynk from supplier
              </Flex>
            )}
          </CardBody>
        </Card>
      </Flex>
    )
  } else {
    return (
      <>
        <Flex direction='column' pt={{ base: '120px', md: '74px' }} px={2}>
          {/* product info */}
          <Card mb='6'>
            <CardBody>
              <Grid
                width={'100%'}
                templateColumns='repeat(5, 1fr)'
                alignItems={'center'}
              >
                {/* LEFT */}
                <GridItem colSpan={2}>
                  {sbomData ? (
                    <Flex
                      direction={'row'}
                      alignItems={'center'}
                      gap={5}
                      width={'100%'}
                    >
                      <Icon
                        as={FaCubes}
                        h={'64px'}
                        w={'64px'}
                        color='blue.300'
                      />
                      <Flex direction={'column'} gap={1}>
                        <Text fontWeight={'semibold'} fontSize={18}>
                          {sbomData.sbom.project.name} :{' '}
                          {sbomData.sbom.primaryComponent?.version}:{' '}
                        </Text>
                        <Text fontSize='xs' cursor={'pointer'}>
                          Last updated at : {timeSince(sbomData.sbom.updatedAt)}
                        </Text>
                        <Flex gap={2} alignItems={'center'}>
                          {!customerView && (
                            <Tag
                              size={'sm'}
                              variant='outline'
                              colorScheme='blue'
                            >
                              <TagLabel textTransform={'capitalize'}>
                                {/* {sbomData.sbom.lifecycle} */}
                                {status}
                              </TagLabel>
                            </Tag>
                          )}
                        </Flex>
                      </Flex>
                    </Flex>
                  ) : (
                    <Text>Loading...</Text>
                  )}
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
          {/* stats */}
          <Flex direction='row' gap='2'>
            <SBOMStatistics
              icon={<Icon h={'24px'} w={'24px'} color='white' as={FaCubes} />}
              title={'Components'}
              description={'Components included in SBOM'}
              amount={sbomData ? sbomData.sbom.stats.compCount : 'Loading...'}
            />
            <Spacer />
            <SBOMStatistics
              icon={
                <Icon h={'24px'} w={'24px'} color='white' as={FaBalanceScale} />
              }
              title={'Licenses'}
              description={'Unique licenses included in SBOM'}
              amount={
                sbomData ? sbomData.sbom.stats.compLicenseCount : 'Loading...'
              }
            />
          </Flex>
          {/* sbom details */}
          {sbomData && (
            <SBOMTable
              title={'SBOM'}
              captions={[
                'Component',
                'Version',
                'PURL',
                'Licenses',
                'Updated At',
                'Actions'
              ]}
              data={sbomData.sbom}
              refetch={refetch}
              pageIndex={pageIndex}
              versionName={sbomData.sbom.primaryComponent?.version}
              handlePreviousPage={handlePreviousPage}
              handleNextPage={handleNextPage}
              status={status}
              productId={productId}
              type={
                selectedProject?.sboms.length > 0 &&
                selectedProject.sboms[0].format
              }
            />
          )}
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
              selectedProject?.sboms.length > 0 &&
              selectedProject.sboms[0].format
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
}

export default SBOM

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
import React, { useState, useRef, useContext, useEffect } from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMTable from './components/SBOMTable'
import SBOMStatistics from './components/SBOMStatistics'
import {
  FaBalanceScale,
  FaCubes,
  FaLayerGroup,
  FaFileDownload
} from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { useMutation, useQuery } from '@apollo/client'
import { GetSBOM, GetProject } from 'graphQL/Queries'
import { timeSince } from 'utils'
import { BsFillPatchExclamationFill } from 'react-icons/bs'
import SigningModal from './components/SigningModal'
import { MdVerified } from 'react-icons/md'
import DownloadModal from './components/DownloadModal'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import { sbomDelete } from 'graphQL/Mutation'

import { TbSignature, TbSignatureOff } from 'react-icons/tb'

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

  const { isOpen, onOpen, onClose } = useDisclosure()

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

  const { data: sbomData, refetch } = useQuery(GetSBOM, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: 10
    }
  })

  const handlePreviousPage = () => {
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
      id: productId,
      first: 10
    }
  })

  const [deleteSbom] = useMutation(sbomDelete)

  // useEffect(() => {
  //   if (sbomData) {
  //     console.log(`SBOM Data`, sbomData)
  //     window.localStorage.setItem('product', sbomData.sbom.project.name)
  //   }
  // }, [sbomData])

  const [primaryData, setPrimaryData] = useState(null)

  useEffect(() => {
    if (data && data.project.sboms.length > 0) {
      console.log(`data`, data)
      const sbomV = data.project.sboms.find((sbom) => sbom.id === sbomId)
      const validData = sbomV.components.nodes.find(
        (item) => item.primary === true
      )
      setPrimaryData(validData)
    }
  }, [data])

  const uniqVersions = []

  data &&
    data.project.sboms.map((project) => {
      project.components.nodes.map((sbom) => {
        if (sbom.primary === true) {
          uniqVersions.push({
            version: sbom.version,
            id: project.id
          })
        }
      })
    })

  const allSboms = []

  data && data.project.sboms.map((sbom) => allSboms.push(sbom))

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
      project.components.nodes.map((sbom) => {
        if (sbom.primary === true) {
          sbomVersions.push({
            version: sbom.version,
            id: project.id
          })
        }
      })
    })

  const handleOpen = () => {
    setSelectedVersion(sbomVersions[0].id)
    history.push(`/sharelynk?p=${productId}&sbom=${sbomVersions[0].id}`)
  }

  if (!sbomId) {
    return (
      <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
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
        <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
          {/* product info */}
          <Card mb='6'>
            <CardBody>
              <Grid
                width={'100%'}
                templateColumns='repeat(5, 1fr)'
                alignItems={'center'}
              >
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
                          {sbomData.sbom.project.name} : {primaryData?.version}
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
                                {sbomData.sbom.lifecycle}
                              </TagLabel>
                            </Tag>
                          )}

                          {/* {sbomData.sbom.lifecycle !== 'signed' ? (
                            <BsFillPatchExclamationFill
                              size={18}
                              color='tomato'
                              cursor={'pointer'}
                            />
                          ) : (
                            <MdVerified
                              size={18}
                              color='dodgerblue'
                              cursor={'pointer'}
                            />
                          )} */}
                        </Flex>
                      </Flex>
                    </Flex>
                  ) : (
                    <Text>Loading...</Text>
                  )}
                </GridItem>
                {sbomData && (
                  <GridItem colSpan={3}>
                    <Flex
                      direction={'row'}
                      gap={2}
                      justifyContent='flex-end'
                      ml={'auto'}
                    >
                      <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                        <FaLayerGroup size={18} color='darkgray' />
                        <Select
                          id='version'
                          value={selectedVersion}
                          onChange={handleSBOMChange}
                          size='md'
                          color='gray.500'
                          textTransform={'lowercase'}
                        >
                          {uniqVersions.length > 0 &&
                            uniqVersions.map((item, index) => (
                              <option
                                key={index}
                                value={item.id}
                                name={item.version}
                              >
                                {item.version}
                              </option>
                            ))}
                        </Select>
                      </Flex>

                      <Tooltip label='Download'>
                        <IconButton
                          icon={<FaFileDownload />}
                          onClick={onOpen}
                          size='md'
                          colorScheme='blue'
                        />
                      </Tooltip>

                      {sbomData.sbom.lifecycle === 'signed' ? (
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

                      <Tooltip label='Edit'>
                        <IconButton
                          isDisabled={sbomData.sbom.lifecycle === 'signed'}
                          colorScheme='blue'
                          icon={<EditIcon />}
                          onClick={setSBMOpen}
                        ></IconButton>
                      </Tooltip>

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
              amount={sbomData ? sbomData.sbom.components.length : 'Loading...'}
            />
            <Spacer />
            <SBOMStatistics
              icon={
                <Icon h={'24px'} w={'24px'} color='white' as={FaBalanceScale} />
              }
              title={'Licenses'}
              description={'Unique licenses included in SBOM'}
              amount={totalLicenses ? totalLicenses.length : 'Loading...'}
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
                'Supplier',
                'Licenses',
                'Updated At',
                'Actions'
              ]}
              data={sbomData.sbom}
              refetch={refetch}
              versionName={primaryData?.version}
              handlePreviousPage={handlePreviousPage}
              handleNextPage={handleNextPage}
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
            sbomData={sbomData}
          />
        )}

        {isOpen && (
          <DownloadModal
            initialRef={initialRef}
            finalRef={finalRef}
            isOpen={isOpen}
            onClose={onClose}
            productId={productId}
            sbomId={sbomId}
          />
        )}

        {isVerifyOpen && sbomData && (
          <SigningModal
            projectId={productId}
            sbomId={sbomId}
            refetch={refetch}
            isOpen={isVerifyOpen}
            onClose={setVerifyClose}
            sbomData={sbomData}
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

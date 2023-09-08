// Chakra imports
import {
  Flex,
  Stack,
  Heading,
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
  Td
} from '@chakra-ui/react'
import React, { useState, useEffect, useRef, useContext } from 'react'
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
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'
import ShareLynkDrawer from 'components/Drawer/ShareLynkDrawer'
import GlobalContext from 'context/GlobalContext'
import { useMutation, useQuery } from '@apollo/client'
import { GetSBOM, GetProject } from 'graphQL/Queries'
import { timeSince } from 'utils'
import { BsFillPatchExclamationFill } from 'react-icons/bs'
import SigningModal from './components/SigningModal'
import { MdVerified } from 'react-icons/md'
import DownloadModal from './components/DownloadModal'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import { sbomDelete } from 'graphQL/Mutation'

function SBOM() {
  const { productVersionsData } = useContext(GlobalContext)

  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const btnRef = useRef()

  const location = useLocation()
  const history = useHistory()

  const customerView = location.pathname.startsWith('/sharelynk')

  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [status, setStatus] = useState('Unsigned')

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

  const { data: sbomData, refetch } = useQuery(GetSBOM, {
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

  // useEffect(() => {
  //   if (sbomData) {
  //     console.log(`SBOM Data`, sbomData)
  //     window.localStorage.setItem('product', sbomData.sbom.project.name)
  //   }
  // }, [sbomData])

  // useEffect(() => {
  //   if (data) {
  //     console.log(`data`, data)
  //   }
  // }, [data])

  const uniqProjects = []
  const uniqVersions = []

  productVersionsData.map((project) => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  })

  data &&
    data.project.sboms.map((project) => {
      uniqVersions.push({
        version: project.spec,
        id: project.id
      })
    })

  // console.log(`uniqVersions`, uniqVersions)

  const allSboms = []

  data && data.project.sboms.map((sbom) => allSboms.push(sbom))

  // console.log(`SBOM`, allSboms)

  const totalLicenses =
    sbomData &&
    sbomData.sbom.components.filter((item) => item.licenses.length > 0)

  // console.log(`totalLicenses`, totalLicenses)

  const validSBOMS =
    sbomData && sbomData.sbom.components.find((com) => com.primary === true)

  // const validSbom = validSBOMS

  // console.log(`validSBOMS`, validSBOMS)

  const invalidSBOMS =
    sbomData &&
    sbomData.sbom.components.filter((item) => item.primary === false)

  // console.log(`invalidSBOMS`, invalidSBOMS)

  const [selectedVersion, setSelectedVersion] = useState('')

  const handleDelete = async () => {
    try {
      await deleteSbom({
        variables: {
          id: sbomId
        }
      })
        .then(() => history.push(`/vendor/products`))
        .finally(() => window.location.reload())
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
      project.components.map((sbom) => {
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
                          {sbomData.sbom.project.name} :{' '}
                          {validSBOMS
                            ? validSBOMS.version
                            : invalidSBOMS &&
                              invalidSBOMS.length > 0 &&
                              invalidSBOMS[0].version}
                        </Text>
                        {validSBOMS === undefined && (
                          <Code color={'red.400'} fontSize={'xs'}>
                            Primary component not exists. <br /> Please create
                            or update any component as primary before proceed
                          </Code>
                        )}
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
                              <TagLabel>{sbomData.sbom.lifecycle}</TagLabel>
                            </Tag>
                          )}

                          {status === 'Unsigned' ? (
                            <BsFillPatchExclamationFill
                              size={18}
                              color='tomato'
                              onClick={setVerifyOpen}
                              cursor={'pointer'}
                            />
                          ) : (
                            <MdVerified
                              size={18}
                              color='dodgerblue'
                              cursor={'pointer'}
                            />
                          )}
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
                      gap={4}
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

                      <IconButton
                        aria-label='Download SBOM'
                        icon={<FaFileDownload />}
                        onClick={onOpen}
                        size='md'
                        colorScheme='blue'
                      />

                      <Stack direction='row' spacing={4}>
                        <Button
                          leftIcon={<EditIcon />}
                          colorScheme='blue'
                          variant='solid'
                          size='md'
                          onClick={setSBMOpen}
                        >
                          Edit
                        </Button>
                        <Button
                          leftIcon={<DeleteIcon />}
                          colorScheme='red'
                          size='md'
                          variant='outline'
                          onClick={handleDelete}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Flex>
                  </GridItem>
                )}
              </Grid>
            </CardBody>
          </Card>
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
                ''
              ]}
              data={sbomData.sbom}
              refetch={refetch}
              versionName={validSBOMS?.version}
              status={status}
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

        {isVerifyOpen && (
          <SigningModal
            isOpen={isVerifyOpen}
            onClose={setVerifyClose}
            setStatus={setStatus}
          />
        )}
      </>
    )
  }
}

export default SBOM

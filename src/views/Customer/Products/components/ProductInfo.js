// Chakra imports
import {
  Flex,
  Heading,
  Spacer,
  Icon,
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
import {
  FaBalanceScale,
  FaCubes,
  FaLayerGroup,
  FaFileDownload
} from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import { useQuery } from '@apollo/client'
import { GetSignedSBOM, GetProjectInfo } from 'graphQL/Queries'
import { timeSince } from 'utils'
import { BsFillPatchExclamationFill } from 'react-icons/bs'
import { MdVerified } from 'react-icons/md'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import SBOMStatistics from 'views/Sbom/components/SBOMStatistics'
import SBOMTable from 'views/Sbom/components/SBOMTable'
import DownloadModal from 'views/Sbom/components/DownloadModal'
import Cookies from 'js-cookie'

function ProductInfo() {
  const { productVersionsData } = useContext(GlobalContext)

  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const btnRef = useRef()

  const location = useLocation()
  const history = useHistory()

  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const signedParams = Cookies.get(`signedParamId`)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [status, setStatus] = useState('Unsigned')

  const { data: sbomData, refetch } = useQuery(GetSignedSBOM, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      signedParams: signedParams
    }
  })

  const { data } = useQuery(GetProjectInfo, {
    variables: {
      projectId: productId,
      signedParams: signedParams
    }
  })

  useEffect(() => {
    if (sbomData) {
      // console.log(`SBOM Data`, sbomData)
      window.localStorage.setItem('product', sbomData.sbom.project.name)
    }
  }, [sbomData])

  useEffect(() => {
    if (data) {
      // console.log(`data`, data)
      data.project.sboms.map((sbom) => console.log(`SBOM`, sbom))
    }
  }, [data])

  const uniqProjects = []
  const uniqVersions = []

  productVersionsData.map((project) => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  })

  data &&
    data.project.sboms.map((project) => {
      project.components.map((sbom) => {
        if (sbom.primary === true) {
          uniqVersions.push({
            version: sbom.version,
            id: project.id
          })
        }
      })
    })

  console.log(`uniqVersions`, uniqVersions)

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

  const refetchSBOM = async (id) => {
    try {
      await refetch({
        signedParams: signedParams,
        productId: productId,
        sbomId: id
      }).then(() => {
        history.push(`/customer/products?p=${productId}&sbom=${id}`)
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
                    <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
                    <Flex direction={'column'} gap={1}>
                      <Heading as='h3' size='md' noOfLines={1}>
                        <Flex
                          alignItems={'center'}
                          flexDirection={'row'}
                          gap={3}
                        >
                          {sbomData.sbom.project.name} :{' '}
                          {validSBOMS
                            ? validSBOMS.version
                            : invalidSBOMS &&
                              invalidSBOMS.length > 0 &&
                              invalidSBOMS[0].version}
                        </Flex>
                      </Heading>
                      {validSBOMS === undefined && (
                        <Code color={'red.400'} fontSize={'xs'}>
                          Primary component not exists. <br /> Please update any
                          component as primary before proceed
                        </Code>
                      )}
                      <Text fontSize='xs' cursor={'pointer'}>
                        Last updated at : {timeSince(sbomData.sbom.updatedAt)}
                      </Text>
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
                        width={'150px'}
                        color='gray.500'
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

                    {/* <IconButton
                      aria-label='Download SBOM'
                      icon={<FaFileDownload />}
                      onClick={onOpen}
                      colorScheme='blue'
                    /> */}
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
    </>
  )
}

export default ProductInfo

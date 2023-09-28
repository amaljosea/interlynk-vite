// Chakra imports
import {
  Flex,
  Spacer,
  Icon,
  Grid,
  GridItem,
  Text,
  Select,
  useDisclosure,
  IconButton
} from '@chakra-ui/react'
import React, { useState, useEffect, useRef, useContext } from 'react'
import { FaBalanceScale, FaCubes, FaFileDownload, FaLayerGroup } from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import { useQuery } from '@apollo/client'
import { GetSignedSBOM, GetProjectInfo } from 'graphQL/Queries'
import { timeSince } from 'utils'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import SBOMStatistics from 'views/Sbom/components/SBOMStatistics'
import SBOMTable from 'views/Sbom/components/SBOMTable'
import DownloadModal from 'views/Sbom/components/DownloadModal'
import Cookies from 'js-cookie'

function ProductInfo() {
  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const location = useLocation()
  const history = useHistory()

  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const signedParams = Cookies.get(`signedParamId`)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: sbomData, refetch } = useQuery(GetSignedSBOM, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      signedParams: signedParams,
      first: 10
    }
  })

  const handlePreviousPage = () => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      signedParams: signedParams,
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
      signedParams: signedParams,
      first: 10,
      last: undefined,
      after: sbomData.sbom.components.pageInfo.endCursor,
      before: ''
    })
  }

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

  const [primaryData, setPrimaryData] = useState(null)

  useEffect(() => {
    if (data && data.project.sboms.length > 0) {
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
            id: project.id,
            updatedAt: project.updatedAt
          })
        }
      })
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

  const filteredData =
    uniqVersions.length > 0 ? removeDuplicatesAndLatest(uniqVersions) : []

  // console.log(`filteredData`, filteredData)

  const totalLicenses =
    sbomData &&
    sbomData.sbom.components.nodes.filter((item) => item.licenses.length > 0)

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
      project.components.nodes.map((sbom) => {
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
                      <Text fontWeight={'semibold'} fontSize={18}>
                        <Flex
                          alignItems={'center'}
                          flexDirection={'row'}
                          gap={3}
                        >
                          {sbomData.sbom.project.name} : {primaryData?.version}
                        </Flex>
                      </Text>
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
                        color='gray.500'
                      >
                        {filteredData &&
                          filteredData.length > 0 &&
                          filteredData.map((item, index) => (
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
            amount={
              sbomData ? sbomData.sbom.components.nodes.length : 'Loading...'
            }
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

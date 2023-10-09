// Chakra imports
import {
  Flex,
  Icon,
  Grid,
  GridItem,
  Text,
  Select,
  useDisclosure,
  Stack,
  Box,
  Tooltip
} from '@chakra-ui/react'
import React, { useState, useEffect, useRef } from 'react'
import {
  FaBalanceScale,
  FaCubes,
  FaLayerGroup,
  FaProjectDiagram
} from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GetSignedSBOM, GetProjectInfo } from 'graphQL/Queries'
import { timeSince } from 'utils'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import SBOMTable from 'views/Sbom/components/SBOMTable'
import DownloadModal from 'views/Sbom/components/DownloadModal'
import Cookies from 'js-cookie'
import { CalendarIcon, LockIcon } from '@chakra-ui/icons'
import { getFullDateAndTime } from 'utils'

function ProductInfo() {
  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const location = useLocation()
  const history = useHistory()

  const queryParams = new URLSearchParams(location.search)

  const customerView = location.pathname.startsWith('/customer')

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const signedParams = Cookies.get(`signedParamId`)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [pageIndex, setPageIndex] = useState(1)

  const { data: sbomData, refetch } = useQuery(GetSignedSBOM, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      signedParams: signedParams,
      first: 10,
      field: 'NAME',
      direction: 'ASC'
    }
  })

  const handlePreviousPage = () => {
    setPageIndex((prev) => prev !== 0 && prev - 1)
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
    setPageIndex(
      (prev) =>
        prev < Math.ceil(sbomData?.sbom.components.totalCount) && prev + 1
    )
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

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '70px' }} px={3}>
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
                    alignItems={'flex-start'}
                    gap={5}
                    width={'100%'}
                  >
                    <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
                    <Flex direction={'column'} gap={0.5}>
                      {/* PRODUCT TITLE */}
                      <Text fontWeight={'semibold'} fontSize={20}>
                        {sbomData.sbom.project.name} :{' '}
                        {sbomData.sbom.primaryComponent?.version}
                      </Text>
                      <Text fontSize={'sm'}>
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
            versionName={sbomData.sbom.primaryComponent.version}
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

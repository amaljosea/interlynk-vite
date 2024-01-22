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
  Tooltip,
  Badge,
  Tag,
  TagLabel,
  IconButton,
  Skeleton
} from '@chakra-ui/react'
import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  FaBalanceScale,
  FaBug,
  FaCube,
  FaCubes,
  FaFileDownload,
  FaLayerGroup
} from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GetSignedSBOM, GetProjectInfo } from 'graphQL/Queries'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import DownloadModal from 'views/Sbom/components/DownloadModal'
import Cookies from 'js-cookie'
import { getFullDateAndTime, normalizeSBOMVersion, timeSince } from 'utils'
import { GetSignedProductData } from 'graphQL/Queries'
import { GetSignedProjects } from 'graphQL/Queries'
import SignedSbomTable from './SBOMTable'
import { GetSignedVulnData } from 'graphQL/Queries'
import GlobalContext from 'context/GlobalContext'

function ProductInfo() {
  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()

  const queryParams = new URLSearchParams(location.search)
  const {
    setSignedVulnSeverity,
    setSignedActiveTab,
    totalRows,
    signedVulnField,
    signedVulnDirection
  } = useContext(GlobalContext)

  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const signedParams = Cookies.get(`signedParamId`)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: sbomData, refetch } = useQuery(GetSignedProductData, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      signedParams: signedParams
    }
  })

  const { data: allProjects } = useQuery(GetSignedProjects)

  const { data } = useQuery(GetProjectInfo, {
    variables: {
      projectId: productId,
      signedParams: signedParams
    }
  })

  // GET VULN DATA
  const [getVulnData, { data: vulnData }] = useLazyQuery(GetSignedVulnData)

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

  useEffect(() => {
    setSelectedVersion(sbomId)
  }, [sbomId])

  const [selectedVersion, setSelectedVersion] = useState('')

  const refetchSBOM = async (id) => {
    try {
      await refetch({
        signedParams: signedParams,
        productId: productId,
        sbomId: id
      }).then(() => {
        navigate(`/customer/products?p=${productId}&sbom=${id}`)
      })
    } catch (error) {
      console.log(`fetch error`, error)
    }
  }

  const handleSBOMChange = async (e) => {
    setSelectedVersion(e.target.value)
    refetchSBOM(e.target.value)
  }

  const selectedProject =
    allProjects &&
    allProjects.projects.nodes.find((item) => item.id === productId)

  const onFilterSev = (value) => {
    setSignedActiveTab(2)
    setSignedVulnSeverity(value)
    getVulnData({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        signedParams: signedParams,
        severity: value,
        first: totalRows,
        field: signedVulnField,
        direction: signedVulnDirection
      }
    })
  }

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '70px' }} px={3}>
        {/* Product Info */}
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
                      {/* -------------- PRODUCT TITLE ------------------- */}
                      <Text fontWeight={'semibold'} fontSize={20}>
                        {sbomData.sbom.project.name} :{' '}
                        {normalizeSBOMVersion(sbomData.sbom)}
                      </Text>
                      <Text fontSize={'sm'}>
                        A common specification for continous delivery events
                      </Text>
                      <Tooltip
                        placement='top'
                        label={getFullDateAndTime(sbomData.sbom.updatedAt)}
                      >
                        <Text fontSize='sm' cursor={'pointer'}>
                          Updated {timeSince(sbomData.sbom.updatedAt)}
                        </Text>
                      </Tooltip>
                      {/* ----------------- LIFECYCLE ------------------- */}
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
                      {/* ----------------- STATS ------------------- */}
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
                              <Badge
                                fontSize={'xl'}
                                fontWeight={'medium'}
                                variant='subtle'
                                colorScheme='red'
                                borderRadius='md'
                                cursor={'pointer'}
                                onClick={() => onFilterSev(['critical'])}
                              >
                                {sbomData.sbom.stats.vulnStats.critical
                                  ? sbomData.sbom.stats.vulnStats.critical
                                  : 0}
                              </Badge>
                              <Badge
                                fontSize={'xl'}
                                fontWeight={'medium'}
                                variant='subtle'
                                colorScheme='orange'
                                borderRadius='md'
                                cursor={'pointer'}
                                onClick={() => onFilterSev(['high'])}
                              >
                                {sbomData.sbom.stats.vulnStats.high
                                  ? sbomData.sbom.stats.vulnStats.high
                                  : 0}
                              </Badge>
                              <Badge
                                fontSize={'xl'}
                                fontWeight={'medium'}
                                variant='subtle'
                                colorScheme='yellow'
                                borderRadius='md'
                                cursor={'pointer'}
                                onClick={() => onFilterSev(['medium'])}
                              >
                                {sbomData.sbom.stats.vulnStats.medium
                                  ? sbomData.sbom.stats.vulnStats.medium
                                  : 0}
                              </Badge>
                              <Badge
                                fontSize={'xl'}
                                fontWeight={'medium'}
                                variant='subtle'
                                colorScheme='green'
                                borderRadius='md'
                                cursor={'pointer'}
                                onClick={() => onFilterSev(['low'])}
                              >
                                {sbomData.sbom.stats.vulnStats.low
                                  ? sbomData.sbom.stats.vulnStats.low
                                  : 0}
                              </Badge>
                            </Stack>
                            <Text fontSize={'xs'}>Vulnerabilities</Text>
                          </Box>
                        </Stack>
                      </Flex>
                    </Flex>
                  </Flex>
                </GridItem>
                {/* RIGHT */}
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

        {sbomData && (
          <SignedSbomTable
            refetch={refetch}
            data={sbomData.sbom}
            filteredData={filteredData}
            status={sbomData.sbom.lifecycle}
            getVulnData={getVulnData}
            vulnData={vulnData}
            type={
              selectedProject?.sboms.length > 0 &&
              selectedProject.sboms[0].format
            }
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

import React, { useEffect, useState } from 'react'
import {
  Flex,
  Heading,
  Icon,
  Grid,
  GridItem,
  Text,
  Select,
  Image,
  Box,
  Tag,
  TagLabel,
  Tooltip,
  Stack,
  StackDivider,
  chakra
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody.js'
import { FaCubes, FaLayerGroup, FaMicroscope } from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import CustomerSBOMTable from '../Dashboard/SBOMs/components/CustomerSBOMTable'
import CustomerModal from 'components/CustomerModal'
import { GetSignedImage } from 'graphQL/Queries'
import { useQuery } from '@apollo/client'
import { GetSignedImageVersion } from 'graphQL/Queries'
import { dateTime, timeSince, scanImage } from 'utils'
import { getAllScanners } from 'graphQL/Queries'
import { formattedTime } from 'utils'
import semver from 'semver'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'

function Customer() {
  const { isConfirmed, setIsConfirmed } = useContext(GlobalContext)

  const [scanResults, setScanResults] = useState(null)
  const [scannerRun, setScannerRun] = useState([])
  const [imageInfo, setImageInfo] = useState([])

  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedScanner, setSelectedScanner] = useState('')
  const [allResults, setAllResults] = useState([])
  const [filteredVulItems, setFilteredVulItems] = useState([])
  const [total, setTotal] = useState({ C: 0, H: 0, M: 0, L: 0 })
  const [unresolve, setUnresolve] = useState({
    C: 0,
    H: 0,
    M: 0,
    L: 0
  })

  const location = useLocation()
  const history = useHistory()

  const queryParams = new URLSearchParams(location.search)
  const paramId = queryParams.get('signed_url_params')
  const imageVersionId = queryParams.get('id')

  const { data: allScanners } = useQuery(getAllScanners)

  const scannerName = (id) => {
    if (allScanners) {
      const scanner = allScanners.scanners.find((item) => item.id === id)
      return scanner.name
    }
  }

  const { data: signedImageData, refetch: imgDataFetch } = useQuery(
    GetSignedImage,
    {
      variables: { signedParams: paramId }
    }
  )

  const { data: signedImgVerion, refetch, loading } = useQuery(
    GetSignedImageVersion,
    {
      variables: {
        signedParams: paramId,
        imgVersionId: imageVersionId,
        first: 10
      }
    }
  )

  const onPreviousPage = () => {
    refetch({
      signedParams: paramId,
      imageVersionId: imageVersionId,
      first: undefined,
      last: 10,
      before: signedImgVerion.imageVersion.imageVulns.pageInfo.startCursor,
      after: ''
    })
  }

  const onNextPage = () => {
    refetch({
      signedParams: `${paramId}`,
      imageVersionId: imageVersionId,
      first: 10,
      last: undefined,
      after: signedImgVerion.imageVersion.imageVulns.pageInfo.endCursor,
      before: ''
    })
  }

  useEffect(() => {
    if (signedImageData) {
      // console.log(`signedImageData`, signedImageData)
      const imgV = signedImageData.image.imageVersions.find(
        (item) => item.id === imageVersionId
      )
      setScanResults(imgV)
      setSelectedVersion(imgV.id)
    }
  }, [signedImageData])

  useEffect(() => {
    if (signedImgVerion) {
      // console.log(`signedImgVerion`, signedImgVerion)
      setAllResults(signedImgVerion.imageVersion.imageVulns.nodes)
      setScannerRun(signedImgVerion.imageVersion.imageScannerRun)
    }
  }, [signedImgVerion])

  useEffect(() => {
    if (signedImageData) {
      window.localStorage.setItem('signedImageName', signedImageData.image.name)
      const clonedImageVersions = signedImageData.image.imageVersions.map(
        (info) => ({
          ...info
        })
      )

      clonedImageVersions.sort((a, b) => {
        // If either a or b is 'latest', handle the special case.
        if (a.name === 'latest') {
          return -1
        } else if (b.name === 'latest') {
          return 1
        }
        var coerced_a = semver.valid(semver.coerce(a.name))
        var coerced_b = semver.valid(semver.coerce(b.name))
        if (coerced_a === null || coerced_b === null) {
          return b.name.localeCompare(a.name)
        }
        return semver.compare(coerced_b, coerced_a)
      })

      setImageInfo(clonedImageVersions)
    }
  }, [signedImageData])

  useEffect(() => {
    const checkURL = () => {
      if (!localStorage.getItem('userEmail')) {
        setIsConfirmed(true)
      }
    }

    checkURL()

    // Cleanup function
    return () => {
      // Any necessary cleanup code
    }
  }, [])

  const handleScanner = (e) => {
    const { value } = e.target
    setSelectedScanner(value)
  }

  useEffect(() => {
    const filteredData = allResults.filter((item) =>
      item.scanners.some((scanner) => scanner.id === selectedScanner)
    )
    // console.log('filteredData', filteredData)
    setFilteredVulItems(filteredData)
  }, [selectedScanner])

  const handleVersionUpdate = (e) => {
    const { value } = e.target
    console.log(`value`, value)
    setSelectedVersion(value)
    const imgV =
      signedImageData &&
      signedImageData.image.imageVersions.find((item) => item.id === value)
    setScanResults(imgV)
    refetch({ signedParams: paramId, imgVersionId: value, first: 10 })
    history.push(`/customer?signed_url_params=${paramId}&id=${value}`)
  }

  // Calculate the counts for each severity level
  const totalCount = allResults.reduce((acc, item) => {
    acc[item.severity[0].toLowerCase()] =
      (acc[item.severity[0].toLowerCase()] || 0) + 1
    return acc
  }, {})

  const unresolveFilter = allResults.filter(
    (item) =>
      item.vexVuln?.vexStatus?.name !== 'Fixed' &&
      item.vexVuln?.vexStatus?.name !== 'False Positive' &&
      item.vexVuln?.vexStatus?.name !== 'Not Affected'
  )

  const unresolveCount = unresolveFilter?.reduce((acc, item) => {
    acc[item.severity[0].toLowerCase()] =
      (acc[item.severity[0].toLowerCase()] || 0) + 1
    return acc
  }, {})

  useEffect(() => {
    const critical = totalCount['critical'] || 0
    const high = totalCount['high'] || 0
    const medium = totalCount['medium'] || 0
    const low = totalCount['low'] || 0
    setTotal({
      C: critical,
      H: high,
      M: medium,
      L: low
    })
  }, [allResults])

  useEffect(() => {
    const critical = unresolveCount['critical'] || 0
    const high = unresolveCount['high'] || 0
    const medium = unresolveCount['medium'] || 0
    const low = unresolveCount['low'] || 0
    setUnresolve({
      C: critical,
      H: high,
      M: medium,
      L: low
    })
  }, [allResults])

  // useEffect(() => {
  //   console.log(`scanResults`, scanResults)
  // }, [scanResults])

  // useEffect(() => {
  //   if (signedImageData) {
  //     console.log(`signedImageData`, signedImageData)
  //   }
  // }, [signedImageData])

  // useEffect(() => {
  //   if (signedImgVerion) {
  //     console.log(`signedImgVerion`, signedImgVerion)
  //   }
  // }, [signedImgVerion])

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
        {/* Image Details */}
        <Card mb='6'>
          <CardBody>
            <Grid width={'100%'} templateColumns='repeat(5, 1fr)'>
              <GridItem colSpan={2}>
                <Flex
                  direction={'row'}
                  alignItems={'center'}
                  gap={5}
                  width={'100%'}
                >
                  <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
                  {scanResults && signedImageData && signedImgVerion ? (
                    <Flex direction={'column'} gap={1}>
                      <Heading as='h3' size='md' noOfLines={1}>
                        <Flex
                          alignItems={'center'}
                          flexDirection={'row'}
                          gap={3}
                        >
                          {signedImageData.image.name}:{scanResults.name}
                          <Tag
                            size={'sm'}
                            variant='outline'
                            colorScheme={
                              signedImgVerion.imageVersion.image.scanEnabled ===
                              true
                                ? 'blue'
                                : 'red'
                            }
                          >
                            <TagLabel>
                              Scan{' '}
                              {signedImgVerion.imageVersion.image
                                .scanEnabled === true
                                ? 'Enabled'
                                : 'Disabled'}
                            </TagLabel>
                          </Tag>
                        </Flex>
                      </Heading>
                      <Text fontSize='sm'>linux/amd64</Text>
                      <Tooltip
                        label={dateTime(
                          signedImgVerion.imageVersion.lastPushedAt
                        )}
                      >
                        <Text fontSize='xs' cursor={'pointer'}>
                          Last Pushed:{' '}
                          {timeSince(signedImgVerion.imageVersion.lastPushedAt)}
                        </Text>
                      </Tooltip>
                      <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                        {signedImgVerion.imageVersion.tags &&
                          signedImgVerion.imageVersion.tags.length > 0 &&
                          signedImgVerion.imageVersion.tags.map(
                            (item, index) => (
                              <Tag
                                size={'sm'}
                                key={index}
                                variant='outline'
                                colorScheme='blue'
                              >
                                {item}
                              </Tag>
                            )
                          )}
                      </Flex>
                    </Flex>
                  ) : (
                    <Text>Loading....</Text>
                  )}
                </Flex>
              </GridItem>
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
                      onChange={handleVersionUpdate}
                      size='md'
                      width={'150px'}
                      color='gray.500'
                    >
                      {imageInfo.length > 0 &&
                        imageInfo.map((img, index) => (
                          <option key={index} value={img.id}>
                            {img.name}
                          </option>
                        ))}
                    </Select>
                  </Flex>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <FaMicroscope size={20} color='darkgray' />
                    <Select
                      id='scanner'
                      value={selectedScanner}
                      onChange={handleScanner}
                      size='md'
                      color='gray.500'
                    >
                      <option value={'all'}>All</option>
                      {signedImageData &&
                        signedImageData.image.imageScanners?.map((result) => (
                          <option key={result.id} value={result.id}>
                            {result.company}-{result.name}
                          </option>
                        ))}
                    </Select>
                  </Flex>
                </Flex>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
        {/* Scanner Details */}
        {scannerRun.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size='md'>Scanner Summary</Heading>
            </CardHeader>

            <CardBody width='100%'>
              <Stack
                width={'100%'}
                mt={8}
                divider={<StackDivider />}
                spacing='4'
              >
                {scannerRun.map((item, index) => (
                  <Flex
                    key={index}
                    flexDir={'row'}
                    alignItems={'flex-start'}
                    justifyContent={'space-between'}
                    gap={4}
                  >
                    <Flex
                      flexDir={'row'}
                      alignItems={'flex-start'}
                      gap={4}
                      cursor={'pointer'}
                    >
                      {allScanners && (
                        <Image
                          width={7}
                          objectFit={'contain'}
                          src={`${scanImage(scannerName(item.scannerId))}`}
                          alt={scannerName(item.scannerId)}
                        />
                      )}
                      <Tooltip
                        label={`${
                          item.status !== 'failed'
                            ? `${formattedTime(
                                item.initiatedAt,
                                item.completedAt
                              )}`
                            : ''
                        }`}
                      >
                        <Box>
                          <Flex alignItems={'center'} gap={3}>
                            <Heading size='sm' color={'gray.600'}>
                              {scannerName(item.scannerId)}
                            </Heading>
                            {item.status !== 'failed' && (
                              <Text fontSize={'sm'}>{item.scannerVersion}</Text>
                            )}
                          </Flex>
                          <Text
                            pt={2}
                            fontSize='sm'
                            textTransform={'capitalize'}
                          >
                            <chakra.span
                              color={`${
                                item.status === 'completed'
                                  ? 'green.500'
                                  : item.status === 'failed'
                                  ? 'red.500'
                                  : 'orange.400'
                              }`}
                            >
                              {item.status}
                            </chakra.span>
                          </Text>
                        </Box>
                      </Tooltip>
                    </Flex>
                    {item.status !== 'failed' && (
                      <Text fontSize={'sm'}>
                        <em>
                          Updated{' '}
                          {item.completedAt
                            ? timeSince(item.completedAt)
                            : timeSince(item.failedAt)}
                        </em>
                      </Text>
                    )}
                  </Flex>
                ))}
              </Stack>
            </CardBody>
          </Card>
        )}
        {signedImgVerion && signedImgVerion && signedImageData && (
          <CustomerSBOMTable
            loading={loading}
            refetch={refetch}
            imageVersionData={signedImgVerion.imageVersion}
            imgVersionId={signedImgVerion.imageVersion.id}
            imageInfo={signedImageData.image.imageVersions}
            filteredVul={filteredVulItems}
            setFilteredVulItems={setFilteredVulItems}
            handlePreviousPage={onPreviousPage}
            handleNextPage={onNextPage}
          />
        )}
        {isConfirmed && <CustomerModal />}
      </Flex>
    </>
  ) // Return an empty fragment or any other component you may want to render
}

export default Customer

// Chakra imports
import {
  Flex,
  Heading,
  Icon,
  Grid,
  GridItem,
  Text,
  Box,
  Select,
  Image,
  chakra,
  Tag,
  TagLabel,
  Tooltip,
  Stack,
  StackDivider,
  Button
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody.js'
import { sbom } from 'variables/general'
import { FaCubes, FaLayerGroup, FaMicroscope } from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'

import { useQuery } from '@apollo/client'
import { scanImage } from 'utils'
import semver from 'semver'
import { GetSignedImage, GetSignedImageVerion } from 'graphQL/Queries'
import { getAllScanners } from 'graphQL/Queries'
import { timeSince } from 'utils'
import { formattedTime } from 'utils'
import { dateTime } from 'utils'
import Cookies from 'js-cookie'
import ImageLogs from './ImageLogs'

function ImageInfo() {
  const [scanResults, setScanResults] = useState(null)

  const { scanEnabled } = useContext(GlobalContext)

  const location = useLocation()
  const history = useHistory()

  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const imageId = queryParams.get('id')

  localStorage.setItem('selectedVersion', versionId)

  const signedParams = Cookies.get(`signedParamId`)

  useEffect(() => {
    console.log(`scanEnabled`, scanEnabled)
  }, [scanEnabled])

  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedScanner, setSelectedScanner] = useState('')
  const [total, setTotal] = useState({ C: 0, H: 0, M: 0, L: 0, U: 0 })
  const [unresolve, setUnresolve] = useState({
    C: 0,
    H: 0,
    M: 0,
    L: 0,
    U: 0
  })

  const [allResults, setAllResults] = useState([])

  const [filteredVulItems, setFilteredVulItems] = useState([])

  const [scannerRun, setScannerRun] = useState([])

  const {
    data: imageData,
    refetch: imageDataRefetch,
    loading: shareLynkLoading
  } = useQuery(GetSignedImage, {
    variables: { signedParams: signedParams, imageId: imageId }
  })

  // useEffect(() => {
  //   if (imageData) {
  //     console.log(`image data`, imageData)
  //   }
  // }, [imageData])

  const { data: allScanners } = useQuery(getAllScanners)

  const scannerName = (id) => {
    if (allScanners) {
      const scanner = allScanners.scanners.find((item) => item.id === id)
      return scanner.name
    }
  }

  const { data: imageVersionData, refetch, loading } = useQuery(
    GetSignedImageVerion,
    {
      variables: {
        signedParams: signedParams,
        imageVersionId: versionId,
        versionId: versionId,
        imageId: imageId,
        first: 10
      }
    }
  )

  useEffect(() => {
    if (imageVersionData) {
      // console.log('imageVersionData', imageVersionData)
      setSelectedVersion(imageVersionData.imageVersion.id)
      setScannerRun(imageVersionData.imageVersion.imageScannerRun)
      setScanResults(imageVersionData.imageVersion)
    }
  }, [imageVersionData])

  const onPreviousPage = () => {
    refetch({
      signedParams: signedParams,
      imageVersionId: versionId,
      versionId: versionId,
      first: undefined,
      last: 10,
      before: imageVersionData.imageVersion.imageVulns.pageInfo.startCursor,
      after: ''
    })
  }

  const onNextPage = () => {
    refetch({
      signedParams: signedParams,
      imageVersionId: versionId,
      versionId: versionId,
      first: 10,
      last: undefined,
      after: imageVersionData.imageVersion.imageVulns.pageInfo.endCursor,
      before: ''
    })
  }

  const [imageInfo, setImageInfo] = useState([])

  useEffect(() => {
    if (imageData) {
      // console.log(`imageData`, imageData)
      const clonedImageVersions = imageData.image.imageVersions.map((info) => ({
        ...info
      }))

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
      // console.log(`clonedImageVersions`, clonedImageVersions)
      setImageInfo(clonedImageVersions)
    }
  }, [imageData])

  const handleVersionUpdate = (e) => {
    setFilteredVulItems([])
    const { value } = e.target
    setSelectedVersion(value)
    localStorage.setItem('selectedVersion', versionId)
    refetch({
      signedParams: signedParams,
      imageVersionId: value,
      versionId: value,
      first: 30
    })
    queryParams.set('v', value)
    history.push(`/customer/images?v=${value}&id=${imageId}`)
  }

  const sortSBOM = sbom.sort((a, b) => a.component.localeCompare(b.component))

  const handleScanner = (e) => {
    const { value } = e.target
    localStorage.setItem('cloudScanner', value)
    setSelectedScanner(value)
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
    const medium = totalCount['medium' || 'unknown'] || 0
    const low = totalCount['low'] || 0
    const unknown = totalCount['unknown'] || 0
    setTotal({
      C: critical,
      H: high,
      M: medium,
      L: low,
      U: unknown
    })
  }, [allResults])

  useEffect(() => {
    const critical = unresolveCount['critical'] || 0
    const high = unresolveCount['high'] || 0
    const medium = unresolveCount['medium'] || 0
    const low = unresolveCount['low'] || 0
    const unknown = unresolveCount['unknown'] || 0
    setUnresolve({
      C: critical,
      H: high,
      M: medium,
      L: low,
      U: unknown
    })
  }, [allResults])

  useEffect(() => {
    const filteredData = allResults.filter((item) =>
      item.scanners.some((scanner) => scanner.id === selectedScanner)
    )
    setFilteredVulItems(filteredData)
  }, [selectedScanner])

  const cldScanner = localStorage.getItem('cloudScanner')

  useEffect(() => {
    setSelectedScanner(cldScanner ? cldScanner : 'All')
  }, [])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '70px' }} px={2}>
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
                {scanResults && imageVersionData ? (
                  <Flex direction={'column'} gap={1}>
                    <Text fontWeight={'semibold'} fontSize={18}>
                      <Flex alignItems={'center'} flexDirection={'row'} gap={3}>
                        {imageVersionData.imageVersion.image.name}:
                        {imageVersionData.imageVersion.name}
                        <Tag
                          size={'sm'}
                          variant='outline'
                          colorScheme={
                            imageVersionData.imageVersion.image.scanEnabled ===
                            true
                              ? 'blue'
                              : 'red'
                          }
                        >
                          <TagLabel>
                            Scan{' '}
                            {imageVersionData.imageVersion.image.scanEnabled ===
                            true
                              ? 'Enabled'
                              : 'Disabled'}
                          </TagLabel>
                        </Tag>
                      </Flex>
                    </Text>
                    <Text fontSize='sm'>linux/amd64</Text>
                    <Tooltip
                      label={dateTime(
                        imageVersionData.imageVersion.lastPushedAt
                      )}
                    >
                      <Text fontSize='xs' cursor={'pointer'}>
                        Last Pushed:{' '}
                        {timeSince(imageVersionData.imageVersion.lastPushedAt)}
                      </Text>
                    </Tooltip>
                    <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                      {imageVersionData.imageVersion.tags &&
                        imageVersionData.imageVersion.tags.length > 0 &&
                        imageVersionData.imageVersion.tags.map(
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
                    {scanResults &&
                      scanResults.imageScanners.map((result) => (
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
      {imageVersionData && (
        <Card>
          <CardHeader>
            <Heading size='md'>Scanner Summary</Heading>
          </CardHeader>
          <CardBody width='100%'>
            {imageVersionData.imageVersion.imageScannerRun.length > 0 && (
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
                            Status - {''}
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
                    {item.status !== 'failed' ||
                      (item.status !== 'running' && (
                        <Text fontSize={'sm'}>
                          <em>
                            Updated{' '}
                            {item.completedAt
                              ? timeSince(item.completedAt)
                              : timeSince(item.failedAt)}
                          </em>
                        </Text>
                      ))}
                  </Flex>
                ))}
              </Stack>
            )}

            {loading && <Text mt={6}>Loading...</Text>}

            {imageVersionData.imageVersion.imageScannerRun.length === 0 && (
              <Text mt={6}>
                No scan was performed on this image tag. Click on refresh to
                launch a new scan
              </Text>
            )}
          </CardBody>
        </Card>
      )}

      {imageVersionData && (
        <>
          <ImageLogs
            data={imageVersionData}
            refetch={refetch}
            imageInfo={imageInfo}
          />

          <Flex
            flexDir={'row'}
            gap={4}
            alignItems={'center'}
            justifyContent={'flex-start'}
          >
            <Button
              colorScheme='blue'
              onClick={onPreviousPage}
              isDisabled={
                !imageVersionData.imageVersion.imageVulns.pageInfo
                  .hasPreviousPage
              }
            >
              Previous
            </Button>
            <Button
              colorScheme='blue'
              onClick={onNextPage}
              isDisabled={
                !imageVersionData.imageVersion.imageVulns.pageInfo.hasNextPage
              }
            >
              Next
            </Button>
          </Flex>
        </>
      )}
    </Flex>
  )
}

export default ImageInfo

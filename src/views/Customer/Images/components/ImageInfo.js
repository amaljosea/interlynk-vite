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
  StackDivider
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody.js'
// import SBOMTable from './components/SBOMTable'
import { sbom } from 'variables/general'
import {
  FaCubes,
  FaBug,
  FaLayerGroup,
  FaMicroscope,
  FaExclamationTriangle
} from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'

import { useQuery } from '@apollo/client'
import { scanImage } from 'utils'
import { getImage } from 'graphQL/Queries'
import semver from 'semver'
import { GetImgVersionPagination } from 'graphQL/Queries'
import { getAllScanners } from 'graphQL/Queries'
import { timeSince } from 'utils'
import { formattedTime } from 'utils'
import { dateTime } from 'utils'
import { GetSignedImage } from 'graphQL/Queries'
import Cookies from 'js-cookie'

function ImageInfo() {
  const [scanResults, setScanResults] = useState(null)

  const { setTabIndex, scanEnabled } = useContext(GlobalContext)

  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const imageId = queryParams.get('id')

  const signedParams = Cookies.get(`signedParamId`)

  localStorage.setItem('selectedVersion', versionId)

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

  const { data, refetch, loading } = useQuery(GetSignedImage, {
    variables: {
      imageId: imageId,
      signedParams: signedParams
    }
  })

  useEffect(() => {
    if (data) {
      console.log(`signed image data`, data)
    }
  }, [data])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      {/* Image Details */}
      <Card mb='6'>
        <Text>Image Info</Text>

        {/* <CardBody>
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
                    <Heading as='h3' size='md' noOfLines={1}>
                      <Flex alignItems={'center'} flexDirection={'row'} gap={3}>
                        {scanResults.image.name}:{scanResults.name}
                        <Tag
                          size={'sm'}
                          variant='outline'
                          colorScheme={
                            scanResults.image.scanEnabled === true
                              ? 'blue'
                              : 'red'
                          }
                        >
                          <TagLabel>
                            Scan{' '}
                            {scanResults.image.scanEnabled === true
                              ? 'Enabled'
                              : 'Disabled'}
                          </TagLabel>
                        </Tag>
                      </Flex>
                    </Heading>
                    <Text fontSize='sm'>linux/amd64</Text>
                    <Tooltip label={dateTime(scanResults.lastPushedAt)}>
                      <Text fontSize='xs' cursor={'pointer'}>
                        Last Pushed: {timeSince(scanResults.lastPushedAt)}
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
        </CardBody> */}
      </Card>
      {/* Scanner Details */}
      {/* {imageVersionData && (
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
      )} */}
      {/* Table */}
      {/* <SBOMTable
        refetch={refetch}
        imgVersionId={imageVersionData ? imageVersionData.imageVersion.id : ''}
        scanResults={scanResults ? scanResults.imageScanners : []}
        imageVersionData={imageVersionData && imageVersionData.imageVersion}
        shareLynks={imageData ? imageData.image.shareLynks : []}
        imageDataRefetch={imageDataRefetch}
        imageInfo={imageInfo}
        data={sortSBOM}
        filteredVul={filteredVulItems}
        loading={loading}
        shareLynkLoading={shareLynkLoading}
        setFilteredVulItems={setFilteredVulItems}
        imageId={imageId}
        handlePreviousPage={onPreviousPage}
        handleNextPage={onNextPage}
      /> */}
    </Flex>
  )
}

export default ImageInfo

// Chakra imports
import {
  Flex,
  Heading,
  Spacer,
  Icon,
  Grid,
  GridItem,
  Text,
  Box,
  Select,
  chakra,
  Image,
  Skeleton,
  Tag,
  TagLabel
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMTable from './components/SBOMTable'
import SBOMStatistics from './components/SBOMStatistics'
import { sbom } from 'variables/general'
import {
  FaCubes,
  FaBug,
  FaTag,
  FaMicroscope,
  FaExclamationTriangle
} from 'react-icons/fa'
import { useLocation, useHistory } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import Tooltip from 'components/Tooltip'
import { useQuery } from '@apollo/client'
import { scanImage } from 'utils'
import { getImageVersion, getImage } from 'graphQL/Queries'

function SBOMs() {
  const [scanResults, setScanResults] = useState(null)

  const { productVersionsData, setTabIndex, scanEnabled } = useContext(
    GlobalContext
  )

  const location = useLocation()
  const history = useHistory()

  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const imageId = queryParams.get('id')

  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedScanner, setSelectedScanner] = useState('')
  const [total, setTotal] = useState({ C: 0, H: 0, M: 0, L: 0 })
  const [unresolve, setUnresolve] = useState({
    C: 0,
    H: 0,
    M: 0,
    L: 0
  })

  const [allResults, setAllResults] = useState([])

  const [filteredVulItems, setFilteredVulItems] = useState([])

  const {
    data: imageData,
    refetch: imageDataRefetch,
    loading: shareLynkLoading
  } = useQuery(getImage, {
    variables: { id: imageId }
  })

  const { data: imageVersionData, refetch, loading } = useQuery(
    getImageVersion,
    {
      variables: {
        id: versionId
      },
      notifyOnNetworkStatusChange: true
    }
  )

  useEffect(() => {
    if (imageVersionData) {
      console.log('imageVersionData', imageVersionData)
      setAllResults(imageVersionData.imageVersion.imageVulns)
      setScanResults(imageVersionData.imageVersion)
    }
  }, [imageVersionData])

  const [imageInfo, setImageInfo] = useState([])

  useEffect(() => {
    if (imageData) {
      console.log('imageData', imageData.image)
      setImageInfo(imageData.image.imageVersions)
      setSelectedVersion(imageVersionData?.imageVersion?.id)
    }
  }, [imageData])

  const handleVersionUpdate = (e) => {
    setFilteredVulItems([])
    const { value } = e.target
    setSelectedVersion(value)
    console.log('value', value)
    refetch({ id: value })
    queryParams.set('v', value)
    history.push(`/vendor/images?v=${value}&id=${imageId}`)
  }

  const uniqProjects = []
  const btnRef = React.useRef()

  productVersionsData.map((project) => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  })
  const uniqVersions = []
  productVersionsData.map((project) => {
    project.versions.map((version) => {
      if (uniqVersions.indexOf(version.version) === -1) {
        uniqVersions.push(version.version)
      }
    })
  })

  const sortSBOM = sbom.sort((a, b) => a.component.localeCompare(b.component))

  const handleScanner = (e) => {
    const { value } = e.target
    localStorage.setItem('cloudScanner', value)
    setSelectedScanner(value)
  }

  // Calculate the counts for each severity level
  const totalCount = allResults.reduce((acc, item) => {
    acc[item.severity[0]] = (acc[item.severity[0]] || 0) + 1
    return acc
  }, {})

  const unresolveFilter = allResults.filter(
    (item) =>
      item.vexVuln?.vexStatus?.name !== 'Fixed' &&
      item.vexVuln?.vexStatus?.name !== 'False Positive' &&
      item.vexVuln?.vexStatus?.name !== 'Not Affected'
  )

  const unresolveCount = unresolveFilter?.reduce((acc, item) => {
    acc[item.severity[0]] = (acc[item.severity[0]] || 0) + 1
    return acc
  }, {})

  useEffect(() => {
    const critical = totalCount['critical'] || 0
    const high = totalCount['super high'] || 0
    const medium = totalCount['medium' || 'unknown'] || 0
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
    const low = unresolveCount['low' || 'unknown'] || 0
    setUnresolve({
      C: critical,
      H: high,
      M: medium,
      L: low
    })
  }, [allResults])

  useEffect(() => {
    const filteredData = allResults.filter((item) =>
      item.scanners.some((scanner) => scanner.id === selectedScanner)
    )
    // console.log('filteredData', filteredData)
    setFilteredVulItems(filteredData)
  }, [selectedScanner])

  useEffect(() => {
    setTabIndex(1)
    setSelectedScanner('All')
  }, [])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
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
                <Box>
                  <Heading as='h3' size='md' noOfLines={1} color='gray.600'>
                    <Flex alignItems={'center'} flexDirection={'row'} gap={3}>
                      {scanResults
                        ? `${scanResults.image.name}:${scanResults.name}`
                        : 'Loading....'}
                      <Tag
                        size={'sm'}
                        variant='outline'
                        colorScheme={scanEnabled ? 'blue' : 'red'}
                      >
                        <TagLabel>
                          Scan {scanEnabled ? 'Enabled' : 'Disabled'}
                        </TagLabel>
                      </Tag>
                    </Flex>
                  </Heading>
                  <Text fontSize='sm'>linux/amd64</Text>
                  <Text fontSize='xs' mb={2}>
                    Last Pushed:{' '}
                    {scanResults
                      ? `${
                          new Date(scanResults.updatedAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              timeZone: 'America/Los_Angeles'
                            }
                          ) +
                          ' ' +
                          new Date(scanResults.updatedAt).toLocaleTimeString(
                            'en-US',
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'America/Los_Angeles'
                            }
                          )
                        }`
                      : 'Loading..'}
                  </Text>
                  {scanResults ? (
                    scanResults.imageScanners.map((result, index) => (
                      <Flex
                        key={index}
                        flexDirection={'row'}
                        alignItems={'center'}
                        gap={2}
                        mb={2}
                      >
                        <Tooltip text={`${result.company}-${result.name}`}>
                          <Image
                            width={4}
                            objectFit={'contain'}
                            src={`${scanImage(result.name)}`}
                            alt={result}
                          />
                        </Tooltip>
                        <Text fontSize={'xs'}>
                          {new Date(result.updatedAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              timeZone: 'America/Los_Angeles'
                            }
                          )}{' '}
                          {new Date(result.updatedAt).toLocaleTimeString(
                            'en-US',
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'America/Los_Angeles'
                            }
                          )}
                        </Text>
                      </Flex>
                    ))
                  ) : (
                    <Skeleton height={'2'} />
                  )}
                </Box>
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
                  <FaTag size={18} color='darkgray' />
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
      <Flex direction='row' gap='2'>
        {/* <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaCubes} />}
          title={'Components'}
          description={'Components included in SBOM'}
          amount={componentsVal !== '' ? componentsVal : 126}
        />
        <Spacer /> */}
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaBug} />}
          title={'Total Vulnerabilities'}
          description={'Vulnerabilities included in SBOM'}
          amount={`${total.C}C,${total.H}H,${total.M}M,${total.L}L`}
        />
        <Spacer />
        <SBOMStatistics
          icon={
            <Icon
              h={'24px'}
              w={'24px'}
              color='white'
              as={FaExclamationTriangle}
            />
          }
          title={'Unresolved Vulnerabilities'}
          description={'Vulnerabilities included in SBOM'}
          amount={`${unresolve.C}C,${unresolve.H}H,${unresolve.M}M,${unresolve.L}L`}
        />
        {/* <Spacer />
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaUnlock} />}
          title={'Risk Score'}
          description={'Aggregage Risk Score of SBOM'}
          amount={riskScoreVal !== '' ? riskScoreVal : 22}
        /> */}
      </Flex>
      <SBOMTable
        refetch={refetch}
        imgVersionId={imageVersionData ? imageVersionData.imageVersion.id : ''}
        scanResults={scanResults ? scanResults.imageScanners : []}
        vulData={
          imageVersionData ? imageVersionData.imageVersion.imageVulns : []
        }
        shareLynks={imageData ? imageData.image.shareLynks : []}
        imageDataRefetch={imageDataRefetch}
        imageInfo={imageInfo}
        data={sortSBOM}
        filteredVul={filteredVulItems}
        loading={loading}
        shareLynkLoading={shareLynkLoading}
        setFilteredVulItems={setFilteredVulItems}
        imageId={imageId}
      />
    </Flex>
  )
}

export default SBOMs

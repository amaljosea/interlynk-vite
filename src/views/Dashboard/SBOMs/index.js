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
  Skeleton
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
  FaUnlock,
  FaTag,
  FaMicroscope,
  FaExclamationTriangle
} from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import Tooltip from 'components/Tooltip'
import { useQuery } from '@apollo/client'
import { scanImage } from 'utils'
import { getImageVersion, getImage } from 'graphQL/Queries'

function SBOMs() {
  const [scanResults, setScanResults] = useState(null)

  const [jsonData] = useState({
    id: 74,
    parentId: null,
    value: '',
    children: [
      {
        id: 62,
        parentId: 74,
        value: 'Task 7',
        children: [
          {
            id: 56,
            parentId: 62,
            value: 'Task 1'
          },
          {
            id: 63,
            parentId: 62,
            value: 'Task 4'
          }
        ]
      },
      {
        id: 86,
        parentId: 74,
        value: 'Task 8',
        children: [
          {
            id: 80,
            parentId: 86,
            value: 'Task 5',
            children: [
              {
                id: 81,
                parentId: 80,
                value: 'Task 2'
              },
              {
                id: 76,
                parentId: 80,
                value: 'Task 3'
              }
            ]
          },
          {
            id: 87,
            parentId: 86,
            value: 'Task 6'
          }
        ]
      }
    ]
  })

  const {
    productVersionsData,
    setTabIndex,
    vulnerabilitiesData,
    componentsVal,
    VulnerabilitiesVal,
    activeVulnVal,
    riskScoreVal
  } = useContext(GlobalContext)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const imageId = queryParams.get('id')

  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedScanner, setSelectedScanner] = useState('')

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
      setSelectedVersion(
        imageData.image.imageVersions[imageData.image.imageVersions.length - 1]
          .id
      )
    }
  }, [imageData])

  const handleVersionUpdate = (e) => {
    setFilteredVulItems([])
    const { value } = e.target
    setSelectedVersion(value)
    console.log('value', value)
    refetch({ id: value })
  }

  const exportData = () => {
    const fileData = JSON.stringify(jsonData)
    const blob = new Blob([fileData])
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'user-info44444.json'
    link.href = url
    link.click()
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

  useEffect(() => {
    const filteredData = allResults.filter((item) =>
      item.scanners.some((scanner) => scanner.id === selectedScanner)
    )
    console.log('filteredData', filteredData)
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
                    {scanResults
                      ? `${scanResults.image.name}:${scanResults.name}`
                      : 'Loading....'}
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
                    defaultValue={'All'}
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
          amount={
            VulnerabilitiesVal !== '' ? VulnerabilitiesVal : '2C, 9H, 5M, 4L'
          }
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
          title={'Active Vulnerabilities'}
          description={'Vulnerabilities included in SBOM'}
          amount={activeVulnVal !== '' ? activeVulnVal : '1C, 1H, 3M, 4L'}
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
        title={'SBOM'}
        captions={[
          'component',
          'version',
          'relates to',
          'license',
          'risk_score',
          'vulnerabilities',
          'last_updated',
          ''
        ]}
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
      />
    </Flex>
  )
}

export default SBOMs

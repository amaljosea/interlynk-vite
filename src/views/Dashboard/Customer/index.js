// Chakra imports
import {
  Flex,
  Heading,
  Spacer,
  Icon,
  Grid,
  GridItem,
  Text,
  Select,
  Skeleton,
  Image,
  Box
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'

import { sbom } from 'variables/general'

import {
  FaCubes,
  FaBug,
  FaExclamationTriangle,
  FaTag,
  FaMicroscope
} from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

import SBOMStatistics from '../SBOMs/components/SBOMStatistics'

import GlobalContext from 'context/GlobalContext'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CustomerSBOMTable from '../SBOMs/components/CustomerSBOMTable'
import CustomerModal from 'components/CustomerModal'
import { GetSignedImage } from 'graphQL/Queries'
import { useQuery } from '@apollo/client'
import Tooltip from 'components/Tooltip'
import { scanImage } from 'utils'
import { GetSignedImageVersion } from 'graphQL/Queries'

function Customer() {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedScanner, setSelectedScanner] = useState('')
  const [allResults, setAllResults] = useState([])
  const [filteredVulItems, setFilteredVulItems] = useState([])

  const location = useLocation()
  const paramId = `${location.search.replace(/\?/g, '')}`

  const { data: signedImageData, refetch: imgDataFetch } = useQuery(
    GetSignedImage,
    {
      variables: { signedParams: `${paramId}` }
    }
  )

  const { data: signedImgVerion, refetch, loading } = useQuery(
    GetSignedImageVersion,
    {
      variables: {
        signedParams: `${paramId}`,
        imgVersionId:
          signedImageData && signedImageData.image.imageVersions[0].id
      }
    }
  )

  useEffect(() => {
    if (signedImageData) {
      console.log(`signedImageData`, signedImageData)
      localStorage.setItem(`signedImageName`, signedImageData.image.name)
    }
  }, [signedImageData])

  useEffect(() => {
    if (signedImgVerion) {
      console.log(`signedImgVerion`, signedImgVerion)
      setAllResults(signedImgVerion.imageVersion.imageVulns)
    }
  }, [signedImgVerion])

  const [contains, setcontains] = useState({})

  useEffect(() => {
    const containsData = window.localStorage.getItem('contains')
    setcontains(JSON.parse(containsData))
    const path = window.localStorage.getItem('path')
    const checkURL = () => {
      if (window.location.href === path) {
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
    console.log('filteredData', filteredData)
    setFilteredVulItems(filteredData)
  }, [selectedScanner])

  const handleVersionUpdate = (e) => {
    setFilteredVulItems([])
    const { value } = e.target
    setSelectedVersion(value)
    refetch({ signedParams: `${paramId}`, imgVersionId: value })
  }

  return (
    <>
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
                      {signedImageData
                        ? `${signedImageData.image.name}:${
                            signedImgVerion && signedImgVerion.imageVersion.name
                          }`
                        : 'Loading....'}
                    </Heading>
                    <Text fontSize='sm'>linux/amd64</Text>
                    <Text fontSize='xs' mb={2}>
                      Last Pushed:{' '}
                      {signedImageData
                        ? `${
                            new Date(
                              signedImageData.image.updatedAt
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              timeZone: 'America/Los_Angeles'
                            }) +
                            ' ' +
                            new Date(
                              signedImageData.image.updatedAt
                            ).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'America/Los_Angeles'
                            })
                          }`
                        : 'Loading..'}
                    </Text>
                    {signedImageData ? (
                      signedImageData.image.imageScanners?.map(
                        (result, index) => (
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
                        )
                      )
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
                      {signedImageData &&
                        signedImageData.image.imageVersions?.map(
                          (img, index) => (
                            <option key={index} value={img.id}>
                              {img.name}
                            </option>
                          )
                        )}
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
        {/* status bar */}
        <Flex direction='row' gap='2'>
          <SBOMStatistics
            icon={<Icon h={'24px'} w={'24px'} color='white' as={FaBug} />}
            title={'Total Vulnerabilities'}
            description={'Vulnerabilities included in SBOM'}
            amount={contains ? contains.VulnerabilitiesVal : ''}
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
            amount={contains ? contains.activeVulnVal : ''}
          />
        </Flex>
        <CustomerSBOMTable
          data={signedImgVerion && signedImgVerion.imageVersion.imageVulns}
          loading={loading}
          refetch={refetch}
          imgVersionId={signedImgVerion && signedImgVerion.imageVersion.id}
          imageInfo={signedImageData && signedImageData.image.imageVersions}
          filteredVul={filteredVulItems}
          setFilteredVulItems={setFilteredVulItems}
        />
        {isConfirmed && <CustomerModal />}
      </Flex>
    </>
  ) // Return an empty fragment or any other component you may want to render
}

export default Customer

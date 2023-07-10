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
  useQuery
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'

import { sbom } from 'variables/general'

import { FaCubes, FaBug, FaExclamationTriangle, FaTag } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

import SBOMStatistics from '../SBOMs/components/SBOMStatistics'

import GlobalContext from 'context/GlobalContext'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CustomerSBOMTable from '../SBOMs/components/CustomerSBOMTable'
import CustomerModal from 'components/CustomerModal'
import { GetSignedImage } from 'graphQL/Queries'

function Customer() {
  const [isConfirmed, setIsConfirmed] = useState(false)

  const { productVersionsData } = useContext(GlobalContext)

  const location = useLocation()
  const paramId = `${location.search.replace(/\?/g, '')}`

  const { data: signedImageData, refetch } = useQuery(GetSignedImage, {
    variables: { signedParams: paramId }
  })

  if (signedImageData) {
    console.log(`signedImageData`, signedImageData)
  }

  const uniqProjects = []

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

  const sbomgrVersion = ['v0.3', 'v0.2', 'v0.1']
  const [selectedVersion, setSelectedVersion] = useState('')

  const handleVersionUpdate = (e) => {
    const { value } = e.target
    setSelectedVersion(value)
  }

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
        <Card mb='6'>
          <CardBody>
            <Grid
              h='60px'
              templateRows='repeat(2, 1fr)'
              templateColumns='repeat(10, 1fr)'
              gap={4}
              w='full'
            >
              <GridItem rowSpan={2} colSpan={1}>
                <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
              </GridItem>
              <GridItem colSpan={3}>
                <Heading as='h3' size='md' noOfLines={1} color='gray.600'>
                  interlynk/sbomqs
                </Heading>
                <Text fontSize='sm'>
                  {selectedVersion ? selectedVersion : 'v0.3'}
                </Text>
                <Text fontSize='sm'>Last Updated: 2023-03-31 06:31:25</Text>
              </GridItem>
              <GridItem
                rowSpan={2}
                colSpan={2}
                colStart={9}
                display='flex'
                gap={4}
                justifyContent='flex-end'
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
                    {sbomgrVersion.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </Flex>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
        <Flex direction='row' gap='2'>
          <SBOMStatistics
            icon={<Icon h={'24px'} w={'24px'} color='white' as={FaBug} />}
            title={'Total Vulnerabilities'}
            description={'Vulnerabilities included in SBOM'}
            amount={
              contains.VulnerabilitiesVal ? contains.VulnerabilitiesVal : ''
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
            amount={contains.activeVulnVal ? contains.activeVulnVal : ''}
          />
        </Flex>
        <CustomerSBOMTable title={'SBOM'} data={sbom} />
        {isConfirmed && <CustomerModal />}
      </Flex>
    </>
  ) // Return an empty fragment or any other component you may want to render
}

export default Customer

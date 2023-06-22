// Chakra imports
import {
  Flex,
  Stack,
  Heading,
  Spacer,
  Icon,
  Button,
  Grid,
  GridItem,
  Text
} from '@chakra-ui/react'
import React from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import Authors from './components/Authors'
import SBOMTable from './components/SBOMTable'
import SBOMStatistics from './components/SBOMStatistics'
import Header from '../Profile/components/Header'
import { IoDocumentsSharp } from 'react-icons/io5'

import { tablesTableData, dashboardTableData, sbom } from 'variables/general'
import { ChevronDownIcon, AddIcon, LinkIcon, CopyIcon } from '@chakra-ui/icons'
import {
  FaBalanceScale,
  FaCubes,
  FaBug,
  FaUnlock,
  FaEllipsisV
} from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

function SBOMs() {
  const location = useLocation()
  console.log(location.state)

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card mb='6'>
        <CardBody>
          <Grid
            h='60px'
            templateRows='repeat(2, 1fr)'
            templateColumns='repeat(5, 1fr)'
            gap={4}
          >
            <GridItem rowSpan={2} colSpan={1}>
              <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
            </GridItem>
            <GridItem colSpan={3}>
              <Heading as='h3' size='md' noOfLines={1} color='gray.600'>
                SBOM Quality Score (sbomqs)
              </Heading>
              <Text fontSize='sm'>v0.0.14</Text>
              <Text fontSize='sm'>Last Updated: 2021-08-31 12:00:00</Text>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
      <Flex direction='row' gap='2'>
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaCubes} />}
          title={'Components'}
          description={'Components included in SBOM'}
          amount={31}
        />
        <Spacer />
        <SBOMStatistics
          icon={
            <Icon h={'24px'} w={'24px'} color='white' as={FaBalanceScale} />
          }
          title={'Licenses'}
          description={'Unique licenses included in SBOM'}
          amount={19}
        />
        <Spacer />
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaUnlock} />}
          title={'Risk Score'}
          description={'Aggregage Risk Score of SBOM'}
          amount={26}
        />
        <Spacer />
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaBug} />}
          title={'Vulnerabilities'}
          description={'Vulnerabilities included in SBOM'}
          amount={'18C, 10H, 16M, 8L'}
        />
        <Spacer />
      </Flex>
      <SBOMTable
        title={'SBOM'}
        captions={[
          'Component',
          'Version',
          'Relates to',
          'License',
          'Risk Score',
          'Vulnerabilities',
          'Last Updated',
          ''
        ]}
        data={sbom}
      />
    </Flex>
  )
}

export default SBOMs

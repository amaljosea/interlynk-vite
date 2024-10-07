import React from 'react'

import { Flex, Text } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import LynkSwitch from 'components/Misc/LynkSwitch'

import { useThemeColor } from 'hooks/useThemeColors'

const SBOMMonitorDefaults = () => {
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])

  return (
    <Card p='16px'>
      <CardHeader p='12px 5px' mb='12px'>
        <Text fontSize='lg' color={inverseSecondaryBgColor} fontWeight='bold'>
          SBOM Monitor Defaults
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex direction='column'>
          <Text fontSize='sm' color='gray.500' fontWeight='600' mb='20px'>
            Compliance
          </Text>
          <Flex align='center' mb='20px'>
            <LynkSwitch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              License Validation
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <LynkSwitch
              colorScheme='blue'
              me='10px'
              isChecked
              id='lic_conflict'
            />
            <Text
              noOfLines={1}
              fontSize='md'
              color='gray.500'
              fontWeight='400'
              htmlFor='lic_conflict'
            >
              License Conflict Detection
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <LynkSwitch
              colorScheme='blue'
              me='10px'
              isChecked
              id='isApprovedLicenses'
            />
            <Text
              noOfLines={1}
              fontSize='md'
              color='gray.500'
              fontWeight='400'
              htmlFor='isApprovedLicenses'
            >
              Approved License List
            </Text>
          </Flex>
          <Text
            fontSize='sm'
            color='gray.500'
            fontWeight='600'
            m='6px 0px 20px 0px'
          >
            Security
          </Text>
          <Flex align='center' mb='20px'>
            <LynkSwitch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Exploited Vulnerabilities
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <LynkSwitch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Unmaintained Component
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <LynkSwitch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Reputation Scoring
            </Text>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default SBOMMonitorDefaults

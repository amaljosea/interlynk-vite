// Chakra imports
import React from 'react'

import {
  Flex,
  Icon,
  Link,
  Switch,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

const SBOMLinkDefaults = ({ title }) => {
  // Chakra color mode
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card p='16px'>
      <CardHeader p='12px 5px' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          SBOM Link Defaults
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex direction='column'>
          <Text fontSize='sm' color='gray.500' fontWeight='600' mb='20px'>
            SBOM Content
          </Text>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Components
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Licenses
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Vulnerabilities
            </Text>
          </Flex>
          <Text
            fontSize='sm'
            color='gray.500'
            fontWeight='600'
            m='6px 0px 20px 0px'
          >
            SBOM Access
          </Text>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Requires email validation
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Requires terms acceptance
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Apply component redaction
            </Text>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default SBOMLinkDefaults

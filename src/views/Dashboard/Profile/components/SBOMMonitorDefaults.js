// Chakra imports
import { Flex, Switch, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import React from "react";

const SBOMMonitorDefaults = () => {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  return (
    <Card p='16px'>
      <CardHeader p='12px 5px' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          SBOM Monitor Defaults
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex direction='column'>
          <Text fontSize='sm' color='gray.500' fontWeight='600' mb='20px'>
            Compliance
          </Text>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              License Validation
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' checked='true' id='lic_conflict'/>
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400' htmlFor='lic_conflict'>
              License Conflict Detection
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked='true' id='isApprovedLicenses'/>
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400' htmlFor='isApprovedLicenses'>
              Approved License List
            </Text>
          </Flex>
          <Text
            fontSize='sm'
            color='gray.500'
            fontWeight='600'
            m='6px 0px 20px 0px'>
            Security
          </Text>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Exploited Vulnerabilities
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Unmaintained Component
            </Text>
          </Flex>
          <Flex align='center' mb='20px'>
            <Switch colorScheme='blue' me='10px' isChecked />
            <Text noOfLines={1} fontSize='md' color='gray.500' fontWeight='400'>
              Reputation Scoring
            </Text>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default SBOMMonitorDefaults;

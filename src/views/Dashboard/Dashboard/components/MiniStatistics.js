// Chakra imports
import {
  Box,
  Flex,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  useColorModeValue
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import IconBox from 'components/Icons/IconBox'
import React from 'react'

const MiniStatistics = ({ title, amount, icon }) => {
  const iconBlue = useColorModeValue('blue.300', 'blue.300')
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card minH='83px'>
      <CardBody>
        <Flex flexDirection='row' align='center' justify='center' w='100%'>
          <Stat me='auto'>
            <StatLabel
              fontSize='md'
              color='gray.600'
              fontWeight='semibold'
              pb='.1rem'
            >
              {title}
            </StatLabel>
            <Box height={5}>
              {title === 'Vulnerabilities' ? (
                <Stack mt={1} spacing={1} direction={'row'}>
                  <Tag variant='subtle' colorScheme='red'>
                    {amount?.critical || 0}
                  </Tag>
                  <Tag variant='subtle' colorScheme='orange'>
                    {amount?.high || 0}
                  </Tag>
                  <Tag variant='subtle' colorScheme='yellow'>
                    {amount?.medium || 0}
                  </Tag>
                  <Tag variant='subtle' colorScheme='green'>
                    {amount?.low || 0}
                  </Tag>
                  <Tag variant='subtle' colorScheme='gray'>
                    {amount?.unknown || 0}
                  </Tag>
                </Stack>
              ) : (
                <StatNumber fontSize='lg' color={textColor}>
                  {amount || 0}
                </StatNumber>
              )}
            </Box>
          </Stat>
          <IconBox h={'45px'} w={'45px'} bg={iconBlue}>
            {icon}
          </IconBox>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default MiniStatistics

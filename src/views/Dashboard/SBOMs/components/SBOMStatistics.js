import React from 'react'

import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue
} from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import IconBox from 'components/Icons/IconBox'

const SBOMStatistics = ({ icon, title, description, amount }) => {
  const iconTeal = useColorModeValue('teal.300', 'teal.300')
  const iconBlue = useColorModeValue('blue.300', 'blue.300')
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card minH='83px'>
      <CardBody>
        <Flex flexDirection='row' align='center' justify='center' w='100%'>
          <Stat me='auto'>
            <StatLabel
              fontSize='sm'
              color='gray.400'
              fontWeight='bold'
              pb='.1rem'
            >
              {title}
            </StatLabel>
            <Flex>
              <StatNumber fontSize='lg' color={textColor}>
                {amount}
              </StatNumber>
            </Flex>
          </Stat>
          <IconBox h={'45px'} w={'45px'} bg={iconBlue}>
            {icon}
          </IconBox>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default SBOMStatistics

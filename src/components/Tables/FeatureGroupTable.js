import React from 'react'

import { CheckIcon, CloseIcon } from '@chakra-ui/icons'
import { Box, Td, Text, Tr } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/react'

const FeatureGroup = ({ title, features }) => {
  // Colors for light and dark mode
  const featureHeadingBgColor = useColorModeValue('blue.300', 'blue.800')
  const rowBgColorEven = useColorModeValue('white', 'gray.800')
  const rowBgColorOdd = useColorModeValue('gray.100', 'gray.900')
  const checkIconColor = useColorModeValue('green.500', 'green.300')
  const closeIconColor = useColorModeValue('red.500', 'red.300')

  return (
    <>
      <Tr>
        <Td colSpan={3} p={0}>
          <Box
            bg={featureHeadingBgColor}
            borderRadius='5px'
            width='100%'
            p={2}
            fontWeight='bold'
            marginTop='10px'
          >
            <Text fontSize='md' padding='10px 15px' color='white'>
              {title}
            </Text>
          </Box>
        </Td>
      </Tr>
      {features.map((item, index) => (
        <Tr
          bg={index % 2 === 0 ? rowBgColorEven : rowBgColorOdd}
          key={item.feature}
        >
          <Td pl={6} w={'400px'}>
            <Text fontSize='xs'>{item.feature}</Text>
          </Td>
          <Td pl={2} w={'150px'}>
            {typeof item.val1 === 'string' ? (
              <Text fontSize='xs'>{item.val1}</Text>
            ) : item.val1 ? (
              <CheckIcon boxSize={3} color={checkIconColor} />
            ) : (
              <CloseIcon boxSize={3} color={closeIconColor} />
            )}
          </Td>
          <Td pl={8} w={'250px'}>
            {typeof item.val2 === 'string' ? (
              <Text fontSize='xs'>{item.val2}</Text>
            ) : item.val2 ? (
              <CheckIcon boxSize={3} color={checkIconColor} />
            ) : (
              <CloseIcon boxSize={3} color={closeIconColor} />
            )}
          </Td>
        </Tr>
      ))}
    </>
  )
}

export default FeatureGroup

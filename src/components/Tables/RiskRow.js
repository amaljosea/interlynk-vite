import React from 'react'

import { Button, Flex, Icon, Tag, Td, Text, Tr } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaEllipsisV } from 'react-icons/fa'

function VulnerabilityRow(props) {
  const { type, component, version, description, recommendation, score } = props
  const { inverseSecondaryBgColor, secondaryTextColor } = useThemeColor([
    'inverseSecondaryBgColor',
    'secondaryTextColor'
  ])
  const btnRef = React.useRef()
  const sevColor =
    score >= 10
      ? 'red'
      : score >= 6
        ? 'orange'
        : score >= 3
          ? 'yellow'
          : 'green'
  return (
    <Tr>
      <Td>
        <Tag size='md' key='md' variant='subtle' colorScheme={sevColor}>
          {score}
        </Tag>
      </Td>
      <Td>
        <Flex direction='row'>
          <Text fontSize='sm' color={inverseSecondaryBgColor}>
            {type}
          </Text>
        </Flex>
      </Td>
      <Td maxW='200px'>{description}</Td>
      <Td>{component}</Td>
      <Td>{version}</Td>
      <Td>{recommendation}</Td>
      <Td>
        <Button title='Risk actions' p='0px' bg='transparent' ref={btnRef}>
          <Icon as={FaEllipsisV} color={secondaryTextColor} cursor='pointer' />
        </Button>
      </Td>
    </Tr>
  )
}
export default VulnerabilityRow

import React from 'react'

import {
  Button,
  Flex,
  Icon,
  Tag,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import { FaEllipsisV } from 'react-icons/fa'

function VulnerabilityRow(props) {
  const { type, component, version, description, recommendation, score } = props
  const textColor = useColorModeValue('gray.700', 'white')
  const { isOpen, onOpen, onClose } = useDisclosure()
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
          <Text fontSize='sm' color={textColor}>
            {type}
          </Text>
        </Flex>
      </Td>
      <Td maxW='200px'>{description}</Td>
      <Td>{component}</Td>
      <Td>{version}</Td>
      <Td>{recommendation}</Td>
      <Td>
        <Button p='0px' bg='transparent' ref={btnRef} onClick={onOpen}>
          <Icon as={FaEllipsisV} color='gray.400' cursor='pointer' />
        </Button>
      </Td>
    </Tr>
  )
}
export default VulnerabilityRow

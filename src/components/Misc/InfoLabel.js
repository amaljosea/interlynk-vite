import { InfoIcon } from '@chakra-ui/icons'
import { Flex, Text, Tooltip } from '@chakra-ui/react'

const InfoLabel = ({ title, onCheck }) => {
  return (
    <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
      <Text fontSize={'sm'}>{title}</Text>
      <Tooltip label={onCheck} placement='top'>
        <InfoIcon color={'blue.500'} cursor={'pointer'} />
      </Tooltip>
    </Flex>
  )
}

export default InfoLabel

import { Flex, FormLabel, Icon, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaChevronDown } from 'react-icons/fa6'

const IdentifierLabel = ({ onClose, title }) => {
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])
  return (
    <FormLabel htmlFor={title}>
      <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
        <Icon
          fontSize={12}
          color={sameSecondaryText}
          cursor={'pointer'}
          onClick={onClose}
          as={FaChevronDown}
        />
        <Text>{title}</Text>
      </Flex>
    </FormLabel>
  )
}

export default IdentifierLabel

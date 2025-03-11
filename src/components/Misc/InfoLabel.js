import { InfoIcon } from '@chakra-ui/icons'
import { Flex, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const InfoLabel = ({ title, onCheck }) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  return (
    <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
      <Text fontSize={'sm'}>{title}</Text>
      {title !== 'Data License' && (
        <Tooltip label={onCheck} placement='top'>
          <InfoIcon color={primaryBlueText} cursor={'pointer'} />
        </Tooltip>
      )}
    </Flex>
  )
}

export default InfoLabel

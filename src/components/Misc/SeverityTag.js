import { sevColor } from 'utils/styleUtils'

import { Circle, HStack, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const SeverityTag = ({ value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return (
    <HStack>
      <Circle size='2' bg={value ? sevColor(value)?.bg : 'gray'} />
      <Text fontSize='sm' color={primaryTextColor} textTransform={'capitalize'}>
        {value || 'N/A'}
      </Text>
    </HStack>
  )
}

export default SeverityTag

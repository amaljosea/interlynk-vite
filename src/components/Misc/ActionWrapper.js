import { Flex, useColorModeValue } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const ActionWrapper = (props) => {
  const { primaryBgColor } = useThemeColor(['primaryBgColor'])

  const borderColor = useColorModeValue('#E2E8F0', '#4A5568')

  return (
    <Flex
      py={4}
      px={7}
      gap={3}
      left={0}
      right={0}
      bottom={0}
      bg={primaryBgColor}
      pos={'fixed'}
      alignItems={'center'}
      justifyContent={'flex-end'}
      borderTop={`1px solid ${borderColor}`}
      {...props}
    >
      {props?.children}
    </Flex>
  )
}

export default ActionWrapper

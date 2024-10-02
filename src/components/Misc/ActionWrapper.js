import { Flex } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const ActionWrapper = (props) => {
  const { primaryBgColor, grayBorderColor } = useThemeColor([
    'primaryBgColor',
    'grayBorderColor'
  ])

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
      borderTop={`1px solid ${grayBorderColor}`}
      {...props}
    >
      {props?.children}
    </Flex>
  )
}

export default ActionWrapper

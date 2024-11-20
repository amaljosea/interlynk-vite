import { Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

// Custom text for Header used in expanded table in productDetailsSbomNew
export const CustomText = ({ children, ...props }) => {
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])
  return (
    <Text
      fontSize='13px'
      fontWeight='bold'
      color={sameSecondaryText}
      textTransform='uppercase'
      letterSpacing='0.6px'
      {...props}
    >
      {children}
    </Text>
  )
}

import { CheckIcon } from '@chakra-ui/icons'

import { useThemeColor } from 'hooks/useThemeColors'

const CheckMark = ({ zIndex }) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  return (
    <CheckIcon
      w={5}
      h={5}
      bg={'white'}
      color={primaryBlueText}
      border={'1px solid #4299E1'}
      rounded={'full'}
      p={'4px'}
      position={'absolute'}
      right={-1}
      top={-1}
      zIndex={zIndex || 11}
    />
  )
}

export default CheckMark

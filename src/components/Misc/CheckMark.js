import { CheckIcon } from '@chakra-ui/icons'

import { useThemeColor } from 'hooks/useThemeColors'

const CheckMark = ({ zIndex }) => {
  const { primaryBlueText, secondaryBlueBorder } = useThemeColor([
    'primaryBlueText',
    'secondaryBlueBorder'
  ])
  return (
    <CheckIcon
      w={5}
      h={5}
      bg={'white'}
      color={primaryBlueText}
      border={`1px solid ${secondaryBlueBorder}`}
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

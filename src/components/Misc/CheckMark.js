import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleCheck } from 'react-icons/lu'

const CheckMark = ({ zIndex }) => {
  const { primaryBlueText, secondaryBlueBorder } = useThemeColor([
    'primaryBlueText',
    'secondaryBlueBorder'
  ])
  return (
    <LuCircleCheck
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

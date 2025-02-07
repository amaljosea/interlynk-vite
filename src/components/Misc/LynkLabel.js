import { InfoIcon } from '@chakra-ui/icons'
import { Flex, FormLabel, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const LynkFormLabel = ({ htmlFor, label, info }) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  return (
    <Flex alignItems={'flex-start'}>
      <FormLabel htmlFor={htmlFor}>{label}</FormLabel>
      {info && (
        <Tooltip label={info}>
          <InfoIcon fontSize={'sm'} color={primaryBlueText} />
        </Tooltip>
      )}
    </Flex>
  )
}

export default LynkFormLabel

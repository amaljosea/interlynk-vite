import { Box, Heading, Stack } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleCheck } from 'react-icons/lu'

const StepThree = () => {
  const { primarySuccessColor } = useThemeColor(['primarySuccessColor'])
  return (
    <Box width={'50%'} mx={'auto'}>
      <Stack
        dir='column'
        spacing={8}
        alignItems={'center'}
        justifyContent={'center'}
        textAlign={'center'}
        mt={32}
      >
        <LuCircleCheck color={primarySuccessColor} size={96} />
        <Heading fontWeight={'medium'} fontSize={20}>
          {/* {selectedVulns.length} out of {mergeData.length}  */}
          Vulnerability status updated successfully.
        </Heading>
      </Stack>
    </Box>
  )
}

export default StepThree

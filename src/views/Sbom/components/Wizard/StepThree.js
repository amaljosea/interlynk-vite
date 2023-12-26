import { Box, Stack, Heading } from '@chakra-ui/react'
import { useGlobalState } from 'hooks/useGlobalState'
import { FaCheckCircle } from 'react-icons/fa'

const StepThree = () => {
  const { prodVulnState } = useGlobalState()
  const { mergeData, selectedVulns } = prodVulnState
  
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
        <FaCheckCircle color='#48BB78' size={96} />
        <Heading fontWeight={'medium'} fontSize={20} fontFamily={'inherit'}>
          {selectedVulns.length} out of {mergeData.length} vulnerability status
          updated.
        </Heading>
      </Stack>
    </Box>
  )
}

export default StepThree

import { Box, Heading, Stack } from '@chakra-ui/react'

import { FaCheckCircle } from 'react-icons/fa'

const StepThree = () => {
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
          {/* {selectedVulns.length} out of {mergeData.length}  */}
          Vulnerability status updated successfully.
        </Heading>
      </Stack>
    </Box>
  )
}

export default StepThree

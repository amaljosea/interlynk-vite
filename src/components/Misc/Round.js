import { Box, Flex, Tooltip } from '@chakra-ui/react'

const Round = ({ bg, children, label }) => {
  return (
    <Tooltip label={label} placement='top'>
      <Box
        width={10}
        height={10}
        as={Flex}
        alignItems={'center'}
        justifyContent={'center'}
        borderRadius={'full'}
        bg={bg}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

export default Round

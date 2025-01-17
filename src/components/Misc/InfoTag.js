import { Tag } from '@chakra-ui/react'

const InfoTag = ({ children }) => {
  return (
    <Tag
      size='sm'
      minW='150px'
      maxW={'250px'}
      variant='subtle'
      colorScheme='blue'
      justifyContent={'center'}
      sx={{ textAlign: 'right', py: 1, wordBreak: 'break-all' }}
    >
      {children}
    </Tag>
  )
}

export default InfoTag

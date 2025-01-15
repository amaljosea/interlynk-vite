import { Tag, TagLabel } from '@chakra-ui/react'

const InfoTag = ({ children }) => {
  return (
    <Tag
      size='sm'
      minW='120px'
      variant='subtle'
      colorScheme='blue'
      maxW={'fit-content'}
      justifyContent={'center'}
      sx={{ ml: 'auto', py: 1, textAlign: 'right', wordBreak: 'break-all' }}
    >
      <TagLabel>{children}</TagLabel>
    </Tag>
  )
}

export default InfoTag

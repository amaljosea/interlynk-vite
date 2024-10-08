import { Tag } from '@chakra-ui/react'

const InfoTag = ({ children }) => {
  return (
    <Tag
      size='sm'
      variant='subtle'
      colorScheme='blue'
      sx={{ ml: 'auto', py: 1, textAlign: 'right', wordBreak: 'break-all' }}
    >
      {children}
    </Tag>
  )
}

export default InfoTag

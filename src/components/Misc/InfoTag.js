import { Tag } from '@chakra-ui/react'

const InfoTag = ({ children }) => {
  return (
    <Tag
      size='sm'
      variant='subtle'
      justifyContent={'center'}
      sx={{
        width: '200px',
        ml: 'auto',
        py: 1,
        textAlign: 'center',
        alignItems: 'center',
        wordBreak: 'break-all'
      }}
    >
      {children}
    </Tag>
  )
}

export default InfoTag

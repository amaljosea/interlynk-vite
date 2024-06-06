import { Tag } from '@chakra-ui/react'

const CustomTag = ({ children }) => (
  <Tag
    py={1}
    ml={'auto'}
    size='sm'
    variant='subtle'
    colorScheme={'blue'}
    wordBreak={'break-all'}
    textAlign={'right'}
  >
    {children}
  </Tag>
)

export default CustomTag

import { Tag, TagLabel, Tooltip } from '@chakra-ui/react'

const VulnBadge = ({ color, children, label, onClick }) => {
  return (
    <Tooltip label={label} placement='top'>
      <Tag
        size='md'
        key='md'
        variant='subtle'
        width={10}
        colorScheme={color}
        onClick={onClick}
        cursor={'pointer'}
      >
        <TagLabel mx={'auto'}>{children}</TagLabel>
      </Tag>
    </Tooltip>
  )
}

export default VulnBadge

import { Spinner, Tag, TagLabel, Tooltip } from '@chakra-ui/react'

const VulnBadge = ({ color, children, label, status, onClick }) => {
  return (
    <Tooltip label={label} placement='top'>
      <Tag
        size='md'
        key='md'
        variant='subtle'
        width={14}
        colorScheme={color}
        onClick={onClick}
        cursor={'pointer'}
      >
        <TagLabel mx={'auto'}>
          {status === 'IN_PROGRESS' ? <Spinner size='xs' mt={0.5} /> : children}
        </TagLabel>
      </Tag>
    </Tooltip>
  )
}

export default VulnBadge

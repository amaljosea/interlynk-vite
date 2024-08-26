import { Spinner, Tag, TagLabel, Tooltip } from '@chakra-ui/react'

const VulnBadge = ({ color, children, label, status, onClick }) => {
  const labels = ['Fail', 'Pass', 'Warn', 'Inform', 'Skipped', 'Error']
  const isPolicy = labels?.includes(label)
  return (
    <Tooltip label={label} placement='top'>
      <Tag
        variant='subtle'
        onClick={onClick}
        cursor={'pointer'}
        colorScheme={color}
        w={isPolicy ? '12' : '14'}
      >
        <TagLabel mx={'auto'}>
          {status === 'IN_PROGRESS' ? <Spinner size='xs' mt={0.5} /> : children}
        </TagLabel>
      </Tag>
    </Tooltip>
  )
}

export default VulnBadge

import { useParams } from 'react-router-dom'

import { Spinner, Tag, TagLabel, Tooltip } from '@chakra-ui/react'

const statuses = [
  'Unspecified',
  'In Triage',
  'Affected',
  'Fixed',
  'Not Affected'
]

const VulnBadge = ({ color, children, label, status, onClick }) => {
  const params = useParams()
  const sbomId = params?.sbomid
  const isStatus = statuses?.includes(label)

  return (
    <Tooltip label={label} placement='top'>
      <Tag
        width={'16'}
        onClick={onClick}
        cursor={'pointer'}
        colorScheme={color}
        p={sbomId ? 0 : 'inherit'}
        variant={isStatus ? 'solid' : 'subtle'}
      >
        <TagLabel
          mx={'auto'}
          p={sbomId ? 0 : 'inherit'}
          fontSize={[sbomId ? '12px' : '13px', sbomId ? '13px' : '14px']}
        >
          {status === 'IN_PROGRESS' ? (
            <Spinner size='xs' mt={0.5} />
          ) : (
            <span id={`vulnCount${label}`}>{children}</span>
          )}
        </TagLabel>
      </Tag>
    </Tooltip>
  )
}

export default VulnBadge

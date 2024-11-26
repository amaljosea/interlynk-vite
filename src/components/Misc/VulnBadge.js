import { useParams } from 'react-router-dom'

import { Spinner, Tag, TagLabel, Tooltip } from '@chakra-ui/react'

import useQueryParam from 'hooks/useQueryParam'

const VulnBadge = ({ color, children, label, status, onClick }) => {
  const params = useParams()
  const sbomId = params?.sbomid
  const tab = useQueryParam('tab')

  return (
    <Tooltip label={label} placement='top'>
      <Tag
        variant='subtle'
        onClick={onClick}
        cursor={'pointer'}
        colorScheme={color}
        p={sbomId ? 0 : 'inherit'}
        width={sbomId && tab !== 'parts' ? 'auto' : '14'}
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

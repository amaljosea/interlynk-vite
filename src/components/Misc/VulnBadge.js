import { useParams } from 'react-router-dom'
import { vulnStatusTypes } from 'variables/general'

import { Spinner, Tag, TagLabel, Tooltip } from '@chakra-ui/react'

const VulnBadge = ({ color, children, label, status, onClick }) => {
  const params = useParams()
  const sbomId = params?.sbomid
  const isStatus = vulnStatusTypes?.includes(label)

  return (
    <Tooltip label={label} placement='top'>
      <Tag
        width={'60px'}
        onClick={onClick}
        cursor={'pointer'}
        colorScheme={color}
        variant={isStatus ? 'solid' : 'subtle'}
      >
        <TagLabel
          mx={'auto'}
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

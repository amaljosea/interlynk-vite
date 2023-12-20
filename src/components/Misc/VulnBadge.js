import { Badge, Tooltip } from '@chakra-ui/react'

const VulnBadge = ({ color, children, label, onClick }) => {
  return (
    <Tooltip label={label} placement='top'>
      <Badge
        width={10}
        textAlign='center'
        fontSize={14}
        fontWeight={'medium'}
        variant='subtle'
        colorScheme={color}
        borderRadius='sm'
        cursor={'pointer'}
        onClick={onClick}
      >
        {children}
      </Badge>
    </Tooltip>
  )
}

export default VulnBadge

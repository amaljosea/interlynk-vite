import { Tag, Tooltip } from '@chakra-ui/react'

const Round = ({ bg, children, label }) => {
  return (
    <Tooltip label={label} placement='top'>
      <Tag
        width={10}
        height={10}
        alignItems={'center'}
        justifyContent={'center'}
        borderRadius={'full'}
        variant={'subtle'}
        colorScheme={bg}
      >
        {children}
      </Tag>
    </Tooltip>
  )
}

export default Round

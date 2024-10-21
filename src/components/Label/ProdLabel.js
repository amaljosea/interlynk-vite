import { hexToRGBA } from 'utils'

import { Tag } from '@chakra-ui/react'

const ProdLabel = ({ item }) => {
  return (
    <Tag
      size='sm'
      rounded={'full'}
      bg={hexToRGBA(item?.color, 0.1)}
      borderWidth={'thin'}
      borderColor={item?.color}
      sx={{ py: 1, w: 'fit-content', dropShadow: 'inner', color: item?.color }}
    >
      {item?.name}
    </Tag>
  )
}

export default ProdLabel

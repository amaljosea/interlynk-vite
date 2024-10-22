import { hexToRGBA } from 'utils'

import { Tag } from '@chakra-ui/react'

const ProdLabel = ({ item }) => {
  return (
    <Tag
      size='sm'
      w='fit-content'
      rounded={'full'}
      borderWidth={'thin'}
      data-testid='product_label'
      bg={hexToRGBA(item?.color, 0.1)}
      borderColor={hexToRGBA(item?.color, 0.4)}
      sx={{ h: '20px', pt: 0.4, dropShadow: 'inner', color: item?.color }}
    >
      {item?.name}
    </Tag>
  )
}

export default ProdLabel

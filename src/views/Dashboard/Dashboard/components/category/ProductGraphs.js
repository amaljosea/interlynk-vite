import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import ProductLabels from '../ProductLabels'
import ProductLifestages from '../ProductLifestages'

const ProductGraphs = () => {
  return (
    <Stack spacing={4} mt={6}>
      <Heading size={'md'}>Products</Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <ProductLifestages />
        <ProductLabels />
      </SimpleGrid>
    </Stack>
  )
}

export default ProductGraphs

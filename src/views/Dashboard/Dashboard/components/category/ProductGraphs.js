import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import ProductLabels from '../ProductLabels'
import ProductLifestages from '../ProductLifestages'
import VersionLifestages from '../VersionLifestage'

const ProductGraphs = () => {
  const { isFreeTier } = useGlobalQueryContext()

  return (
    <Stack spacing={4} mt={6}>
      <Heading size={'md'}>Products</Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <ProductLifestages />
        <VersionLifestages />
        {!isFreeTier && <ProductLabels />}
      </SimpleGrid>
    </Stack>
  )
}

export default ProductGraphs

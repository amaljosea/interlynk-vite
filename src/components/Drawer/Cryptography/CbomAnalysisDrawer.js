import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Box, Center, SimpleGrid, Text } from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'

import { GetCryptoData } from 'graphQL/Queries'

import AllAssetsByAlgorithmsChart from './AllAssetsByAlgorithmsChart'
import AllAssetsByTypeChart from './AllAssetsByTypeChart'
import AllAssetsQuantumSafetyChart from './AllAssetsQuantumSafetyChart'
import UnsafeAssetsByPrimitivesChart from './UnsafeAssetsByPrimitivesChart'

const CBOMAnalysisDrawer = ({ isOpen, onClose }) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const { data, error } = useQuery(GetCryptoData, {
    skip: !isOpen,
    variables: {
      sbomId: sbomId,
      projectId: productId,
      first: 200,
      kind: ['cryptographic-asset']
    }
  })

  return (
    <LynkDrawer
      title={'CBOM Analysis'}
      isOpen={isOpen}
      onClose={onClose}
      noFooter
      size='xl'
      placement='bottom'
    >
      <Box p={6}>
        {error && (
          <Center height='300px'>
            <Text>Failed to load CBOM data. Please try again.</Text>
          </Center>
        )}

        {!error && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
            <AllAssetsByTypeChart data={data} />
            <AllAssetsQuantumSafetyChart data={data} />
            <UnsafeAssetsByPrimitivesChart data={data} />
            <AllAssetsByAlgorithmsChart data={data} />
          </SimpleGrid>
        )}
      </Box>
    </LynkDrawer>
  )
}

export default CBOMAnalysisDrawer

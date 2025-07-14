import { schemeCategory10, schemeSet3 } from 'd3-scale-chromatic'
import { Cell, Pie, PieChart } from 'recharts'

import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { QUANTUM_UNSAFE_BLACKLIST } from './AllAssetsQuantumSafetyChart'

const UnsafeAssetsByPrimitivesChart = ({ data, loading }) => {
  const { primaryBgColor, grayBorderColor } = useThemeColor([
    'primaryBgColor',
    'grayBorderColor'
  ])

  const D3_FALLBACK_COLORS = [...schemeCategory10, ...schemeSet3]

  const getPrimitiveColor = (index) => {
    return D3_FALLBACK_COLORS[index % D3_FALLBACK_COLORS.length]
  }

  if (loading) {
    return <Skeleton minHeight='300px' borderRadius='lg' shadow='sm' />
  }

  const unsafeAssetsGroupedByPrimitive = data?.sbom?.components?.nodes.reduce(
    (acc, component) => {
      const componentName = component.name
      const assetType = component.cryptoProperty?.assetType
      const primitive = component.cryptoProperty?.algorithmProperty?.primitive

      const isAlgorithmAndBlacklisted =
        assetType === 'algorithm' &&
        QUANTUM_UNSAFE_BLACKLIST.includes(componentName)

      if (isAlgorithmAndBlacklisted) {
        if (primitive) {
          acc[primitive] = (acc[primitive] || 0) + 1
        } else {
          acc['unknown-primitive'] = (acc['unknown-primitive'] || 0) + 1
        }
      }
      return acc
    },
    {}
  )

  const chartData = Object.keys(unsafeAssetsGroupedByPrimitive).map(
    (primitiveKey, index) => ({
      name:
        primitiveKey === 'unknown-primitive'
          ? 'Unknown Primitive'
          : primitiveKey.replace(/-/g, ' ').replace(/\b\w/g, (char) => char),
      value: unsafeAssetsGroupedByPrimitive[primitiveKey],
      color: getPrimitiveColor(index)
    })
  )

  chartData.sort((a, b) => b.value - a.value)

  const totalAssets = chartData.reduce((sum, entry) => sum + entry.value, 0)

  if (!chartData.length) {
    return (
      <Box
        p={4}
        borderWidth='1px'
        borderRadius='lg'
        shadow='sm'
        minHeight='300px'
        display='flex'
        alignItems='center'
        justifyContent='center'
        bg={primaryBgColor}
      >
        <Text>
          No unsafe cryptographic assets with defined primitives found based on
          the current blacklist.
        </Text>
      </Box>
    )
  }

  return (
    <Box
      p={4}
      borderWidth='1px'
      borderRadius='lg'
      shadow='sm'
      minHeight='300px'
    >
      <Heading size='sm' mb={4}>
        Unsafe Assets by Primitive
      </Heading>

      <SimpleGrid w={'100%'} columns={2} alignItems={'center'}>
        <Flex justify='center' align='center' position='relative'>
          <PieChart width={180} height={180}>
            <Pie
              cx='50%'
              cy='50%'
              data={chartData}
              dataKey='value'
              innerRadius={50}
              outerRadius={70}
              paddingAngle={0}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <Box position='absolute' textAlign='center'>
            <Text fontSize='lg' fontWeight='bold'>
              {totalAssets || 0}
            </Text>
            <Text fontSize='sm' color='gray'>
              Total
            </Text>
          </Box>
        </Flex>

        <VStack spacing={2} align='start' mt={4}>
          {chartData.map((item) => (
            <Flex
              gap={4}
              width={'90%'}
              key={item.name}
              align='center'
              justifyContent={'space-between'}
              borderBottom={`1px solid ${grayBorderColor}`}
            >
              <Flex align='center' w={'130px'}>
                <Box
                  mr='2'
                  w='10px'
                  h='10px'
                  bg={item.color}
                  borderRadius='full'
                />
                <Text fontSize={'sm'}>{item.name}</Text>
              </Flex>
              <Text fontSize={'md'} fontWeight='semibold'>
                {item.value}
              </Text>
            </Flex>
          ))}
        </VStack>
      </SimpleGrid>
    </Box>
  )
}

export default UnsafeAssetsByPrimitivesChart

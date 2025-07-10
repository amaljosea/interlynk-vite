import { schemeCategory10, schemeSet3 } from 'd3-scale-chromatic'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

import { Box, Skeleton, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { QUANTUM_UNSAFE_BLACKLIST } from './AllAssetsQuantumSafetyChart'

const UnsafeAssetsByPrimitivesChart = ({ data }) => {
  const { primaryBgColor } = useThemeColor(['primaryBgColor'])

  const D3_FALLBACK_COLORS = [...schemeCategory10, ...schemeSet3]

  const getPrimitiveColor = (primitiveValue, index) => {
    return D3_FALLBACK_COLORS[index % D3_FALLBACK_COLORS.length]
  }

  if (!data) {
    return <Skeleton height='400px' borderRadius='lg' shadow='sm' />
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
          acc['unknown'] = (acc['unknown'] || 0) + 1
        }
      }
      return acc
    },
    {}
  )

  const chartData = Object.keys(unsafeAssetsGroupedByPrimitive).map(
    (primitiveKey) => ({
      name: primitiveKey.replace(/-/g, ' ').replace(/\b\w/g, (char) => char),
      value: unsafeAssetsGroupedByPrimitive[primitiveKey]
    })
  )

  chartData.sort((a, b) => b.value - a.value)

  if (!chartData.length) {
    return (
      <Box
        p={4}
        borderRadius='md'
        bg={primaryBgColor}
        minH='300px'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Text>
          No unsafe cryptographic assets with defined primitives found based on
          the current blacklist.
        </Text>
      </Box>
    )
  }

  return (
    <Box p={4} borderWidth='1px' borderRadius='lg' shadow='sm' height='400px'>
      <Text fontSize='xl' fontWeight='semibold' mb={4} textAlign='center'>
        Unsafe Assets by Primitive
      </Text>
      <ResponsiveContainer width='100%' height='80%'>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey='value'
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={getPrimitiveColor(
                  entry.name.toLowerCase().replace(/ /g, '-'),
                  index
                )}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} assets`, name]} />
          <Legend
            layout='vertical'
            align='right'
            verticalAlign='middle'
            wrapperStyle={{ paddingLeft: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default UnsafeAssetsByPrimitivesChart

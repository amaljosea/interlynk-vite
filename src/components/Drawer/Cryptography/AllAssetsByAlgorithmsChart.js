import { schemeCategory10, schemePaired, schemeSet3 } from 'd3-scale-chromatic'
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

const AllAssetsByAlgorithmsChart = ({ data }) => {
  const { primaryBgColor } = useThemeColor(['primaryBgColor'])

  const D3_COLORS = [...schemeCategory10, ...schemeSet3, ...schemePaired]

  if (!data) {
    return <Skeleton height='400px' borderRadius='lg' shadow='sm' />
  }

  const algorithmCounts = data?.sbom?.components?.nodes.reduce(
    (acc, component) => {
      if (
        component.cryptoProperty &&
        component.cryptoProperty.assetType === 'algorithm'
      ) {
        const algorithmName = component.name || 'Unknown Algorithm'
        acc[algorithmName] = (acc[algorithmName] || 0) + 1
      }
      return acc
    },
    {}
  )

  const chartData = algorithmCounts
    ? Object.keys(algorithmCounts)
        .map((name) => ({
          name: name,
          value: algorithmCounts[name]
        }))
        .sort((a, b) => b.value - a.value)
    : []

  const getDynamicColor = (index) => D3_COLORS[index % D3_COLORS.length]

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
        <Text>No cryptographic algorithms found to display.</Text>
      </Box>
    )
  }

  const displayChartData = chartData

  return (
    <Box p={4} borderWidth='1px' borderRadius='lg' shadow='sm' height='400px'>
      <Text fontSize='xl' fontWeight='semibold' mb={4} textAlign='center'>
        All Assets by Algorithms
      </Text>
      <ResponsiveContainer width='100%' height='80%'>
        <PieChart>
          <Pie
            data={displayChartData}
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={90}
            paddingAngle={1}
            dataKey='value'
            // label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            // labelLine={false}
          >
            {displayChartData.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={getDynamicColor(index)} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} algorithms`, name]} />
          <Legend
            layout='horizontal'
            verticalAlign='bottom'
            align='center'
            wrapperStyle={{
              paddingTop: '10px',
              width: '100%',
              maxHeight: '100px',
              overflowY: 'auto',
              fontSize: '14px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default AllAssetsByAlgorithmsChart

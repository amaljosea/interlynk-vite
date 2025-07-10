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

const AllAssetsByTypeChart = ({ data }) => {
  const {
    primaryBlueText,
    primarySuccessColor,
    lynkYellowColor,
    lightTealBorder,
    customDarkBlue,
    primaryBgColor
  } = useThemeColor([
    'primaryBlueText',
    'primarySuccessColor',
    'lynkYellowColor',
    'lightTealBorder',
    'customDarkBlue',
    'primaryBgColor'
  ])

  const ASSET_TYPE_COLORS = {
    Algorithm: primaryBlueText,
    Certificate: primarySuccessColor,
    Protocol: lynkYellowColor,
    'Related Crypto Material': lightTealBorder
  }

  if (!data) {
    return <Skeleton height='400px' borderRadius='lg' shadow='sm' />
  }

  const assetTypeCounts = data?.sbom?.components?.nodes.reduce(
    (acc, component) => {
      if (component.cryptoProperty && component.cryptoProperty.assetType) {
        const type = component.cryptoProperty.assetType
        acc[type] = (acc[type] || 0) + 1
      }
      return acc
    },
    {}
  )

  const chartData = assetTypeCounts
    ? Object.keys(assetTypeCounts).map((type) => ({
        name: type
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        value: assetTypeCounts[type]
      }))
    : []

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
        <Text>No cryptographic assets found to display.</Text>
      </Box>
    )
  }

  return (
    <Box p={4} borderWidth='1px' borderRadius='lg' shadow='sm' height='400px'>
      <Text fontSize='xl' fontWeight='semibold' mb={4} textAlign='center'>
        All Assets by Type
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
                key={`cell-${index}`}
                fill={ASSET_TYPE_COLORS[entry.name] || customDarkBlue}
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

export default AllAssetsByTypeChart

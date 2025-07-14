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

const AllAssetsByTypeChart = ({ data, loading }) => {
  const {
    primaryBlueText,
    primarySuccessColor,
    lynkYellowColor,
    lightTealBorder,
    customDarkBlue,
    primaryBgColor,
    grayBorderColor
  } = useThemeColor([
    'primaryBlueText',
    'primarySuccessColor',
    'lynkYellowColor',
    'lightTealBorder',
    'customDarkBlue',
    'primaryBgColor',
    'grayBorderColor'
  ])

  const ASSET_TYPE_COLORS_MAP = {
    algorithm: { name: 'Algorithm', color: primaryBlueText },
    certificate: { name: 'Certificate', color: primarySuccessColor },
    protocol: { name: 'Protocol', color: lynkYellowColor },
    'related-crypto-material': {
      name: 'Related Crypto',
      color: lightTealBorder
    }
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

  const chartData = Object.keys(assetTypeCounts || {})
    .map((typeKey) => {
      const mappedInfo = ASSET_TYPE_COLORS_MAP[typeKey]
      const name = mappedInfo
        ? mappedInfo.name
        : typeKey
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
      const color = mappedInfo ? mappedInfo.color : customDarkBlue // Use a default fallback color

      return {
        name,
        value: assetTypeCounts[typeKey],
        color
      }
    })
    .filter((item) => item.value > 0)

  const totalAssets = chartData.reduce((sum, entry) => sum + entry.value, 0)

  if (loading) {
    return <Skeleton minHeight='300px' borderRadius='lg' shadow='sm' />
  }

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
        <Text>No cryptographic assets found to display.</Text>
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
        All Assets by Type
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
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
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
                <Text fontSize={'sm'} textTransform={'capitalize'}>
                  {item.name}
                </Text>
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

export default AllAssetsByTypeChart

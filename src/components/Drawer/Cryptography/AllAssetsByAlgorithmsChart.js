import { schemeCategory10, schemePaired, schemeSet3 } from 'd3-scale-chromatic'
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

const AllAssetsByAlgorithmsChart = ({ data, loading }) => {
  const { primaryBgColor, grayBorderColor } = useThemeColor([
    'primaryBgColor',
    'grayBorderColor'
  ])

  const D3_COLORS = [...schemeCategory10, ...schemeSet3, ...schemePaired]

  const getDynamicColor = (index) => D3_COLORS[index % D3_COLORS.length]

  if (loading) {
    return <Skeleton minHeight='300px' borderRadius='lg' shadow='sm' />
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

  const chartData = Object.keys(algorithmCounts || {})
    .map((name, index) => ({
      name: name,
      value: algorithmCounts[name],
      color: getDynamicColor(index)
    }))
    .sort((a, b) => b.value - a.value)
    .filter((item) => item.value > 0)

  const totalAlgorithms = chartData.reduce((sum, entry) => sum + entry.value, 0)

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
        <Text>No cryptographic algorithms found to display.</Text>
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
        All Assets by Algorithms
      </Heading>

      <SimpleGrid w={'100%'} columns={2} alignItems={'flex-start'}>
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
              {totalAlgorithms || 0}
            </Text>
            <Text fontSize='sm' color='gray'>
              Total
            </Text>
          </Box>
        </Flex>
        <Box mt={4} maxHeight='200px' overflowY='auto' pr={2} flexGrow={1}>
          <VStack spacing={2} align='start' w='100%'>
            {chartData.map((item) => (
              <Flex
                gap={4}
                width={'100%'}
                key={item.name}
                align='center'
                justifyContent={'space-between'}
                borderBottom={`1px solid ${grayBorderColor}`}
                pb={1}
              >
                <Flex align='center' flex={1} minW={0}>
                  <Box
                    mr='2'
                    minW='10px'
                    h='10px'
                    bg={item.color}
                    borderRadius='full'
                  />
                  <Text
                    fontSize={'sm'}
                    whiteSpace='normal'
                    wordBreak='break-word'
                  >
                    {item.name}
                  </Text>
                </Flex>
                <Text
                  fontSize={'md'}
                  fontWeight='semibold'
                  flexShrink={0}
                  ml={2}
                >
                  {item.value}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default AllAssetsByAlgorithmsChart

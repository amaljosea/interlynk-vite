import { Cell, Pie, PieChart } from 'recharts'

import { Box, Circle, Flex, Stack, Text } from '@chakra-ui/react'

const MetricPieChart = ({ data }) => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    minW='180px'
    maxW='200px'
    flexShrink={0}
  >
    <PieChart width={140} height={110}>
      <Pie
        cx='50%'
        cy='50%'
        data={data}
        dataKey='value'
        innerRadius={30}
        outerRadius={50}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
    <Stack>
      {data.map((entry, index) => (
        <Flex key={index} justifyContent='space-between'>
          <Flex alignItems='start' gap={1}>
            <Circle mt={1} bg={entry.color} size={2} />
            <Text color={entry.color} fontSize={12}>
              {entry.name}:
            </Text>
          </Flex>
          <Text color={entry.color} fontSize={12} ml={2}>
            {entry.value}
          </Text>
        </Flex>
      ))}
    </Stack>
  </Box>
)

export default MetricPieChart

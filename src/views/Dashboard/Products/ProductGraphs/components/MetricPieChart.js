import { Cell, Pie, PieChart } from 'recharts'

import { Circle, Flex, Stack, Text } from '@chakra-ui/react'

const MetricPieChart = ({ data }) => (
  <Flex gap={5} justifyContent='center' alignItems='center' flexShrink={0}>
    <PieChart width={110} height={110}>
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
  </Flex>
)

export default MetricPieChart

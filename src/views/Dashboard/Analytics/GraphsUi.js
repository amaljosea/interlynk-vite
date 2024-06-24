import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { Flex } from '@chakra-ui/react'

export const GraphUi = ({ dataForGraph }) => {
  return (
    <Flex mt={4} gap={8} width={'100%'} flexWrap={'wrap'} alignItems={'center'}>
      <LineChart width={500} height={300} data={dataForGraph}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='date' />
        <YAxis />
        <Tooltip labelStyle={{ color: '#4A5568' }} />
        <Legend />
        <Line
          type='monotone'
          dataKey='licensesCount'
          name='License Count'
          stroke='#3182CE'
          activeDot={{ r: 8 }}
        />
      </LineChart>
      <LineChart width={500} height={300} data={dataForGraph}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='date' />
        <YAxis />
        <Tooltip labelStyle={{ color: '#4A5568' }} />
        <Legend />
        <Line
          type='monotone'
          dataKey='componentsCount'
          name='Components Count'
          stroke='#3182CE'
          activeDot={{ r: 8 }}
        />
      </LineChart>
      <LineChart width={500} height={300} data={dataForGraph}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='date' />
        <YAxis />
        <Tooltip labelStyle={{ color: '#4A5568' }} />
        <Legend />
        <Line
          type='monotone'
          dataKey='vulnerabilityCount'
          name='Vulnerability Count'
          stroke='#3182CE'
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </Flex>
  )
}

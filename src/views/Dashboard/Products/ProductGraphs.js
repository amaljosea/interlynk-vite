/* eslint-disable no-unreachable */
import React from 'react'
import { Bar, BarChart, Line, LineChart } from 'recharts'
import { shouldShowDemoFeatures } from 'utils/shouldShowDemoFeatures'

import { Box, Text } from '@chakra-ui/react'

const data2 = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100
  }
]

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100
  }
]

export const ProductGraphs = () => {
  // temp setup
  return null

  if (!shouldShowDemoFeatures()) {
    return null
  }
  return (
    <Box display='flex' justifyContent='space-between'>
      <Box>
        <Box>
          <BarChart width={100} height={40} data={data}>
            <Bar dataKey='uv' fill='#8884d8' />
          </BarChart>
          <Text>Component trend</Text>
        </Box>
        <Box>
          <BarChart width={100} height={40} data={data}>
            <Bar dataKey='uv' fill='red' />
          </BarChart>
          <Text>License trend</Text>
        </Box>
      </Box>
      <Box>
        <Box>
          <LineChart width={100} height={40} data={data}>
            <Line type='monotone' dataKey='uv' stroke='green' />
            <Line type='monotone' dataKey='pv' stroke='red' />
            <Line type='monotone' dataKey='amt' stroke='black' />
          </LineChart>
          Vulnerability trend
        </Box>
        <Box>
          <LineChart width={100} height={40} data={data}>
            <Line type='monotone' dataKey='uv' stroke='green' />
            <Line type='monotone' dataKey='pv' stroke='red' />
            <Line type='monotone' dataKey='amt' stroke='black' />
          </LineChart>
          Policy trend
        </Box>
      </Box>
      <Box>
        <Box>
          <LineChart width={100} height={40} data={data}>
            <Line type='monotone' dataKey='pv' stroke='#8884d8' />
          </LineChart>
          Quality score trend
        </Box>
        <Box>
          <LineChart width={100} height={40} data={data2}>
            <Line type='monotone' dataKey='uv' stroke='black' />
          </LineChart>
          Health score trend
        </Box>
      </Box>
    </Box>
  )
}

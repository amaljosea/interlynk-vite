/* eslint-disable no-restricted-syntax */
import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { filterString } from 'utils'

import { Flex, Heading, Select, Stack, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import { useThemeColor } from 'hooks/useThemeColors'

const LynkLineChart = ({ title, data, options, onChange, days }) => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])
  const keys =
    data?.length > 0 ? Object.keys(data[0]).filter((key) => key !== 'date') : []

  const [activeKey, setActiveKey] = useState('all')
  const [dataKeys, setDataKeys] = useState(keys)

  const handleFilter = (e) => {
    setActiveKey(e.target.value)
    const result = keys?.filter((item) => item === e.target.value)
    setDataKeys(result?.length > 0 ? result : keys)
  }

  const placeHolder = title?.split(' ')

  return (
    <Card maxH='100%'>
      <Flex justify='space-between' align='center'>
        <Stack spacing={1}>
          <Heading fontSize={'lg'}>{title}</Heading>
        </Stack>
        <Flex gap='2'>
          <Select
            size='sm'
            w={'140px'}
            value={activeKey}
            onChange={handleFilter}
            textTransform={'capitalize'}
            placeholder={`- ${placeHolder[2]} -` || 'Select'}
          >
            <option value='all'>All</option>
            {keys?.map((item, index) => (
              <option
                key={index}
                value={item}
                style={{ textTransform: 'capitalize' }}
              >
                {filterString(item)}
              </option>
            ))}
          </Select>
          <Select
            size='sm'
            w={'160px'}
            value={days}
            placeholder='- Time -'
            onChange={(e) => onChange(e.target.value)}
          >
            <option value={7}>Last 7 days</option>
            <option value={10}>Last 10 days</option>
            <option value={15}>Last 15 days</option>
          </Select>
        </Flex>
      </Flex>
      <CardBody mt={6}>
        <Stack w='100%'>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  color: 'black',
                  textTransform: 'capitalize',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              />
              {dataKeys?.map((key, index) => (
                <Line
                  key={index}
                  type='monotone'
                  dataKey={key}
                  stroke={options[key]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <Text fontSize={'sm'} textAlign={'center'} color={secondaryTextColor}>
            The data displayed for demonstration purposes only. Actual data will
            be available soon. Stay tuned
          </Text>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default LynkLineChart

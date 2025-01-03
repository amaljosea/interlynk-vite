import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { useThemeColor } from 'hooks/useThemeColors'

const CustomizedAxisTick = ({ x, y, payload, xOffset = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={xOffset}
      y={0}
      dy={16}
      textAnchor='end'
      // eslint-disable-next-line
      fill='#666'
      transform='scale(.7)'
    >
      {payload.value}
    </text>
  </g>
)

export const SingleGraph = ({ data, lines }) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  return (
    <ResponsiveContainer aspect={2.5} debounce={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey='date'
          tick={<CustomizedAxisTick />}
          xOffset={50}
          padding={{ right: 20 }}
        />
        <YAxis tick={<CustomizedAxisTick />} padding={{ top: 20 }} />
        <Tooltip
          // eslint-disable-next-line
          labelStyle={{ color: '#4A5568' }}
        />
        <Legend wrapperStyle={{ fontSize: 14 }} />
        {lines.map((item) => (
          <Line
            key={item.name}
            type='monotone'
            stroke={primaryBlueText}
            activeDot={{ r: 5 }}
            {...item}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

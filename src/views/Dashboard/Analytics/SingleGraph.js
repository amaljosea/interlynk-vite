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

const CustomizedAxisTick = ({ x, y, payload, xOffset = 0, tickFormatter }) => {
  const { cyanColor } = useThemeColor(['cyanColor'])
  const formattedValue = tickFormatter
    ? tickFormatter(payload.value)
    : payload.value

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={xOffset}
        y={0}
        dy={16}
        textAnchor='end'
        fill={cyanColor}
        transform='scale(.7)'
      >
        {formattedValue}
      </text>
    </g>
  )
}

const dateFormatter = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const SingleGraph = ({ data, lines, syncId, percentage = false }) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const conditionalFormatter = (value) => {
    const formattedValue = parseFloat(value).toFixed(0)
    return percentage ? `${formattedValue}%` : formattedValue
  }

  return (
    <ResponsiveContainer aspect={2.5} debounce={300}>
      <LineChart data={data} syncId={syncId}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey='date'
          tickFormatter={(date) => dateFormatter(date)}
          tick={<CustomizedAxisTick tickFormatter={dateFormatter} />}
          xOffset={50}
          padding={{ right: 30 }}
        />
        <YAxis
          tick={<CustomizedAxisTick />}
          padding={{ top: 30 }}
          tickFormatter={conditionalFormatter}
        />
        <Tooltip
          labelFormatter={(label) => dateFormatter(label)}
          formatter={conditionalFormatter}
          // eslint-disable-next-line
          labelStyle={{ color: '#4A5568' }}
        />
        <Legend wrapperStyle={{ fontSize: 15 }} />
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

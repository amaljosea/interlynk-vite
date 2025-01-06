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

const CustomizedAxisTick = ({
  x,
  y,
  payload,
  xOffset = 0,
  yOffset = 0,
  tickFormatter
}) => {
  const { primaryTextColorWithOpacity } = useThemeColor([
    'primaryTextColorWithOpacity'
  ])
  const formattedValue = tickFormatter
    ? tickFormatter(payload.value)
    : payload.value

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={xOffset}
        y={yOffset}
        textAnchor='end'
        transform='scale(.7)'
        fill={primaryTextColorWithOpacity}
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
          tick={
            <CustomizedAxisTick
              yOffset={20}
              xOffset={22}
              tickFormatter={dateFormatter}
            />
          }
        />
        <YAxis
          tickFormatter={conditionalFormatter}
          tick={<CustomizedAxisTick x={5} y={5} />}
        />
        <Tooltip
          formatter={conditionalFormatter}
          labelStyle={{ color: primaryBlueText }}
          labelFormatter={(label) => dateFormatter(label)}
        />
        <Legend wrapperStyle={{ fontSize: 15, paddingTop: '12px' }} />
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

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

export const SingleGraph = ({
  data,
  lines,
  syncId,
  averages = false,
  percentage = false
}) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const relevantKeys = lines.map((line) => line.dataKey)
  const maxDataValue = Math.max(
    ...data.flatMap((item) =>
      relevantKeys.map((key) =>
        typeof item[key] === 'number' && !Number.isNaN(item[key])
          ? item[key]
          : 0
      )
    )
  )
  const getNextMultipleOf5 = (value) => Math.ceil(value / 5) * 5
  const extendedMax = getNextMultipleOf5(maxDataValue)

  const conditionalFormatter = (value) => {
    const precision = averages ? 2 : 0
    const formattedValue = parseFloat(value).toFixed(precision)
    return percentage ? `${formattedValue}%` : formattedValue
  }

  return (
    <ResponsiveContainer aspect={2.5} debounce={300}>
      <LineChart data={data} syncId={syncId}>
        <CartesianGrid strokeDasharray='1 1' />
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
          domain={percentage ? [0, 100] : [0, extendedMax]}
          tickFormatter={conditionalFormatter}
          tick={<CustomizedAxisTick x={5} y={5} />}
        />
        <Tooltip
          contentStyle={{
            fontSize: '14px',
            borderRadius: '8px',
            border: 'none',
            color: 'black',
            textAlign: 'left',
            textTransform: 'capitalize',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        />
        <Legend wrapperStyle={{ fontSize: 15, paddingTop: '12px' }} />
        {lines.map((item) => (
          <Line
            key={item.name}
            type='monotone'
            stroke={item?.color || primaryBlueText}
            activeDot={{ r: 5 }}
            {...item}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

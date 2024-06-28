import { PureComponent } from 'react'
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

class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, payload, xOffset } = this.props
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={xOffset}
          y={0}
          dy={16}
          textAnchor='end'
          fill='#666'
          transform='scale(.7)'
        >
          {payload.value}
        </text>
      </g>
    )
  }
}

export const SingleGraph = ({ data, lines }) => {
  return (
    <ResponsiveContainer aspect={2.5} debounce={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='date' tick={<CustomizedAxisTick xOffset={50} />} />
        <YAxis tick={<CustomizedAxisTick />} />
        <Tooltip labelStyle={{ color: '#4A5568' }} />
        <Legend wrapperStyle={{ fontSize: 14 }} />
        {lines.map((item) => {
          return (
            <Line
              key={item.name}
              type='monotone'
              stroke='#3182CE'
              activeDot={{ r: 8 }}
              {...item}
            />
          )
        })}
      </LineChart>
    </ResponsiveContainer>
  )
}

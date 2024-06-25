import { PureComponent } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

export const SingleGraph = ({ data, dataKey, name }) => {
  return (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey='date' tick={<CustomizedAxisTick xOffset={50} />} />
      <YAxis tick={<CustomizedAxisTick />} />
      <Tooltip />
      <Legend />
      <Line
        type='monotone'
        dataKey={dataKey}
        name={name}
        stroke='#3182CE'
        activeDot={{ r: 8 }}
      />
    </LineChart>
  )
}

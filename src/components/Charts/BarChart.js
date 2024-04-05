import React, { Component } from 'react'
import Chart from 'react-apexcharts'
import { barChartData, barChartOptions } from 'variables/charts'

import Card from 'components/Card/Card'

class BarChart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      chartData: [],
      chartOptions: {}
    }
  }

  componentDidMount() {
    this.setState({
      chartData: barChartData,
      chartOptions: barChartOptions
    })
  }

  render() {
    return (
      <Card
        py='1rem'
        height={{ sm: '300px' }}
        width='100%'
        bg='linear-gradient(81.62deg, #56ABE7 2.25%, #0077AF 79.87%)'
        position='relative'
      >
        <Chart
          options={this.state.chartOptions}
          series={this.state.chartData}
          type='bar'
          width='100%'
          height='100%'
        />
      </Card>
    )
  }
}

export default BarChart

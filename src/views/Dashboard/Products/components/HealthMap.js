import { useQuery } from '@apollo/client'
import React from 'react'
import ReactApexChart from 'react-apexcharts'
import { useParams } from 'react-router-dom'
import { getComponentHealthScoreFromLocalData } from 'utils/getComponentHealthScoreFromLocalData'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  SimpleGrid,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetComponentData } from 'graphQL/Queries'

const createRows = (components, rowSize) => {
  const rows = []
  for (let i = 0; i < components?.length; i += rowSize) {
    rows.push(components?.slice(i, i + rowSize))
  }
  return rows
}

const HealthMap = ({ isOpen, onClose }) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const { prodCompState } = useGlobalState()
  const { totalComp } = prodCompState

  const { data } = useQuery(GetComponentData, {
    skip: isOpen ? false : true,
    variables: {
      sbomId: sbomId,
      projectId: productId,
      first: totalComp
    }
  })

  const legendColor = useColorModeValue('#171923', '#F7FAFC')
  const lowColor = useColorModeValue('#F56565', '#C53030')
  const mediumColor = useColorModeValue('#ECC94B', '#ECC94B')
  const highColor = useColorModeValue('#48BB78', '#48BB78')

  const { nodes } = data?.sbom?.components || ''
  const isUnknown = nodes?.filter(
    (item) => item?.cpes?.length === 0 && !item?.purl
  )
  const isKnown = nodes?.filter(
    (item) => item?.cpes?.length === 0 && item?.purl
  )
  const knownData = createRows(isKnown, 25)
  const UnKnownData = createRows(isUnknown, 25)

  var options = {
    chart: {
      height: 250,
      type: 'heatmap',
      toolbar: {
        tools: {
          zoomin: false, // Disable zoomIn button
          zoomout: false, // Disable zoomOut button
          zoom: false, // Disable zoom functionality if you don't need it at all
          reset: false, // Disable reset zoom button
          pan: false, // Disable pan button
          download: false // Optionally disable download button if you don't need it
        }
      },
      background: 'transparent' // Remove chart background border
    },
    grid: {
      borderColor: 'transparent' // Remove grid border
    },
    tooltip: {
      style: {
        border: 'none' // Remove tooltip border
      }
    },
    legend: {
      labels: {
        colors: legendColor, // Change this to your desired font color
        fontSize: '14px' // Font size
      }
    },
    xaxis: {
      labels: {
        style: {
          colors: legendColor, // X-axis labels font color
          fontFamily: 'inherit' // X-axis labels font family
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: legendColor, // X-axis labels font color
          fontFamily: 'inherit' // X-axis labels font family
        }
      }
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: -1,
              to: 0,
              color: lowColor,
              name: 'Low'
            },
            {
              from: 1,
              to: 50,
              color: mediumColor,
              name: 'Medium'
            },
            {
              from: 51,
              to: 100,
              color: highColor,
              name: 'High'
            }
          ]
        }
      }
    },
    dataLabels: {
      enabled: false
    }
  }

  const getSeries = (data) => {
    let newSeries = []
    data?.map((item) => {
      return newSeries.push({
        name: item?.length,
        data: item?.map((row) => {
          const data = getComponentHealthScoreFromLocalData({
            componentName: row?.name,
            componentVersion: row?.version
          }).healthScore
          return data
        })
      })
    })
    return newSeries
  }

  const knownResults = getSeries(knownData)
  const unknownResults = getSeries(UnKnownData)

  console.log('knownResults', knownResults)

  return (
    <Drawer
      size='xl'
      isOpen={isOpen}
      onClose={onClose}
      placement='right'
      closeOnOverlayClick={true}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          Components
        </DrawerHeader>
        <DrawerBody>
          <SimpleGrid width={'100%'} columns={1} spacing='24px'>
            <Card width={'100%'}>
              <ReactApexChart
                options={options}
                series={knownResults}
                type='heatmap'
                height='250'
              />
              <Text textAlign={'center'}>Known Components</Text>
            </Card>
            <Card width={'100%'}>
              <ReactApexChart
                options={options}
                series={unknownResults}
                type='heatmap'
                height='250'
              />
              <Text textAlign={'center'}>Unknown Components</Text>
            </Card>
          </SimpleGrid>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default HealthMap

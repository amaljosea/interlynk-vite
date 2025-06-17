import { useQuery } from '@apollo/client'
import { pdf } from '@react-pdf/renderer'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'

import { DownloadIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  Select,
  SimpleGrid,
  Skeleton,
  Text,
  Wrap,
  WrapItem
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import { useThemeColor } from 'hooks/useThemeColors'

import { ProductProgressMetrics } from 'graphQL/Queries'

import ProductComparisonPDF from './ProductComparisonPDF'
import MetricPieChart from './components/MetricPieChart'
import MetricStat from './components/MetricStat'
import { calculateDelta, calculateTotalVulns, tooltipCustom } from './utils'

const DEFAULT_VISIBLE_CHART_LINES = {
  Total: true,
  'Fixed & Not Affected': true,
  Affected: true,
  Unspecified: true
}

const ProgressOverviewCard = () => {
  const params = useParams()
  const productId = params.productid

  const {
    primaryTextColor,
    secondaryTextColor,
    primaryBlueText,
    semiTransparentBorder,
    secondaryTextInverse,
    graphRedColor,
    graphGreenColor
  } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor',
    'primaryBlueText',
    'semiTransparentBorder',
    'secondaryTextInverse',
    'graphRedColor',
    'graphGreenColor'
  ])

  const [visibleLines, setVisibleLines] = useState(DEFAULT_VISIBLE_CHART_LINES)
  const [selectedVersions, setSelectedVersions] = useState({
    version1: null,
    version2: null
  })

  const { data, loading, error } = useQuery(ProductProgressMetrics, {
    variables: { projectId: productId }
  })

  const sbomVersions = data?.project?.sbomVersions?.nodes || []
  const completedSboms = sbomVersions.filter(
    (node) => node.vulnRunStatus === 'FINISHED'
  )
  const productName = data?.project?.projectGroup?.name

  useEffect(() => {
    if (
      completedSboms.length >= 2 &&
      !selectedVersions.version1 &&
      !selectedVersions.version2
    ) {
      setSelectedVersions({
        version1: completedSboms[0],
        version2: completedSboms[1]
      })
    }
  }, [completedSboms, selectedVersions])

  const toggleChartLineVisibility = (key) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const updateSelectedVersion = (versionKey, selectedVersionLabel) => {
    const selectedVersion = completedSboms.find(
      (v) => v.projectVersion === selectedVersionLabel
    )

    if (selectedVersion) {
      setSelectedVersions((prev) => ({
        ...prev,
        [versionKey]: selectedVersion
      }))
    }
  }

  // Data calculations
  const version1Metrics = selectedVersions.version1?.vulnerabilityMetrics || {}
  const version2Metrics = selectedVersions.version2?.vulnerabilityMetrics || {}
  const supportMetrics1 = selectedVersions.version1?.supportLevelMetrics || {}
  const supportMetrics2 = selectedVersions.version2?.supportLevelMetrics || {}

  const version1Total = calculateTotalVulns(version1Metrics)
  const version2Total = calculateTotalVulns(version2Metrics)
  const vulnDelta = calculateDelta(version1Total, version2Total)

  const vulnerabilitiesData = {
    currentTotal: version1Total,
    deltaDirection: vulnDelta.deltaDirection,
    deltaPercent: vulnDelta.deltaPercent
  }

  const activeSupport1 = supportMetrics1.activelyMaintainedCount || 0
  const activeSupport2 = supportMetrics2.activelyMaintainedCount || 0
  const supportDelta = calculateDelta(activeSupport1, activeSupport2)

  const supportStatusData = {
    currentTotal: activeSupport1,
    deltaDirection: supportDelta.deltaDirection,
    deltaPercent: supportDelta.deltaPercent
  }

  const vulnPieChartData = [
    {
      name: 'Affected',
      value: version1Metrics.affectedCount || 0,
      color: graphRedColor
    },
    {
      name: 'Fixed & Not Affected',
      value:
        (version1Metrics.fixedCount || 0) +
        (version1Metrics.notAffectedCount || 0),
      color: graphGreenColor
    },
    {
      name: 'Unspecified',
      value: version1Metrics.unspecifiedCount || 0,
      color: secondaryTextInverse
    }
  ]

  const supportPieChartData = [
    {
      name: 'Actively Maintained',
      value: activeSupport1,
      color: graphGreenColor
    },
    {
      name: 'No Longer Maintained',
      value: supportMetrics1.noLongerMaintainedCount || 0,
      color: 'orange'
    },
    {
      name: 'Abandoned',
      value: supportMetrics1.abandonedCount || 0,
      color: graphRedColor
    },
    {
      name: 'Unspecified',
      value: supportMetrics1.unspecifiedCount || 0,
      color: secondaryTextInverse
    }
  ]

  const top7Versions = completedSboms.slice(0, 7)

  const chartData = top7Versions.map((node) => {
    const {
      affectedCount = 0,
      fixedCount = 0,
      notAffectedCount = 0,
      unspecifiedCount = 0,
      inTriageCount = 0
    } = node.vulnerabilityMetrics || {}

    return {
      version: node.projectVersion,
      Total:
        affectedCount +
        fixedCount +
        notAffectedCount +
        unspecifiedCount +
        inTriageCount,
      'Fixed & Not Affected': fixedCount + notAffectedCount,
      Affected: affectedCount,
      Unspecified: unspecifiedCount
    }
  })

  const downloadPDF = async () => {
    const blob = await pdf(
      <ProductComparisonPDF
        productName={productName}
        selectedVersions={selectedVersions}
        version1Metrics={version1Metrics}
        version2Metrics={version2Metrics}
        support1={supportMetrics1}
        support2={supportMetrics2}
        supportPieChartData={supportPieChartData}
        vulnPieChartData={vulnPieChartData}
        visibleLines={visibleLines}
        chartData={chartData}
      />
    ).toBlob()

    const formattedProductName = productName.toLowerCase().replace(/\s+/g, '_')

    const date = new Date()
    const month = date
      .toLocaleString('default', { month: 'long' })
      .toLowerCase()
    const year = date.getFullYear()

    const fileName = `${formattedProductName}_report_${month}_${year}.pdf`

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFilteredOptions = (excludeVersion) => {
    return completedSboms.filter(
      (version) => version.projectVersion !== excludeVersion?.projectVersion
    )
  }

  if (error) {
    return <Center as={Card}>Error</Center>
  }

  if (loading) {
    return (
      <Card width='400px'>
        <Flex mt={4} width='100%' flexDir='column' gap={4}>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} width='100%' height='20px' />
          ))}
        </Flex>
      </Card>
    )
  }

  if (completedSboms.length < 2) {
    return (
      <Card width='400px'>
        <Center height='100%'>
          <Text>Vulnerability run status is pending for the latest SBOM.</Text>
        </Center>
      </Card>
    )
  }

  if (!selectedVersions.version1 || !selectedVersions.version2) {
    return (
      <Card width='400px'>
        <Center height='100%'>
          <Text>Loading version data...</Text>
        </Center>
      </Card>
    )
  }

  return (
    <Card width='400px' flex='1' height='100%' padding={'20px'}>
      <CardHeader
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Text fontSize='xl' color={primaryTextColor} fontWeight='semibold'>
          Progress overview
        </Text>
        <Button
          size={'sm'}
          leftIcon={<DownloadIcon color={secondaryTextColor} />}
          variant={'outline'}
          color={primaryTextColor}
          fontWeight={'medium'}
          onClick={downloadPDF}
        >
          Report
        </Button>
      </CardHeader>
      <CardBody
        py={4}
        mt={2}
        display={'flex'}
        flexDirection={'column'}
        gap={10}
      >
        <Flex justifyContent={'space-between'} gap={4}>
          <Flex direction='column' flex={1}>
            <Text fontSize='x-small' fontWeight={'medium'}>
              Compare:
            </Text>
            <Select
              value={selectedVersions.version1?.projectVersion || ''}
              onChange={(e) =>
                updateSelectedVersion('version1', e.target.value)
              }
              size='sm'
              rounded='lg'
            >
              {getFilteredOptions(selectedVersions.version2).map((version) => (
                <option
                  key={version.projectVersion}
                  value={version.projectVersion}
                >
                  {version.projectVersion}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex direction='column' flex={1}>
            <Text fontSize='x-small' fontWeight={'medium'}>
              With:
            </Text>
            <Select
              value={selectedVersions.version2?.projectVersion || ''}
              onChange={(e) =>
                updateSelectedVersion('version2', e.target.value)
              }
              size='sm'
              rounded='lg'
            >
              {getFilteredOptions(selectedVersions.version1).map((version) => (
                <option
                  key={version.projectVersion}
                  value={version.projectVersion}
                >
                  {version.projectVersion}
                </option>
              ))}
            </Select>
          </Flex>
        </Flex>

        <Grid templateColumns='repeat(12, 1fr)'>
          <GridItem colSpan={4}>
            <MetricStat
              label='Support status'
              total={supportStatusData.currentTotal}
              deltaPercent={supportStatusData.deltaPercent}
              deltaDirection={supportStatusData.deltaDirection}
            />
          </GridItem>
          <GridItem colSpan={8}>
            <MetricPieChart data={supportPieChartData} />
          </GridItem>
        </Grid>

        <Grid templateColumns='repeat(12, 1fr)'>
          <GridItem colSpan={4}>
            <MetricStat
              label='Vulnerabilities'
              total={vulnerabilitiesData.currentTotal}
              deltaPercent={vulnerabilitiesData.deltaPercent}
              deltaDirection={vulnerabilitiesData.deltaDirection}
            />
          </GridItem>
          <GridItem colSpan={8}>
            <MetricPieChart data={vulnPieChartData} />
          </GridItem>
        </Grid>

        <Box>
          <Wrap spacing={4} mb={4}>
            {Object.keys(visibleLines).map((key) => (
              <WrapItem key={key}>
                <Checkbox
                  isChecked={visibleLines[key]}
                  onChange={() => toggleChartLineVisibility(key)}
                  size='sm'
                >
                  {key}
                </Checkbox>
              </WrapItem>
            ))}
          </Wrap>
          <ResponsiveContainer
            width='100%'
            height={250}
            style={{ marginLeft: '-25px', marginTop: '20px' }}
          >
            <LineChart data={chartData.reverse()}>
              <CartesianGrid
                stroke={semiTransparentBorder}
                strokeDasharray='3 3'
              />
              <XAxis dataKey='version' tick={{ fontSize: 10 }}>
                <Label
                  value='versions'
                  offset={0}
                  position='insideBottom'
                  fontSize={13}
                />
              </XAxis>
              <YAxis tick={{ fontSize: 12 }}>
                <Label value='vulns' fontSize={13} angle={-90} />
              </YAxis>
              {tooltipCustom}
              {visibleLines['Total'] && (
                <Line
                  type='monotone'
                  dataKey='Total'
                  stroke={primaryBlueText}
                  strokeWidth={2}
                />
              )}
              {visibleLines['Fixed & Not Affected'] && (
                <Line
                  type='monotone'
                  dataKey='Fixed & Not Affected'
                  stroke={graphGreenColor}
                  strokeOpacity={0.8}
                  strokeWidth={2}
                />
              )}
              {visibleLines['Affected'] && (
                <Line
                  type='monotone'
                  dataKey='Affected'
                  stroke={graphRedColor}
                  strokeOpacity={0.8}
                  strokeWidth={2}
                />
              )}
              {visibleLines['Unspecified'] && (
                <Line
                  type='monotone'
                  dataKey='Unspecified'
                  stroke={secondaryTextInverse}
                  strokeOpacity={0.8}
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  )
}

export default ProgressOverviewCard

import { gql, useQuery } from '@apollo/client'
import { pdf } from '@react-pdf/renderer'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
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
  Circle,
  Flex,
  Select,
  Skeleton,
  Stack,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Wrap,
  WrapItem
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import { useThemeColor } from 'hooks/useThemeColors'

import ProductComparisonPDF from './ProductComparisonPDF'
import { tooltipCustom } from './utils'

const SBOMS_VULN_COUNT = gql`
  query SbomVulnCount($projectId: Uuid!) {
    project(id: $projectId) {
      id
      projectGroup {
        name
      }
      sbomVersions(
        first: 25
        orderBy: { direction: DESC, field: SBOMS_CREATED_AT }
      ) {
        totalCount
        nodes {
          projectVersion
          vulnRunStatus
          vulnerabilityMetrics {
            affectedCount
            fixedCount
            inTriageCount
            notAffectedCount
            unspecifiedCount
          }
          supportLevelMetrics {
            abandonedCount
            activelyMaintainedCount
            noLongerMaintainedCount
            unspecifiedCount
          }
        }
      }
    }
  }
`

const MetricStat = ({ label, total, deltaPercent, deltaDirection }) => (
  <Stat minW='150px' flex='1'>
    <StatLabel isTruncated>{label}</StatLabel>
    <StatNumber fontSize={32} fontWeight='medium'>
      {total}
    </StatNumber>
    <StatHelpText>
      <StatArrow type={deltaDirection} />
      {deltaPercent}%
    </StatHelpText>
  </Stat>
)

const MetricPieChart = ({ data }) => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    minW='180px'
    maxW='200px'
    flexShrink={0}
  >
    <PieChart width={140} height={110}>
      <Pie
        cx='50%'
        cy='50%'
        data={data}
        dataKey='value'
        innerRadius={30}
        outerRadius={50}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
    <Stack>
      {data.map((entry, index) => (
        <Flex key={index} justifyContent='space-between'>
          <Flex alignItems='start' gap={1}>
            <Circle mt={1} bg={entry.color} size={2} />
            <Text color={entry.color} fontSize={12}>
              {entry.name}:
            </Text>
          </Flex>
          <Text color={entry.color} fontSize={12} ml={2}>
            {entry.value}
          </Text>
        </Flex>
      ))}
    </Stack>
  </Box>
)

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

  const [visibleLines, setVisibleLines] = useState({
    Total: true,
    'Fixed & Not Affected': true,
    Affected: true,
    Unspecified: true
  })

  const { data, loading, error } = useQuery(SBOMS_VULN_COUNT, {
    variables: { projectId: productId }
  })

  const [selectedVersions, setSelectedVersions] = useState({
    version1: null,
    version2: null
  })

  const handleToggle = (key) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const apiData = data?.project?.sbomVersions?.nodes || []
  const finishedData = apiData.filter(
    (node) => node.vulnRunStatus === 'FINISHED'
  )

  const productName = data?.project?.projectGroup?.name

  useEffect(() => {
    if (finishedData.length >= 2 && !selectedVersions.version1) {
      setSelectedVersions({
        version1: finishedData[0],
        version2: finishedData[1]
      })
    }
  }, [finishedData, selectedVersions])

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

  if (finishedData.length < 2) {
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

  const version1Metrics = selectedVersions.version1?.vulnerabilityMetrics || {}
  const version2Metrics = selectedVersions.version2?.vulnerabilityMetrics || {}

  const getTotal = (metrics) => {
    const {
      affectedCount = 0,
      fixedCount = 0,
      notAffectedCount = 0,
      unspecifiedCount = 0,
      inTriageCount = 0
    } = metrics
    return (
      affectedCount +
      fixedCount +
      notAffectedCount +
      unspecifiedCount +
      inTriageCount
    )
  }

  const version1Total = getTotal(version1Metrics)
  const version2Total = getTotal(version2Metrics)
  const delta = version1Total - version2Total
  const deltaPercentage =
    version2Total === 0
      ? version1Total === 0
        ? 0
        : 100
      : ((delta / version2Total) * 100).toFixed(2)

  const vulnerabilitiesData = {
    currentTotal: version1Total,
    deltaDirection: delta >= 0 ? 'increase' : 'decrease',
    deltaPercent: Math.abs(deltaPercentage)
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

  const top7Versions = finishedData.slice(0, 7)

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

  const support1 = selectedVersions.version1?.supportLevelMetrics || {}
  const support2 = selectedVersions.version2?.supportLevelMetrics || {}

  const activeCount1 = support1.activelyMaintainedCount || 0
  const activeCount2 = support2.activelyMaintainedCount || 0

  const supportDelta = activeCount1 - activeCount2
  const supportDeltaPercent = (
    (supportDelta / (activeCount2 || 1)) *
    100
  ).toFixed(1)

  const supportStatusData = {
    currentTotal: activeCount1,
    deltaDirection: supportDelta >= 0 ? 'increase' : 'decrease',
    deltaPercent: Math.abs(supportDeltaPercent)
  }

  const supportPieChartData = [
    {
      name: 'Actively Maintained',
      value: activeCount1,
      color: graphGreenColor
    },
    {
      name: 'No Longer Maintained',
      value: support1.noLongerMaintainedCount || 0,
      color: 'orange'
    },
    {
      name: 'Abandoned',
      value: support1.abandonedCount || 0,
      color: graphRedColor
    },
    {
      name: 'Unspecified',
      value: support1.unspecifiedCount || 0,
      color: secondaryTextInverse
    }
  ]

  const handleVersionChange = (versionKey, selectedVersionLabel) => {
    const selectedVersion = finishedData.find(
      (v) => v.projectVersion === selectedVersionLabel
    )

    if (selectedVersion) {
      setSelectedVersions((prev) => ({
        ...prev,
        [versionKey]: selectedVersion
      }))
    }
  }

  const downloadPDF = async () => {
    const blob = await pdf(
      <ProductComparisonPDF
        productName={productName}
        selectedVersions={selectedVersions}
        version1Metrics={version1Metrics}
        version2Metrics={version2Metrics}
        support1={support1}
        support2={support2}
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
              onChange={(e) => handleVersionChange('version1', e.target.value)}
              size='sm'
              rounded='lg'
            >
              {finishedData.map((version) => (
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
              onChange={(e) => handleVersionChange('version2', e.target.value)}
              size='sm'
              rounded='lg'
            >
              {finishedData.map((version) => (
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

        <Flex gap={4} justifyContent='space-between'>
          <MetricStat
            label='Support status'
            total={supportStatusData.currentTotal}
            deltaPercent={supportStatusData.deltaPercent}
            deltaDirection={supportStatusData.deltaDirection}
          />
          <MetricPieChart data={supportPieChartData} />
        </Flex>

        <Flex gap={4} justifyContent='space-between'>
          <MetricStat
            label='Vulnerabilities'
            total={vulnerabilitiesData.currentTotal}
            deltaPercent={vulnerabilitiesData.deltaPercent}
            deltaDirection={vulnerabilitiesData.deltaDirection}
          />
          <MetricPieChart data={vulnPieChartData} />
        </Flex>

        <Box>
          <Wrap spacing={4} mb={4}>
            {Object.keys(visibleLines).map((key) => (
              <WrapItem key={key}>
                <Checkbox
                  isChecked={visibleLines[key]}
                  onChange={() => handleToggle(key)}
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

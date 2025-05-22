/* eslint-disable no-restricted-syntax */
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from '@react-pdf/renderer'
import InterlynkLogo from 'assets/img/logo.png'
import ReactPDFChart from 'react-pdf-charts'
import {
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from 'recharts'

// Constants
const COLORS = {
  primary: '#3d71ee',
  active: '#38a169',
  noLongerMaintained: '#ffa500',
  abandoned: '#e53e3e99',
  unspecified: '#718096',
  affected: '#ed7b7b',
  total: '#3182CE'
}

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  interlynk: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 50,
    height: 50,
    marginTop: 10
  },
  companyName: {
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: 4
  },
  title: (size = 20) => ({
    fontSize: size,
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: 'center'
  }),
  versionComparison: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 25,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: COLORS.primary
  },
  productName: {
    fontSize: 18,
    color: COLORS.primary,
    marginTop: 15
  },
  summarySection: {
    flexDirection: 'row',
    marginBottom: 20
  },
  summaryDataContainer: {
    marginLeft: 30,
    flexDirection: 'row'
  },
  vulnTrendHeader: {
    fontSize: 14,
    color: '#3d71ee',
    textAlign: 'center'
  },
  textItem: (color) => ({
    marginBottom: 4,
    color
  }),
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15
  },
  chartArea: {
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  legendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    flexWrap: 'wrap',
    gap: 10
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
  legendLabel: {
    fontSize: 10,
    marginTop: 6
  },
  legendColor: (color, opacity = 1) => ({
    width: 12,
    height: 12,
    backgroundColor: color,
    opacity,
    marginRight: 6
  })
})

// Chart Components
const PieChartPDF = ({ data }) => (
  <ReactPDFChart>
    <PieChart width={140} height={110}>
      <Pie
        cx='50%'
        cy='50%'
        data={data}
        dataKey='value'
        innerRadius={30}
        outerRadius={50}
        isAnimationActive={false}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  </ReactPDFChart>
)

const VulnLineChart = ({ data, visibleLines }) => (
  <ReactPDFChart>
    <LineChart data={data} height={200} width={400}>
      <CartesianGrid stroke='#0000001f' strokeDasharray='3 3' />
      <XAxis dataKey='version' tick={{ fontSize: 10 }}>
        <Label
          value='versions'
          offset={0}
          position='insideBottom'
          fontSize={13}
        />
      </XAxis>
      <YAxis tick={{ fontSize: 12 }}>
        <Label value='vulns' offset={0} position='insideLeft' fontSize={13} />
      </YAxis>
      {visibleLines['Total'] && (
        <Line
          type='monotone'
          dataKey='Total'
          stroke={COLORS.total}
          strokeWidth={2}
          isAnimationActive={false}
        />
      )}
      {visibleLines['Fixed & Not Affected'] && (
        <Line
          type='monotone'
          dataKey='Fixed & Not Affected'
          stroke={COLORS.active}
          strokeOpacity={0.8}
          strokeWidth={2}
          isAnimationActive={false}
        />
      )}
      {visibleLines['Affected'] && (
        <Line
          type='monotone'
          dataKey='Affected'
          stroke={COLORS.affected}
          strokeOpacity={0.8}
          strokeWidth={2}
          isAnimationActive={false}
        />
      )}
      {visibleLines['Unspecified'] && (
        <Line
          type='monotone'
          dataKey='Unspecified'
          stroke={COLORS.unspecified}
          strokeOpacity={0.8}
          strokeWidth={2}
          isAnimationActive={false}
        />
      )}
    </LineChart>
  </ReactPDFChart>
)

const VersionSupportSummary = ({ versionName, metrics }) => (
  <View>
    <Text style={styles.title(16)}>{versionName}</Text>
    <Text style={styles.textItem(COLORS.active)}>
      Actively Maintained: {metrics.activelyMaintainedCount}
    </Text>
    <Text style={styles.textItem(COLORS.noLongerMaintained)}>
      No Longer Maintained: {metrics.noLongerMaintainedCount}
    </Text>
    <Text style={styles.textItem(COLORS.abandoned)}>
      Abandoned: {metrics.abandonedCount}
    </Text>
    <Text style={styles.textItem(COLORS.unspecified)}>
      Unspecified: {metrics.unspecifiedCount}
    </Text>
  </View>
)

const VersionVulnSummary = ({ versionName, metrics }) => (
  <View>
    <Text style={styles.title(16)}>{versionName}</Text>
    <Text style={styles.textItem(COLORS.affected)}>
      Affected: {metrics.affectedCount}
    </Text>
    <Text style={styles.textItem(COLORS.active)}>
      Fixed + Not Affected: {metrics.fixedCount + metrics.notAffectedCount}
    </Text>
    <Text style={styles.textItem(COLORS.unspecified)}>
      Unspecified: {metrics.unspecifiedCount}
    </Text>
  </View>
)

const LegendItem = ({ color, label, opacity = 1 }) => (
  <View style={styles.legendItem}>
    <View style={styles.legendColor(color, opacity)} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
)

const ProductComparisonPDF = ({
  productName,
  selectedVersions,
  version1Metrics,
  version2Metrics,
  support1,
  support2,
  supportPieChartData,
  vulnPieChartData,
  visibleLines,
  chartData
}) => {
  const version1Name = selectedVersions.version1?.projectVersion
  const version2Name = selectedVersions.version2?.projectVersion

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.interlynk}>
            <Image style={styles.logo} src={InterlynkLogo} />
            <Text style={styles.companyName}>Interlynk</Text>
          </View>

          <Text style={styles.title()}>Product Progress Overview Report</Text>
          <Text style={styles.productName}>{productName}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.versionComparison}>
          Comparison between versions {version1Name} and {version2Name}
        </Text>
        {/* Support Summary */}
        <Text style={styles.sectionTitle}>Support Status Summary</Text>
        <View style={styles.summarySection}>
          <PieChartPDF data={supportPieChartData} />
          <View style={styles.summaryDataContainer}>
            <VersionSupportSummary
              versionName={version1Name}
              metrics={support1}
            />
            <View style={{ marginLeft: 40 }}>
              <VersionSupportSummary
                versionName={version2Name}
                metrics={support2}
              />
            </View>
          </View>
        </View>

        {/* Vulnerabilities Summary */}
        <Text style={styles.sectionTitle}>Vulnerabilities Summary</Text>
        <View style={styles.summarySection}>
          <PieChartPDF data={vulnPieChartData} />
          <View style={styles.summaryDataContainer}>
            <VersionVulnSummary
              versionName={version1Name}
              metrics={version1Metrics}
            />
            <View style={{ marginLeft: 54 }}>
              <VersionVulnSummary
                versionName={version2Name}
                metrics={version2Metrics}
              />
            </View>
          </View>
        </View>
        {/* Vulnerabilities Trend */}
        <Text style={styles.vulnTrendHeader}>Vulnerabilities Trend</Text>
        <View style={styles.chartArea}>
          <VulnLineChart data={chartData} visibleLines={visibleLines} />
        </View>
        <View style={styles.legendSection}>
          <LegendItem color={COLORS.total} label='Total' />
          <LegendItem
            color={COLORS.active}
            label='Fixed & Not Affected'
            opacity={0.8}
          />
          <LegendItem color={COLORS.affected} label='Affected' opacity={0.8} />
          <LegendItem
            color={COLORS.unspecified}
            label='Unspecified'
            opacity={0.8}
          />
        </View>
      </Page>
    </Document>
  )
}

export default ProductComparisonPDF

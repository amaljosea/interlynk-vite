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

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 14
  },
  interlynkText: {
    fontSize: 30,
    marginLeft: 6,
    color: '#3d71ee'
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#3d71ee'
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#3d71ee'
  },
  productName: {
    fontSize: 26,
    color: '#3d71ee',
    marginBottom: 20
  },
  versionName: {
    fontSize: 16,
    marginBottom: 6,
    color: '#3d71ee'
  },
  textItem: {
    marginBottom: 4
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15
  },
  chartArea: {
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const colorStyle = (color) => ({ color })

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
  const RenderSupportPieChart = () => (
    <ReactPDFChart>
      <PieChart width={140} height={110}>
        <Pie
          cx='50%'
          cy='50%'
          data={supportPieChartData}
          dataKey='value'
          innerRadius={30}
          outerRadius={50}
          isAnimationActive={false}
        >
          {supportPieChartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ReactPDFChart>
  )

  const RenderVulnPieChart = () => (
    <ReactPDFChart>
      <PieChart width={140} height={110}>
        <Pie
          cx='50%'
          cy='50%'
          data={vulnPieChartData}
          dataKey='value'
          innerRadius={30}
          outerRadius={50}
          isAnimationActive={false}
        >
          {vulnPieChartData.map((entry, index) => (
            <Cell key={`vuln-cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ReactPDFChart>
  )

  const RenderVulnLineChart = () => (
    <ReactPDFChart>
      <LineChart data={chartData} height={250} width={400}>
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
          <Label value='vulns' fontSize={13} angle={-90} />
        </YAxis>
        {visibleLines['Total'] && (
          <Line
            type='monotone'
            dataKey='Total'
            stroke='#3182CE'
            strokeWidth={2}
            isAnimationActive={false}
          />
        )}
        {visibleLines['Fixed & Not Affected'] && (
          <Line
            type='monotone'
            dataKey='Fixed & Not Affected'
            stroke='#38a169'
            strokeOpacity={0.3}
            strokeWidth={2}
            isAnimationActive={false}
          />
        )}
        {visibleLines['Affected'] && (
          <Line
            type='monotone'
            dataKey='Affected'
            stroke='#ed7b7b'
            strokeOpacity={0.3}
            strokeWidth={2}
            isAnimationActive={false}
          />
        )}
        {visibleLines['Unspecified'] && (
          <Line
            type='monotone'
            dataKey='Unspecified'
            stroke='#718096'
            strokeOpacity={0.3}
            strokeWidth={2}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ReactPDFChart>
  )

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoArea}>
            <Image style={styles.logo} src={InterlynkLogo} />
            <Text style={styles.interlynkText}>Interlynk</Text>
          </View>
          <Text style={styles.title}>Progress Overview Report</Text>
        </View>

        {/* Product Name */}
        <Text style={styles.productName}>{productName}</Text>

        {/* Versions */}
        <Text style={styles.versionName}>
          Comparing: {selectedVersions.version1?.projectVersion} vs.{' '}
          {selectedVersions.version2?.projectVersion}
        </Text>

        <View style={styles.divider} />

        {/* Support Summary */}
        <Text style={styles.sectionTitle}>Support Summary</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          <RenderSupportPieChart />
          {/* Version 1 */}
          <View>
            <Text style={styles.versionName}>
              {selectedVersions.version1?.projectVersion}
            </Text>
            <Text style={[styles.textItem, colorStyle('#38a169')]}>
              Actively Maintained: {support1.activelyMaintainedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#ffa500')]}>
              No Longer Maintained: {support1.noLongerMaintainedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#e53e3e99')]}>
              Abandoned: {support1.abandonedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#718096')]}>
              Unspecified: {support1.unspecifiedCount}
            </Text>
          </View>

          {/* Version 2 */}
          <View>
            <Text style={styles.versionName}>
              {selectedVersions.version2?.projectVersion}
            </Text>
            <Text style={[styles.textItem, colorStyle('#38a169')]}>
              Actively Maintained: {support2.activelyMaintainedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#ffa500')]}>
              No Longer Maintained: {support2.noLongerMaintainedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#e53e3e99')]}>
              Abandoned: {support2.abandonedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#718096')]}>
              Unspecified: {support2.unspecifiedCount}
            </Text>
          </View>
        </View>

        {/* Vulnerabilities Summary */}
        <Text style={styles.sectionTitle}>Vulnerabilities Summary</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <RenderVulnPieChart />

          {/* Version 1 */}
          <View>
            <Text style={styles.versionName}>
              {selectedVersions.version1?.projectVersion}
            </Text>
            <Text style={[styles.textItem, colorStyle('#e53e3e99')]}>
              Affected: {version1Metrics.affectedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#38a169')]}>
              Fixed + Not Affected:{' '}
              {version1Metrics.fixedCount + version1Metrics.notAffectedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#718096')]}>
              Unspecified: {version1Metrics.unspecifiedCount}
            </Text>
          </View>

          {/* Version 2 */}
          <View>
            <Text style={styles.versionName}>
              {selectedVersions.version2?.projectVersion}
            </Text>
            <Text style={[styles.textItem, colorStyle('#e53e3e99')]}>
              Affected: {version2Metrics.affectedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#38a169')]}>
              Fixed + Not Affected:{' '}
              {version2Metrics.fixedCount + version2Metrics.notAffectedCount}
            </Text>
            <Text style={[styles.textItem, colorStyle('#718096')]}>
              Unspecified: {version2Metrics.unspecifiedCount}
            </Text>
          </View>
        </View>

        <View style={styles.chartArea}>
          <RenderVulnLineChart />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 10,
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 15
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#3182CE',
                marginRight: 6
              }}
            />
            <Text style={{ fontSize: 10, marginTop: 6 }}>Total</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 15
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#38a169',
                opacity: 0.3,
                marginRight: 6
              }}
            />
            <Text style={{ fontSize: 10, marginTop: 6 }}>
              Fixed & Not Affected
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 15
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#ed7b7b',
                opacity: 0.3,
                marginRight: 6
              }}
            />
            <Text style={{ fontSize: 10, marginTop: 6 }}>Affected</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#718096',
                opacity: 0.3,
                marginRight: 6
              }}
            />
            <Text style={{ fontSize: 10, marginTop: 6 }}>Unspecified</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default ProductComparisonPDF

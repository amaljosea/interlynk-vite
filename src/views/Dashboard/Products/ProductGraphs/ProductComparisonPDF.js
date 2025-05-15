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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  logoArea: {
    display: 'flex',
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
    marginTop: 20,
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
    marginBottom: 10,
    color: '#3d71ee'
  },
  textItem: {
    marginBottom: 5
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15
  }
})

const ProductComparisonPDF = ({
  productName,
  selectedVersions,
  version1Metrics,
  version2Metrics,
  support1,
  support2
}) => (
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.versionName}>
            {selectedVersions.version1?.projectVersion}
          </Text>
          <Text style={styles.textItem}>
            Actively Maintained: {support1.activelyMaintainedCount}
          </Text>
          <Text style={styles.textItem}>
            No Longer Maintained: {support1.noLongerMaintainedCount}
          </Text>
          <Text style={styles.textItem}>
            Abandoned: {support1.abandonedCount}
          </Text>
          <Text style={styles.textItem}>
            Unspecified: {support1.unspecifiedCount}
          </Text>
        </View>
        <View>
          <Text style={styles.versionName}>
            {selectedVersions.version2?.projectVersion}
          </Text>
          <Text style={styles.textItem}>
            Actively Maintained: {support2.activelyMaintainedCount}
          </Text>
          <Text style={styles.textItem}>
            No Longer Maintained: {support2.noLongerMaintainedCount}
          </Text>
          <Text style={styles.textItem}>
            Abandoned: {support2.abandonedCount}
          </Text>
          <Text style={styles.textItem}>
            Unspecified: {support2.unspecifiedCount}
          </Text>
        </View>
      </View>

      {/* Vulnerabilities Summary */}
      <Text style={styles.sectionTitle}>Vulnerabilities Summary</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={styles.versionName}>
            {selectedVersions.version1?.projectVersion}
          </Text>
          <Text style={styles.textItem}>
            Affected: {version1Metrics.affectedCount}
          </Text>
          <Text style={styles.textItem}>
            Fixed + Not Affected:{' '}
            {version1Metrics.fixedCount + version1Metrics.notAffectedCount}
          </Text>
          <Text style={styles.textItem}>
            Unspecified: {version1Metrics.unspecifiedCount}
          </Text>
        </View>
        <View>
          <Text style={styles.versionName}>
            {selectedVersions.version2?.projectVersion}
          </Text>
          <Text style={styles.textItem}>
            Affected: {version2Metrics.affectedCount}
          </Text>
          <Text style={styles.textItem}>
            Fixed + Not Affected:{' '}
            {version2Metrics.fixedCount + version2Metrics.notAffectedCount}
          </Text>
          <Text style={styles.textItem}>
            Unspecified: {version2Metrics.unspecifiedCount}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />
    </Page>
  </Document>
)

export default ProductComparisonPDF

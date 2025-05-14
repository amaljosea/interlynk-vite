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
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    color: '#3d71ee'
  },
  productName: {
    fontSize: 26,
    color: '#3d71ee',
    marginBottom: 10
  },
  versionName: {
    fontSize: 16,
    marginTop: 10,
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
  support1
}) => (
  <Document>
    <Page size='A4' style={styles.page}>
      {/* Header with Logo and Interlynk */}
      <View style={styles.header}>
        <View style={styles.logoArea}>
          <Image style={styles.logo} src={InterlynkLogo} />
          <Text style={styles.interlynkText}>Interlynk</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Progress Overview Report</Text>
      </View>

      {/* Product Info */}
      <Text style={styles.productName}>{productName}</Text>
      <Text style={styles.versionName}>
        {selectedVersions.version1?.projectVersion}
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Vulnerabilities */}
      <Text style={styles.sectionTitle}>Vulnerabilities Summary:</Text>
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

      {/* Support */}
      <Text style={styles.sectionTitle}>Support Summary:</Text>
      <Text style={styles.textItem}>
        Actively Maintained: {support1.activelyMaintainedCount}
      </Text>
      <Text style={styles.textItem}>
        No Longer Maintained: {support1.noLongerMaintainedCount}
      </Text>
      <Text style={styles.textItem}>Abandoned: {support1.abandonedCount}</Text>
    </Page>
  </Document>
)

export default ProductComparisonPDF

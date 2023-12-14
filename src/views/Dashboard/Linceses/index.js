import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import LicenseTable from 'components/Tables/LicenseTable'

const Licenses = () => {
  // LICENSES DATA
  const licenses = [
    {
      reference: 'https://spdx.org/licenses/0BSD.html',
      isDeprecatedLicenseId: false,
      detailsUrl: 'https://spdx.org/licenses/0BSD.json',
      referenceNumber: 126,
      name: 'BSD Zero Clause License',
      licenseId: '0BSD',
      seeAlso: [
        'http://landley.net/toybox/license.html',
        'https://opensource.org/licenses/0BSD'
      ],
      isOsiApproved: true,
      fsf: false,
      custom: true,
      status: 'approved'
    },
    {
      reference: 'https://spdx.org/licenses/AAL.html',
      isDeprecatedLicenseId: false,
      detailsUrl: 'https://spdx.org/licenses/AAL.json',
      referenceNumber: 120,
      name: 'Attribution Assurance License',
      licenseId: 'AAL',
      seeAlso: ['https://opensource.org/licenses/attribution'],
      isOsiApproved: true,
      fsf: true,
      custom: true,
      status: 'approved'
    },
    {
      reference: 'https://spdx.org/licenses/Abstyles.html',
      isDeprecatedLicenseId: false,
      detailsUrl: 'https://spdx.org/licenses/Abstyles.json',
      referenceNumber: 296,
      name: 'Abstyles License',
      licenseId: 'Abstyles',
      seeAlso: ['https://fedoraproject.org/wiki/Licensing/Abstyles'],
      isOsiApproved: false,
      fsf: true,
      custom: false,
      status: 'rejected'
    },
    {
      reference: 'https://spdx.org/licenses/AdaCore-doc.html',
      isDeprecatedLicenseId: false,
      detailsUrl: 'https://spdx.org/licenses/AdaCore-doc.json',
      referenceNumber: 480,
      name: 'AdaCore Doc License',
      licenseId: 'AdaCore-doc',
      seeAlso: [
        'https://github.com/AdaCore/xmlada/blob/master/docs/index.rst',
        'https://github.com/AdaCore/gnatcoll-core/blob/master/docs/index.rst',
        'https://github.com/AdaCore/gnatcoll-db/blob/master/docs/index.rst'
      ],
      isOsiApproved: false,
      fsf: false,
      custom: true,
      status: 'unspecified'
    },
    {
      reference: 'https://spdx.org/licenses/Adobe-2006.html',
      isDeprecatedLicenseId: false,
      detailsUrl: 'https://spdx.org/licenses/Adobe-2006.json',
      referenceNumber: 258,
      name: 'Adobe Systems Incorporated Source Code License Agreement',
      licenseId: 'Adobe-2006',
      seeAlso: ['https://fedoraproject.org/wiki/Licensing/AdobeLicense'],
      isOsiApproved: false,
      fsf: false,
      custom: true,
      status: 'approved'
    },
    {
      reference: 'https://spdx.org/licenses/Adobe-Glyph.html',
      isDeprecatedLicenseId: false,
      detailsUrl: 'https://spdx.org/licenses/Adobe-Glyph.json',
      referenceNumber: 353,
      name: 'Adobe Glyph List License',
      licenseId: 'Adobe-Glyph',
      seeAlso: ['https://fedoraproject.org/wiki/Licensing/MIT#AdobeGlyph'],
      isOsiApproved: false,
      fsf: false,
      custom: true,
      status: 'unspecified'
    }
  ]

  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <LicenseTable data={licenses} />
      </Card>
    </Flex>
  )
}

export default Licenses

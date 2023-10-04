// Custom icons
import {
  AdobexdLogo,
  AtlassianLogo,
  JiraLogo,
  SlackLogo,
  SpotifyLogo
} from 'components/Icons/Icons.js'

import { AiOutlineExclamation } from 'react-icons/ai'

import {
  FaEye,
  FaThumbsUp,
  FaTools,
  FaBug,
  FaShare,
  FaGithub,
  FaArrowDown,
  FaArrowUp,
  FaFilePdf
} from 'react-icons/fa'

export const healthChecks = [
  {
    id: 1,
    healthCheckId: 'SB-HC-10',
    severity: 'critical',
    shortDesc: 'Primary Component',
    longDesc: 'Document is missing a primary component',
    status: 'fix'
  },
  {
    id: 2,
    healthCheckId: 'SB-HC-5',
    severity: 'high',
    shortDesc: 'Creation Time',
    longDesc: 'Document is missing a creation timestamp',
    status: 'fix'
  },
  // Component Biotronik.Cabo.Shared-0.0.0-UnknownVersion
  {
    id: 5,
    healthCheckId: 'SB-HC-7',
    severity: 'high',
    shortDesc: 'Primary Author',
    longDesc:
      'Document is missing authors',
    status: 'fix'
  },
  {
    id: 6,
    healthCheckId: 'SB-HC-23',
    severity: 'high',
    shortDesc: 'Primary Relationship',
    longDesc:
      'Component: Biotronik.Cabo.Shared-0.0.0-UnknownVersion is not related to Primary Component',
    status: 'fix'
  },
  {
    id: 6,
    healthCheckId: 'SB-HC-17',
    severity: 'high',
    shortDesc: 'Component Identifier',
    longDesc:
      'Component: Biotronik.Cabo.Shared-0.0.0-UnknownVersion: is mssing a Package URL (PURL)',
    status: 'fix'
  },
  {
    id: 6,
    healthCheckId: 'SB-HC-19',
    severity: 'high',
    shortDesc: 'Component Identifier',
    longDesc:
      'Component: Biotronik.Cabo.Shared-0.0.0-UnknownVersion is Common Platform Enumeration (CPE)',
    status: 'fix'
  },
  {
    id: 8,
    healthCheckId: 'SB-HC-15',
    severity: 'low',
    shortDesc: 'Component Supplier',
    longDesc:
      'Component: Biotronik.Cabo.Shared-0.0.0-UnknownVersion is missing s a supplier',
    status: 'fix'
  },
  {
    id: 8,
    healthCheckId: 'SB-HC-12',
    severity: 'high',
    shortDesc: 'Component Version',
    longDesc:
      'Component: Biotronik.Cabo.Shared-0.0.0-UnknownVersion is missing a version',
    status: 'fix'
  },

  // Component system.reactive.compatibility.5.0.0.nupkg
  {
    id: 6,
    healthCheckId: 'SB-HC-23',
    severity: 'critical',
    shortDesc: 'Component Relationship',
    longDesc:
      'Component: system.reactive.compatibility.5.0.0.nupkg is not related to Primary Component',
    status: 'fix'
  },
  {
    id: 6,
    healthCheckId: 'SB-HC-17',
    severity: 'high',
    shortDesc: 'Component Identifier',
    longDesc:
      'Component: system.reactive.compatibility.5.0.0.nupkg is missing a Package URL (PURL)',
    status: 'fix'
  },
  {
    id: 6,
    healthCheckId: 'SB-HC-13',
    severity: 'high',
    shortDesc: 'Component Type',
    longDesc:
      'Component: system.reactive.compatibility.5.0.0.nupkg is missing a type',
    status: 'fix'
  },
  {
    id: 8,
    healthCheckId: 'SB-HC-15',
    severity: 'low',
    shortDesc: 'Component Supplier',
    longDesc:
      'Component: system.reactive.compatibility.5.0.0.nupkg is missing a supplier',
    status: 'fix'
  },

  // Component couchbase.lite.enterprise.3.0.0.nupkg
  {
    id: 5,
    healthCheckId: 'SB-HC-24',
    severity: 'medium',
    shortDesc: 'Component Identifier',
    longDesc:
      'Component: system.reactive.compatibility.5.0.0.nupkg is missing a unique identifier',
    status: 'fix'
  },
  {
    id: 6,
    healthCheckId: 'SB-HC-23',
    severity: 'critical',
    shortDesc: 'Component Relationship',
    longDesc:
      'Component: system.reactive.compatibility.5.0.0.nupkg is not related to Primary Component',
    status: 'fix'
  },
  {
    id: 6,
    healthCheckId: 'SB-HC-19',
    severity: 'high',
    shortDesc: 'Component Identifier',
    longDesc:
      'Component: system.reactive.compatibility.5.0.0.nupkg is missing a Common Platform Enumeration (CPE)',
    status: 'fix'
  },
  {
    id: 8,
    healthCheckId: 'SB-HC-15',
    severity: 'low',
    shortDesc: 'Component Supplier',
    longDesc:
      'Component: system.reactive.compatibility.5.0.0.nupkg is missing a supplier',
    status: 'fix'
  }
]

export const orgHealthChecks = [
  {
    id: 1,
    title: 'SB-HC-4',
    link: 'https://www.interlynk.io/',
    description: 'SBOM Document has a unique identifier',
    long_desc:
      'SBOM document has a unique identifier field i.e serialNumber for CDX and SPDXID + namespace for SPDX.',
    status: 'High'
  },
  {
    id: 2,
    title: 'SB-HC-5',
    link: 'https://www.interlynk.io/',
    description: 'Document creation timestamp',
    long_desc: 'SBOM document contains a creation timestamp',
    status: 'High'
  },
  {
    id: 3,
    title: 'SB-HC-6',
    link: 'https://www.interlynk.io/',
    description: 'Document has creation tools present',
    long_desc: 'SBOM lists tools used to create the document.',
    status: 'High'
  },
  {
    id: 4,
    title: 'SB-HC-7',
    link: 'https://www.interlynk.io/',
    description: 'Document has authors present',
    long_desc: 'SBOM lists authors who created this document.',
    status: 'High'
  },
  {
    id: 5,
    title: 'SB-HC-8',
    link: 'https://www.interlynk.io/',
    description: 'Document has suppliers present',
    long_desc:
      'SBOM lists the organization that supplied the component that the bom describes. The supplier may often be the manufacturer, but may also be a distributor or repackager.SBOM lists the organization that supplied the component that the bom describes. The supplier may often be the manufacturer, but may also be a distributor or repackager.',
    status: 'High'
  },
  {
    id: 6,
    title: 'SB-HC-9',
    link: 'https://www.interlynk.io/',
    description: 'Document has data license specified',
    long_desc:
      'This is to alleviate any concern that content in the sbom document is subject to any form of intellectual property right that could restrict the re-use of the information or the creation of another SBOM document for the same project(s).',
    status: 'High'
  },
  {
    id: 7,
    title: 'SB-HC-10',
    link: 'https://www.interlynk.io/',
    description: 'Document has a primary component',
    long_desc:
      'SBOM is used to describe a primary component or package. A primary component is a component that is directly included in a product or service.',
    status: 'Critical'
  },
  {
    id: 8,
    title: 'SB-HC-11',
    link: 'https://www.interlynk.io/',
    description: 'Component has a name',
    long_desc:
      'The name of each component is a short, essential identifier to be maintained.',
    status: 'High'
  },
  {
    id: 9,
    title: 'SB-HC-12',
    link: 'https://www.interlynk.io/',
    description: 'Component has a version',
    long_desc:
      'The versioning of a component is a useful for identification purposes and for indicating later changes of the component version.',
    status: 'High'
  },
  {
    id: 10,
    title: 'SB-HC-13',
    link: 'https://www.interlynk.io/',
    description: 'Component has a type',
    long_desc:
      'This is a reasonable estimate of the most likely component usage from the producer and consumer perspective from which both parties can draw conclusions about the context in which the component exists.',
    status: 'Low'
  },
  {
    id: 11,
    title: 'SB-HC-14',
    link: 'https://www.interlynk.io/',
    description: 'Component has a valid type',
    long_desc:
      'The type of each component is a valid type as defined by the specification.',
    status: 'Low'
  },
  {
    id: 12,
    title: 'SB-HC-15',
    link: 'https://www.interlynk.io/',
    description: 'Component has a supplier',
    long_desc:
      'Component has a supplier that is a valid organization as defined by the specification.',
    status: 'Low'
  },
  {
    id: 13,
    title: 'SB-HC-16',
    link: 'https://www.interlynk.io/',
    description: 'Component has a unique identifier',
    long_desc:
      'Component has a unique identifier that is a valid based on sbom spec. Can be used for lookups in other db e.g vulns db.',
    status: 'High'
  },
  {
    id: 14,
    title: 'SB-HC-17',
    link: 'https://www.interlynk.io/',
    description: 'Component has a Package URL (PURL)',
    long_desc: 'Component has a purl, which can be used to lookup vulns.',
    status: 'High'
  },
  {
    id: 15,
    title: 'SB-HC-18',
    link: 'https://www.interlynk.io/',
    description: 'Component has a valid Package URL (PURL)',
    long_desc: 'Component has a valid purl, which can be used to lookup vulns.',
    status: 'High'
  },
  {
    id: 16,
    title: 'SB-HC-19',
    link: 'https://www.interlynk.io/',
    description: 'Component has a Common Platform Enumeration (CPE)',
    long_desc:
      'Component has a cpe, which can be used to lookup vulns from nvd.',
    status: 'High'
  },
  {
    id: 17,
    title: 'SB-HC-20',
    link: 'https://www.interlynk.io/',
    description: 'Component has a valid Common Platform Enumeration (CPE)',
    long_desc:
      'Component has a valid cpe, which can be used to lookup vulns from nvd.',
    status: 'High'
  },
  {
    id: 18,
    title: 'SB-HC-21',
    link: 'https://www.interlynk.io/',
    description: 'Component has license/s specified',
    long_desc: 'Component has license/s specified.',
    status: 'Medium'
  },
  {
    id: 19,
    title: 'SB-HC-22',
    link: 'https://www.interlynk.io/',
    description: 'Componet has deprecated license/s',
    long_desc: 'Component has deprecated license/s.',
    status: 'Medium'
  }
]

export const changeLogs = [
  {
    id: 1,
    type: 'modified',
    object: 'microsoft.extensions.dependencyinjection.abstractions.2.0.0.nupkg',
    prevValue: 'Primary: False',
    newValue: 'Primary:True',
    changedBy: 'Surendra Pathak',
    time: '2023-09-27T06:21:00Z'
  },
  {
    id: 2,
    type: 'added',
    object: 'Creation Time',
    prevValue: '',
    newValue: '09/25/2023 6:15 PM',
    changedBy: 'Abhisek Paul',
    time: '2023-09-27T02:11:36Z'
  },
  {
    id: 3,
    type: 'added',
    object: 'Licenses',
    prevValue: '',
    newValue: 'MIT',
    changedBy: 'Surendra Pathak',
    time: '2023-09-26T19:20:00Z'
  },
  {
    id: 4,
    type: 'added',
    object: 'Version',
    prevValue: '',
    newValue: '3.0.0',
    changedBy: 'Abhisek Paul',
    time: '2023-09-26T07:11:24Z'
  },
  {
    id: 5,
    type: 'modified',
    object: 'Licenses',
    prevValue: 'AAPL',
    newValue: 'AAL',
    changedBy: 'Ritesh Noronha',
    time: '2023-09-26T05:38:00Z'
  },
  {
    id: 6,
    type: 'added',
    object: 'bom-ref-h17z311',
    prevValue: '',
    newValue:
      'Component Name: microsoft.extensions.dependendencyinjections.3.1.1.nupkg',
    changedBy: 'Ritesh Noronha',
    time: '2023-09-25T17:15:24Z'
  },
  {
    id: 7,
    type: 'added',
    object: 'microsoft.extensions.dependencyinjection.abstractions.2.0.0.nupkg',
    prevValue: '',
    newValue: 'Supplier: Biotronik Inc. - hello@biontronik.com',
    changedBy: 'Brian B.',
    time: '2023-09-25T17:10:00Z'
  },
  {
    id: 8,
    type: 'added',
    object: 'microsoft.extensions.dependencyinjection.abstractions.2.0.0.nupkg',
    prevValue: '',
    newValue: 'bom-Ref: bom-ref-h291z34a1',
    changedBy: 'Shubham Shete',
    time: '2023-09-25T15:11:10Z'
  },
  {
    id: 9,
    type: 'added',
    object: 'microsoft.extensions.dependencyinjection.abstractions.2.0.0.nupkg',
    prevValue: 'Describes: None',
    newValue:
      'Describes: microsoft.extensions.signlecore.privates.11.1.9.nupkg',
    changedBy: 'Ritesh Noronha',
    time: '2023-09-24T17:15:00Z'
  },
  {
    id: 10,
    type: 'modified',
    object: 'microsoft.extensions.dependencyinjection.abstractions.2.0.0.nupkg',
    prevValue: 'PURL: pkg:/nuget/abstractions@2.0.0',
    newValue: 'PURL: pkg/nuget/microsoft.extensions.abstractions@2.0.0',
    changedBy: 'Surendra Pathak',
    time: '2023-09-24T17:10:00Z'
  },
  {
    id: 11,
    type: 'deleted',
    object: 'Name: com.junkcode.com',
    prevValue: '',
    newValue: '',
    changedBy: 'Ritesh Noronha',
    time: '2023-09-24T06:14:00Z'
  }
]

export const activitiesData = [
  {
    logo: FaShare,
    title: '[Shared] sbomasm v0.0.9 to Peter.Gregory@svc.ai',
    date: '11 MAR 3:11 PM',
    color: 'teal.300'
  },
  {
    logo: FaThumbsUp,
    title: '[Approved] sbomasm v0.0.9 by Ritesh Noronha',
    date: '11 MAR 09:14 AM',
    color: 'teal.300'
  },
  {
    logo: FaGithub,
    title: '[Built] sbomex v0.0.3',
    date: '09 MAR 10:11 AM',
    color: 'black'
  },
  {
    logo: FaBug,
    title: '[Discovered] CVE-2023-24532 affects 2 products, 6 versions',
    date: '08 MAR 5:11 PM',
    color: 'red'
  },
  {
    logo: FaTools,
    title: '[Assembled] sbombenchark.dev v0.0.2',
    date: '06 MAR 1:11 PM',
    color: 'black'
  },
  {
    logo: FaEye,
    title: '[Viewed] sbomqs v0.0.4 by Galvin.Belson@hooli.ai',
    date: '01 MAR 9:21 PM',
    color: 'purple'
  },
  {
    logo: FaTools,
    title: '[Assembled] sbombenchark.dev v0.0.1',
    date: '01 MAR 1:11 AM',
    color: 'black'
  },
  {
    logo: FaEye,
    title: '[Viewed] sbomqs v0.0.3 by Pied.Piper@@hooli.ai',
    date: '26 FEB 9:21 PM',
    color: 'purple'
  },
  {
    logo: FaThumbsUp,
    title: '[Approved] sbomasm v0.0.6 by Ritesh Noronha',
    date: '26 FEB 5:11 PM',
    color: 'teal.300'
  },
  {
    logo: FaThumbsUp,
    title: '[Approved] sbomasm v0.0.5 by Ritesh Noronha',
    date: '26 FEB 5:10 PM',
    color: 'teal.300'
  },
  {
    logo: FaEye,
    title: '[Viewed] sbomqs v0.0.4 by Galvin.Belson@hooli.ai',
    date: '25 FEB 9:21 PM',
    color: 'purple'
  },
  {
    logo: FaBug,
    title: '[Discovered] CVE-2023-12391 affects 1 product, 2 versions',
    date: '20 FEB 5:11 PM',
    color: 'red'
  },
  {
    logo: FaTools,
    title: '[Assembled] sbombenchark.dev v0.0.1',
    date: '20 FEB 1:11 PM',
    color: 'black'
  },
  {
    logo: FaEye,
    title: '[Viewed] sbomqs v0.0.4 by Galvin.Belson@hooli.ai',
    date: '18 FEB 9:21 PM',
    color: 'purple'
  }
]

export const Risks = [
  {
    type: 'Exploitable Vulnerability',
    description: 'CVE-2022-41723 is expoitable and has a CVSS score of 7.5',
    component: 'golang.org/x/net',
    version: '0.5.0',
    recommendation: 'Upgrade golang.org/x/net to 0.7.0',
    score: 10
  },
  {
    type: 'Aging Component',
    description: 'gordf is 22 versions behind the latest version',
    component: 'gordf',
    version: '0.0.0-20211331',
    recommendation: 'Upgrade gordf to 0.1.0',
    score: 6
  },
  {
    type: 'Restrictive License',
    description: 'ktop is using LGPL-3.0-or-later',
    component: 'ktop',
    version: '0.4.4',
    recommendation: 'Review license terms of LGPL-3.0-or-later',
    score: 4
  },
  {
    type: 'Immature Component',
    description: 'semdrop was created within less than 180 days',
    component: 'semdrop',
    version: '0.1.0',
    recommendation:
      'A component that is less than 180 days old is considered immature',
    score: 3
  },
  {
    type: 'Unmaintained Component',
    description: 'pkgurl takes more than 30 days to respond to issues',
    component: 'pkgurl',
    version: '3.6.0',
    recommendation:
      'A component that takes more than 7 days to respond to issues is considered unmaintained',
    score: 1
  },
  {
    type: 'Typosquatted Component',
    description: 'pkgurl name is very similar to a more popular component',
    component: 'pkgurl',
    version: '3.6.0',
    recommendation:
      'A component that is very similar to a more popular component is considered typosquatted',
    score: 1
  }
]

export const sbom = [
  {
    logo: FaGithub,
    component: 'git',
    version: '1:2.20.1-2+deb10u8',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '6 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 4,
    critical: 2,
    high: 0,
    medium: 3,
    low: 1,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libffi6',
    version: '3.2.1-9',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '1 day ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 1,
    critical: 5,
    high: 1,
    medium: 2,
    low: 6,
    redacted: true
  },
  {
    logo: FaGithub,
    component: 'stevedore',
    version: '5.0.0',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '4 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 9,
    critical: 0,
    high: 0,
    medium: 2,
    low: 1,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'apt',
    version: '1.8.2.3',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'stevedore',
    language: 'Go',
    license: 'MIT',
    updated: '11 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 6,
    critical: 3,
    high: 0,
    medium: 3,
    low: 2,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'gpgv',
    version: '2.2.12-1+deb10u2',
    dependsOn: 'None',
    license: 'BSD-3-Clause',
    risk_score: 1,
    updated: '4 days ago',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    critical: 1,
    high: 2,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libblkid1',
    version: '2.33.1-0.1',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '1 year ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 11,
    critical: 1,
    high: 3,
    medium: 4,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libldap-common',
    version: '2.4.47+dfsg-3+deb10u7',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '5 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 2,
    critical: 1,
    high: 2,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libp11-kit0',
    version: '0.23.15-2+deb10u1',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '7 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 3,
    critical: 1,
    high: 2,
    medium: 0,
    low: 0,
    redacted: true
  },
  {
    logo: FaGithub,
    component: 'setuptools',
    version: '58.1.0',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '9 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 1,
    critical: 1,
    high: 2,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libdb5.3',
    version: '5.3.28+dfsg1-0.5',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'libdb5.3',
    language: 'Go',
    license: 'Apache2.0',
    updated: '6 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 7,
    critical: 1,
    high: 2,
    medium: 0,
    low: 0
  },
  {
    logo: FaGithub,
    component: 'libgssapi-krb5-2',
    version: '1.17-3+deb10u5',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache-2.0, GPL-2.0, CC-BY-4.0',
    updated: '1 day ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 0,
    critical: 1,
    high: 2,
    medium: 0,
    low: 0
  },
  {
    logo: FaGithub,
    component: 'adduser',
    version: '3.118',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '6 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 0,
    critical: 1,
    high: 2,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'debian-inspector',
    version: '31.0.0',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '3 day ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 2,
    critical: 0,
    high: 0,
    medium: 1,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'golang-github-containers-common',
    version: '0.33.4+ds1-1+deb11u2',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Unknown',
    updated: '7 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 9,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libapt-pkg5.0',
    version: '1.8.2.3',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '5 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 11,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libcap-ng0',
    version: '0.7.9-2',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'libapt-pkg5.0',
    language: 'Go',
    license: 'Apache2.0',
    updated: '7 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 15,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libcurl3-gnutls',
    version: '7.64.0-4+deb10u6',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '9 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 5,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libhogweed4',
    version: '3.4.1-1+deb10u1',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '5 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 12,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libk5crypto3',
    version: '1.17-3+deb10u5',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '7 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 3,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libpcre3',
    version: '2:8.39-12',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'BSD-3-Clause',
    updated: '9 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 2,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'prettytable',
    version: '3.6.0',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '6 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 2,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'findutils',
    version: '4.6.0+git+20190209-2',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '1 day ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 1,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libgpgme11',
    version: '1.12.0-6',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '6 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 8,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libsqlite3-0',
    version: '3.27.2-3+deb10u2',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '3 day ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 6,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'ncurses-base',
    version: '6.1+20181013-2+deb10u3',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '7 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 11,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'tzdata',
    version: '2021a-0+deb10u11',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'MIT',
    updated: '5 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 9,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'libtasn1-6',
    version: '4.13-3+deb10u1',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'BSD-3-Clause',
    updated: '7 weeks ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 5,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'packageurl-python',
    version: '0.10.4',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '9 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 4,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  },
  {
    logo: FaGithub,
    component: 'fdisk',
    version: '2.33.1-0.1',
    source: 'github.com/CycloneDX/cyclonedx-go',
    depth: 0,
    dependsOn: 'None',
    language: 'Go',
    license: 'Apache2.0',
    updated: '5 days ago',
    repo: 'https://github.com/CycloneDX/cyclonedx-go',
    risk_score: 2,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    redacted: false
  }
]

export const tablesProjectData = [
  {
    logo: AdobexdLogo,
    name: 'Interlynk Version',
    budget: '$14,000',
    status: 'Working',
    progression: 60
  },
  {
    logo: AtlassianLogo,
    name: 'Add Progress Track',
    budget: '$3,000',
    status: 'Canceled',
    progression: 10
  },
  {
    logo: SlackLogo,
    name: 'Fix Platform Errors',
    budget: 'Not set',
    status: 'Done',
    progression: 100
  },
  {
    logo: SpotifyLogo,
    name: 'Launch our Mobile App',
    budget: '$32,000',
    status: 'Done',
    progression: 100
  },
  {
    logo: JiraLogo,
    name: 'Add the New Pricing Page',
    budget: '$400',
    status: 'Working',
    progression: 25
  }
]

export const invoicesData = [
  {
    date: 'March, 01, 2020',
    code: '#MS-415646',
    price: '$180',
    logo: FaFilePdf,
    format: 'PDF'
  },
  {
    date: 'February, 10, 2020',
    code: '#RV-126749',
    price: '$250',
    logo: FaFilePdf,
    format: 'PDF'
  },
  {
    date: 'April, 05, 2020',
    code: '#FB-212562',
    price: '$560',
    logo: FaFilePdf,
    format: 'PDF'
  },
  {
    date: 'June, 25, 2019',
    code: '#QW-103578',
    price: '$120',
    logo: FaFilePdf,
    format: 'PDF'
  },
  {
    date: 'March, 01, 2019',
    code: '#AR-803481',
    price: '$300',
    logo: FaFilePdf,
    format: 'PDF'
  }
]

export const billingData = [
  {
    name: 'Oliver Liam',
    company: 'Viking Burrito',
    email: 'oliver@burrito.com',
    number: 'FRB1235476'
  },
  {
    name: 'Lucas Harper',
    company: 'Stone Tech Zone',
    email: 'lucas@stone-tech.com',
    number: 'FRB1235476'
  },
  {
    name: 'Ethan James',
    company: 'Fiber Notion',
    email: 'ethan@fiber.com',
    number: 'FRB1235476'
  }
]

export const newestTransactions = [
  {
    name: 'Netflix',
    date: '27 March 2021, at 12:30 PM',
    price: '- $2,500',
    logo: FaArrowDown
  },
  {
    name: 'Apple',
    date: '27 March 2021, at 12:30 PM',
    price: '+ $2,500',
    logo: FaArrowUp
  }
]

export const olderTransactions = [
  {
    name: 'Stripe',
    date: '26 March 2021, at 13:45 PM',
    price: '+ $800',
    logo: FaArrowUp
  },
  {
    name: 'HubSpot',
    date: '26 March 2021, at 12:30 PM',
    price: '+ $1,700',
    logo: FaArrowUp
  },
  {
    name: 'Webflow',
    date: '26 March 2021, at 05:00 PM',
    price: 'Pending',
    logo: AiOutlineExclamation
  },
  {
    name: 'Microsoft',
    date: '25 March 2021, at 16:30 PM',
    price: '- $987',
    logo: FaArrowDown
  }
]

export const Vulnerabilities = [
  {
    id: 1,
    cve: 'CVE-2023-4863',
    cvss: '8.8',
    severity: 'high',
    component: 'skiasharp.2.88.0-preview.178.nupkg',
    version: '2.88.0-preview.178',
    status: 'In Triage',
    source: 'NVD'
  },
  {
    id: 2,
    cve: 'CVE-2023-21538',
    cvss: '7.5',
    severity: 'high',
    component: 'system.private.datacontractserialization.4.3.0.nupkg',
    version: '4.3.0',
    status: 'In Triage',
    source: 'NVD'
  },
  {
    id: 3,
    cve: 'CVE-2017-11770',
    cvss: '7.5',
    severity: 'high',
    component: 'system.security.cryptography.x509certificates.4.3.0.nupkg',
    version: '4.3.0',
    status: 'Fixed',
    source: 'SBOM'
  }
]

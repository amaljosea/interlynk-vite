// Assets
import avatar1 from 'assets/img/avatars/avatar1.png'
import avatar2 from 'assets/img/avatars/avatar2.png'
import avatar3 from 'assets/img/avatars/avatar3.png'
import avatar4 from 'assets/img/avatars/avatar4.png'
import avatar5 from 'assets/img/avatars/avatar5.png'
import avatar7 from 'assets/img/avatars/avatar7.png'
import { v4 as uuidv4 } from 'uuid'
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
  FaFilePdf,
  FaPython,
  FaReact,
  FaTh,
  FaCode,
  FaDatabase,
  FaWrench
} from 'react-icons/fa'

export const dashboardTableData = [
  {
    logo: FaGithub,
    name: 'sbomqs',
    description: 'SBOM quality score - Quality metrics for your sboms',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 6,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 21,
        updated_at: '2023-02-01T19:14:43Z',
        sbom_links: 0,
        active: false
      },
      {
        version: 'v0.0.2',
        risk_score: 21,
        updated_at: '2023-02-04T14:15:43Z',
        sbom_links: 0,
        active: false
      },
      {
        version: 'v0.0.3',
        risk_score: 21,
        updated_at: '2023-02-06T14:15:43Z',
        sbom_links: 0,
        active: false
      },
      {
        version: 'v0.0.4',
        risk_score: 21,
        updated_at: '2023-02-09T14:15:43Z',
        sbom_links: 0,
        active: false
      },
      {
        version: 'v0.0.5',
        risk_score: 21,
        updated_at: '2023-02-16T14:15:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.6',
        risk_score: 21,
        updated_at: '2023-02-23T14:15:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.7',
        risk_score: 21,
        updated_at: '2023-03-02T14:15:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.8',
        risk_score: 21,
        updated_at: '2023-03-08T14:15:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.9',
        risk_score: 21,
        updated_at: '2023-03-15T14:15:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.10',
        risk_score: 21,
        updated_at: '2023-03-22T14:15:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.11',
        risk_score: 21,
        updated_at: '2023-03-29T14:15:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.12',
        risk_score: 21,
        updated_at: '2023-04-05T14:15:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.13',
        risk_score: 19,
        updated_at: '2023-04-12T14:15:43Z',
        sbom_links: 1,
        active: true
      },
      {
        version: 'v0.0.14',
        risk_score: 27,
        updated_at: '2023-04-19T16:15:43Z',
        sbom_links: 4,
        active: true
      },
      {
        version: 'v0.0.14-hotfix',
        risk_score: 21,
        updated_at: '2023-04-26T15:15:43Z',
        sbom_links: 2,
        active: true
      },
      {
        version: 'v0.0.15',
        risk_score: 21,
        updated_at: '2023-05-04T16:11:43Z',
        sbom_links: 1,
        active: true
      }
    ],
    risk_score: 21
  },
  {
    logo: FaReact,
    name: 'dashboard-app',
    description: 'Interlynk SBOM Dashboard App',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 2,
    versions: [],
    risk_score: 30
  },
  {
    logo: FaGithub,
    name: 'sbomasm',
    description: 'A tool to compose your various sboms into a single sbom',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 5,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 7,
        updated_at: '2023-05-03T19:14:43Z',
        sbom_links: 7,
        active: true
      }
    ],
    sbom_links: 7,
    risk_score: 9
  },
  {
    logo: FaGithub,
    name: 'homebrew-interlynk',
    description: 'Homebrew taps for interlynk products',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 1,
    versions: [],
    risk_score: 27
  },
  {
    logo: FaReact,
    name: 'sbom-benchmark',
    description: 'SBOM Leaderboard',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 9,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 25,
        updated_at: '2023-04-28T19:14:43Z',
        sbom_links: 0,
        active: true
      }
    ],
    risk_score: 25
  },
  {
    logo: FaGithub,
    name: 'sbomex',
    description: 'Find & pull public SBOMs',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 7,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 0,
        updated_at: '2023-03-09T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.2',
        risk_score: 0,
        updated_at: '2023-03-10T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.3',
        risk_score: 3,
        updated_at: '2023-03-17T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.4',
        risk_score: 4,
        updated_at: '2023-04-20T19:14:43Z',
        sbom_links: 0,
        active: true
      }
    ],
    sbom_links: 7,
    risk_score: 40
  },
  {
    logo: FaGithub,
    name: 'sbomgr',
    description: 'SBOM Grep - search through SBOMs',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 3,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 20,
        updated_at: '2023-03-20T19:14:43Z',
        sbom_links: 0,
        active: false
      },
      {
        version: 'v0.0.2',
        risk_score: 27,
        updated_at: '2023-03-27T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.3',
        risk_score: 21,
        updated_at: '2023-04-04T19:14:43Z',
        sbom_links: 6,
        active: true
      },
      {
        version: 'v0.0.4',
        risk_score: 20,
        updated_at: '2023-04-20T19:14:43Z',
        sbom_links: 3,
        active: true
      }
    ],
    risk_score: 22
  },
  {
    logo: FaDatabase,
    name: 'sbomdb',
    description: "Database for SBOMs in the Interlynk's public SBOM repository",
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 10,
    versions: [
      {
        version: 'v0.0.5',
        risk_score: 25,
        updated_at: '2023-04-04T19:14:43Z',
        sbom_links: 0,
        active: false
      }
    ],
    risk_score: 0
  },
  {
    logo: FaPython,
    name: 'sbomlc',
    description: 'Tools and references that help build a collection of SBOMs',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 1,
    versions: [],
    risk_score: 24
  },
  {
    logo: FaReact,
    name: 'sbombenchmark.dev',
    description: 'Build Better SBOM',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 10,
    versions: [],
    risk_score: 19
  },
  {
    logo: FaWrench,
    name: 'sbom-combined',
    description: 'sbomqs v0.0.14 + sbomasm v0.0.2 + sbomgr v0.0.3',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 4,
    versions: [
      {
        version: 'v1.0',
        risk_score: 31,
        updated_at: '2023-05-03T23:23:43Z',
        sbom_links: 0,
        active: false
      }
    ],
    risk_score: 19
  },
  {
    logo: FaGithub,
    name: 'purl-tools',
    description: 'A set of scripts for managing PURLs',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 6,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 25,
        updated_at: '2023-02-10T19:14:43Z',
        sbom_links: 0,
        active: true
      }
    ],
    risk_score: 13
  },
  {
    logo: FaPython,
    name: 'purl-mapper',
    description: 'PURL CPE Mapping Utility',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 8,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 13,
        updated_at: '2023-01-16T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.2',
        risk_score: 6,
        updated_at: '2023-02-03T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.3',
        risk_score: 6,
        updated_at: '2023-03-01T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.4',
        risk_score: 6,
        updated_at: '2023-04-11T19:14:43Z',
        sbom_links: 0,
        active: true
      }
    ],
    risk_score: 6
  },
  {
    logo: FaGithub,
    name: 'lynk_model_mapping',
    description: 'CyclonDX and SPDX model mapping',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 8,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 14,
        updated_at: '2022-11-16T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.2',
        risk_score: 22,
        updated_at: '2022-12-21T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.3',
        risk_score: 16,
        updated_at: '2023-01-16T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v1.1',
        risk_score: 25,
        updated_at: '2023-03-21T19:14:43Z',
        sbom_links: 0,
        active: true
      }
    ],
    risk_score: 21
  },
  {
    logo: FaGithub,
    name: 'lynk-service',
    description: 'Interlynk SBOM Processing Service',
    source: 'Github',
    vendor: 'Interlynk',
    quality_score: 5,
    versions: [
      {
        version: 'v0.0.1',
        risk_score: 18,
        updated_at: '2022-11-31T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.2',
        risk_score: 12,
        updated_at: '2023-01-16T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.0.3',
        risk_score: 15,
        updated_at: '2023-02-01T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.1.0',
        risk_score: 9,
        updated_at: '2023-02-03T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.1.1',
        risk_score: 4,
        updated_at: '2023-03-03T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.2.0',
        risk_score: 20,
        updated_at: '2023-03-19T19:14:43Z',
        sbom_links: 0,
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.3.0',
        risk_score: 6,
        updated_at: '2023-04-07T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.4.0',
        risk_score: 0,
        updated_at: '2023-04-16T19:14:43Z',
        sbom_links: 0,
        active: true
      },
      {
        version: 'v0.4.1',
        risk_score: 3,
        updated_at: '2023-05-01T19:14:43Z',
        sbom_links: 0,
        active: true
      }
    ],
    sbom_links: 0,
    risk_score: 11
  }
]

export const productVersionsData = dashboardTableData
export const productVersionsDataOriginal = [
  {
    logo: FaGithub,
    product: 'SBOM Quality Score (sbomqs)',
    version: '0.0.14',
    sbomlinks: 7,
    risk_score: 15,
    last_updated_at: '4 hours ago',
    active: true
  },
  {
    logo: FaTh,
    product: 'SBOM Toolkit (sbomtk)',
    version: '0.0.3',
    sbomlinks: 7,
    risk_score: 11,
    last_updated_at: '5 hours ago',
    active: true
  },
  {
    logo: FaCode,
    product: 'AWS SDK for C++',
    version: '1.4.3',
    sbomlinks: 0,
    risk_score: 32,
    last_updated_at: '6 hours ago',
    active: false
  },
  {
    logo: FaGithub,
    product: 'SBOM Library (sbomlc)',
    version: '0.0.43',
    sbomlinks: 0,
    risk_score: 26,
    last_updated_at: '8 hours ago',
    active: false
  },
  {
    logo: FaGithub,
    product: 'SBOM Assembler (sbomasm)',
    version: '0.0.2',
    sbomlinks: 0,
    risk_score: 22,
    last_updated_at: '22 hours ago',
    active: true
  },
  {
    logo: FaGithub,
    product: 'SBOM Explorer (sbomex)',
    version: '0.0.4',
    sbomlinks: 5,
    risk_score: 9,
    last_updated_at: '3 days ago',
    active: true
  },
  {
    logo: FaGithub,
    product: 'SBOM Quality Score (sbomqs)',
    version: '0.0.13',
    sbomlinks: 9,
    risk_score: 26,
    last_updated_at: '6 days ago',
    active: true
  },
  {
    logo: FaGithub,
    product: 'SBOM Library (sbomlc)',
    version: '0.0.42',
    sbomlinks: 0,
    risk_score: 19,
    last_updated_at: '6 days ago',
    active: false
  },
  {
    logo: FaTh,
    product: 'SBOM Benchmark (sbombenchmark.dev)',
    version: '0.1.19',
    sbomlinks: 0,
    risk_score: 19,
    last_updated_at: '6 days ago',
    active: false
  },
  {
    logo: FaGithub,
    product: 'SBOM Library (sbomlc)',
    version: '0.0.41',
    sbomlinks: 7,
    risk_score: 24,
    last_updated_at: '8 days ago',
    active: false
  },
  {
    logo: FaGithub,
    product: 'Vulnerability Datastore (vulnds)',
    version: '0.0.14',
    sbomlinks: 0,
    risk_score: 31,
    last_updated_at: '9 days ago',
    active: false
  },
  {
    logo: FaTh,
    product: 'SBOM Benchmark (sbombenchmark.dev)',
    version: '0.1.18',
    sbomlinks: 0,
    risk_score: 19,
    last_updated_at: '9 days ago',
    active: false
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

export const activitiesDataLong = [
  // Type, Product, Version, User, Notes, Timestamp
  {
    type: 'SBOM Shared',
    product: 'sbomasm',
    version: 'v0.0.9',
    user: 'Peter.Gregory@svc.ai',
    notes: '[IP Address] 24.4.61.235',
    timestamp: '11 MAR 3:11 PM',
    source: 'GitHub'
  },
  {
    type: 'SBOM Approved',
    product: 'sbomasm',
    version: 'v0.0.9',
    user: 'Ritesh.Noronha@interlynk.io',
    notes: '[IP Address] 24.4.211.231',
    timestamp: '11 MAR 09:14 AM',
    source: 'GitHub'
  },
  {
    type: 'SBOM Built',
    product: 'sbomex',
    version: 'v0.0.3',
    user: 'Ritesh.Noronha@interlynk.io',
    notes: '[Source] Github Actions',
    timestamp: '09 MAR 10:11 AM',
    source: 'GitHub'
  },
  {
    type: 'New Vulnerability',
    product: 'sbomex',
    version: 'v0.0.3',
    user: 'NVD-Monitor',
    notes: '[CVE] CVE-2023-24532, Severity: High',
    timestamp: '08 MAR 5:11 PM',
    source: 'GitHub'
  },
  {
    type: 'New Vulnerability',
    product: 'sbomex',
    version: 'v0.0.2',
    user: 'NVD-Monitor',
    notes: '[CVE] CVE-2023-24532, Severity: High',
    timestamp: '08 MAR 5:11 PM',
    source: 'GitHub'
  },
  {
    type: 'New Vulnerability',
    product: 'sbomex',
    version: 'v0.0.1',
    user: 'NVD-Monitor',
    notes: '[CVE] CVE-2023-24532, Severity: High',
    timestamp: '08 MAR 5:11 PM',
    source: 'GitHub'
  },
  {
    type: 'New Vulnerability',
    product: 'sbomst',
    version: 'v0.11.0',
    user: 'NVD-Monitor',
    notes: '[CVE] CVE-2023-24532, Severity: High',
    timestamp: '08 MAR 5:11 PM',
    source: 'GitHub'
  },
  {
    type: 'New Vulnerability',
    product: 'sbomst',
    version: 'v0.10.0',
    user: 'NVD-Monitor',
    notes: '[CVE] CVE-2023-24532, Severity: High',
    timestamp: '08 MAR 5:11 PM',
    source: 'GitHub'
  },
  {
    type: 'New Vulnerability',
    product: 'sbomst',
    version: 'v0.9.0',
    user: 'NVD-Monitor',
    notes: '[CVE] CVE-2023-24532, Severity: High',
    timestamp: '08 MAR 5:11 PM',
    source: 'GitHub'
  },
  {
    type: 'SBOM Assembled',
    product: 'sbombenchmark.dev',
    version: 'v0.0.1',
    user: 'Ritesh.Noronha@interlynk.io',
    notes: '[Source] Interlynk Assembler',
    timestamp: '06 MAR 1:11 PM',
    source: 'GitHub'
  },
  {
    type: 'SBOM Viewed',
    product: 'sbomqs',
    version: 'v0.0.4',
    user: 'Galvin.Belson@hooli.ai',
    notes: '[IP Address] 24.11.13.221',
    timestamp: '01 MAR 9:21 PM',
    source: 'GitHub'
  }
]

export const Vulnerabilities = [
  {
    id: uuidv4(),
    cve: 'CVE-2023-28322',
    cvss: '9.1',
    severity: 'Critical',
    component: 'libsqlite3-0',
    version: '3.27.2-3+deb10u2',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'An information disclosure vulnerability exists in curl <v8.1.0 when doing HTTP(S) transfers, libcurl migh ... The problem exists in the logic for a reused handle when it is (expected to be) changed from a PUT to a POST.',
    discovered: '2 months ago',
    status: 'In Triage',
    scanner: ['Grype'],
    shared_data: ['IBM'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2019-8457',
    cvss: '9.8',
    severity: 'Critical',
    component: 'libdb5.3',
    version: '5.3.28+dfsg1-0.5',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'SQLite3 from 3.6.0 to and including 3.27.2 is vulnerable to heap out-of-bound read in the rtreenode() function when handling invalid rtree tables.',
    discovered: '2 years ago',
    status: 'Not Affected',
    scanner: ['Grype', 'Scout'],
    shared_data: ['RedHat'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'GHSA-r9hx-vwmv-q579',
    cvss: '7.5',
    severity: 'High',
    component: 'setuptools',
    version: '58.1.0',
    fixed_component: '65.5.1',
    fixed_product: '0.0.2',
    description:
      'pypa/setuptools vulnerable to Regular Expression Denial of Service (ReDoS)',
    discovered: '1 year ago',
    status: 'Fixed',
    scanner: ['Scout', 'Trivy'],
    shared_data: ['Uber'],
    versions: 'v0.0.1'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-31484',
    cvss: '8.1',
    severity: 'High',
    component: 'libperl5.28',
    version: '5.28.1-6+deb10u1',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'CPAN.pm before 2.35 does not verify TLS certificates when downloading distributions over HTTPS.',
    discovered: '9 months ago',
    status: 'Not Affected',
    scanner: ['Grype'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-2953',
    cvss: '7.5',
    severity: 'High',
    component: 'libldap-common',
    version: '2.4.47+dfsg-3+deb10u7',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'A vulnerability was found in openldap. This security flaw causes a null pointer dereference in ber_memalloc_x() function.',
    discovered: '9 months ago',
    status: 'False Positive',
    scanner: ['Snyk'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-29491',
    cvss: '7.8',
    severity: 'High',
    component: 'libncursesw6',
    version: '6.1+20181013-2+deb10u3',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'ncurses before 6.4 20230408, when used by a setuid application, allows local users to trigger security-re ... minfo database file that is found in $HOME/.terminfo or reached via the TERMINFO or TERM environment variable.',
    discovered: '9 months ago',
    status: 'False Positive',
    scanner: ['Trivy'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-29007',
    cvss: '7.8',
    severity: 'High',
    component: 'git',
    version: '1:2.20.1-2+deb10u8',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'Git is a revision control system. Prior to versions 2.30.9, 2.31.8, 2.32.7, 2.33.8, 2.34.8, 2.35.8, 2.36. ... deinit` on untrusted repositories or without prior inspection of any submodule sections in `$GIT_DIR/config`.',
    discovered: '9 months ago',
    status: 'Not Affected',
    scanner: ['Grype', 'Snyk'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-28321',
    cvss: '7.5',
    severity: 'High',
    component: 'libcurl3-gnutls',
    version: '7.64.0-4+deb10u6',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'An improper certificate validation vulnerability exists in curl <v8.1.0 in the way it supports matching o ... eck for `x*`, which would match even though the IDN name most likely contained nothing even resembling an `x`.',
    discovered: '9 months ago',
    status: 'Affected',
    scanner: ['Custom'],
    shared_data: ['Uber'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-27534',
    cvss: '8.8',
    severity: 'High',
    component: 'libcurl3-gnutls',
    version: '7.64.0-4+deb10u6  ',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'A path traversal vulnerability exists in curl <8.0.0 SFTP implementation causes the tilde (~) character t ... ering or execute arbitrary code by crafting a path like /~2/foo while accessing a server with a specific user.',
    discovered: '9 months ago',
    status: 'In Triage',
    scanner: ['Trivy'],
    shared_data: ['IBM', 'Oracle', 'Uber'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-2650',
    cvss: '7.5',
    severity: 'High',
    component: 'libssl1.1',
    version: '7.64.0-4+deb10u6',
    fixed_component: '1.1.1v',
    fixed_product: '0.0.3',
    description:
      'Issue summary: Processing some specially crafted ASN.1 object identifiers or data containing them may be ... by this issue in such a way that it would be cause for concern, and the severity is therefore considered low.',
    discovered: '9 months ago',
    status: 'In Triage',
    scanner: ['Grype'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-25652',
    cvss: '7.5',
    severity: 'High',
    component: 'git',
    version: '1:2.20.1-2+deb10u8',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'Git is a revision control system. Prior to versions 2.30.9, 2.31.8, 2.32.7, 2.33.8, 2.34.8, 2.35.8, 2.36. ... ore applying; avoid applying one that create a conflict where a link corresponding to the `*.rej` file exists.',
    discovered: '9 months ago',
    status: 'False Positive',
    scanner: ['Snyk', 'Trivy'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-24329',
    cvss: '7.5',
    severity: 'High',
    component: 'python',
    version: '3.9.17',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'An issue in the urllib.parse component of Python before 3.11.4 allows attackers to bypass blocklisting methods by supplying a URL that starts with blank characters.',
    discovered: '9 months ago',
    status: 'Not Affected',
    scanner: ['Trivy'],
    shared_data: ['Uber'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2020-13631',
    cvss: '5.5',
    severity: 'Low',
    component: 'libsqlite3-0',
    version: '3.27.2-3+deb10u2',
    fixed_component: '3.31',
    fixed_product: '0.0.3',
    description:
      'SQLite before 3.32.0 allows a virtual table to be renamed to the name of one of its shadow tables, related to alter.c and build.c.',
    status: 'Affected',
    scanner: ['Trivy'],
    shared_data: ['IBM'],
    versions: 'v0.0.1, v0.0.2'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2019-19924',
    cvss: '5.3',
    severity: 'Low',
    component: 'libsqlite3-0',
    version: '3.27.2-3+deb10u2',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'SQLite 3.30.1 mishandles certain parser-tree rewriting, related to expr.c, vdbeaux.c, and window.c. This is caused by incorrect sqlite3WindowRewrite() error handling.',
    status: 'Affected',
    scanner: ['Custom'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2019-19645',
    cvss: '5.5',
    severity: 'Low',
    component: 'libsqlite3-0',
    version: '3.27.2-3+deb10u2',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'alter.c in SQLite through 3.30.1 allows attackers to trigger infinite recursion via certain types of self-referential views in conjunction with ALTER TABLE statements.',
    status: 'Affected',
    scanner: ['Snyk', 'Trivy'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2019-13627',
    cvss: '6.3',
    severity: 'Medium',
    component: 'libgcrypt20',
    version: '1.8.4-5+deb10u1',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'It was discovered that there was a ECDSA timing attack in the libgcrypt20 cryptographic library. Version affected: 1.8.4-5, 1.7.6-2+deb9u3, and 1.6.3-2+deb8u4. Versions fixed: 1.8.5-2 and 1.6.3-2+deb8u7.',
    status: 'Not Affected',
    scanner: ['Trivy'],
    shared_data: ['IBM'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2018-10892',
    cvss: '6.3',
    severity: 'Medium',
    component: 'docker',
    version: '6.0.1',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'The default OCI linux spec in oci/defaults{_linux}.go in Docker/Moby from 1.11 to current does not block ... n attacker to modify hosts hardware like enabling/disabling bluetooth or turning up/down keyboard brightness.',
    status: 'False Positive',
    scanner: ['Grype'],
    shared_data: ['Oracle'],
    versions: 'v0.0.1, v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2007-4559',
    cvss: '6.8',
    severity: 'Medium',
    component: 'python',
    version: '3.9.17',
    fixed_component: '3.9.19',
    fixed_product: 'N/A',
    description:
      'Directory traversal vulnerability in the (1) extract and (2) extractall functions in the tarfile module i ... e arbitrary files via a .. (dot dot) sequence in filenames in a TAR archive, a related issue to CVE-2001-1267.',
    status: 'In Triage',
    scanner: ['Scout', 'Trivy'],
    shared_data: ['Uber'],
    versions: 'v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-31486',
    cvss: '5.1',
    severity: 'Low',
    component: 'libperl5.28',
    version: '5.28.1-6+deb10u1',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'HTTP::Tiny 0.082, a Perl core module since 5.13.9 and available standalone on CPAN, has an insecure default TLS configuration where users must opt in to verify certificates.',
    status: 'False Positive',
    scanner: ['Trivy'],
    shared_data: ['Redhat'],
    versions: 'v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-29383',
    cvss: '5.5',
    severity: 'Low',
    component: 'login',
    version: '1:4.5-1.1',
    fixed_component: '1:5.0',
    fixed_product: 'N/A',
    description:
      'In Shadow 4.13, it is possible to inject control characters into fields provided to the SUID program chfn ... rect, social-engineered denial of service) by demonstrating that "cat /etc/passwd" shows a rogue user account.',
    status: 'In Triage',
    scanner: ['Trivy'],
    shared_data: ['Uber'],
    versions: 'v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-28320',
    cvss: '5.9',
    severity: 'Low',
    component: 'libcurl3-gnutls',
    version: '7.64.0-4+deb10u6',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'A denial of service vulnerability exists in curl <v8.1.0 in the way libcurl provides several different ba ... er that was not mutex protected and a multi-threaded application might therefore crash or otherwise misbehave.',
    status: 'Fixed',
    scanner: ['Grype'],
    shared_data: ['IBM'],
    versions: 'v0.0.2, v0.0.3'
  },
  {
    id: uuidv4(),
    cve: 'CVE-2023-25815',
    cvss: '3.3',
    severity: 'Low',
    component: 'git',
    version: '1:2.20.1-2+deb10u8',
    fixed_component: 'N/A',
    fixed_product: 'N/A',
    description:
      'In Git for Windows, the Windows port of Git, no localized messages are shipped with the installer. As a c ... and leave it empty. Users who have administrative rights may remove the permission to create folders in `C:.',
    status: 'Not Affected',
    scanner: ['Grype'],
    shared_data: ['Oracle'],
    versions: 'v0.0.2, v0.0.3'
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

export const SBOMLinks = [
  {
    id: uuidv4(),
    link: 'https://dashboard-app.fly.dev/#/admin/dashboard/sbom/z55E8gz3FN',
    shared_with: [],
    created: '2023-04-15T19:14:43Z',
    visits: 13,
    active: true,
    project: 'SBOM Quality Score (sbomqs)',
    version: '1.0.0',
    conf_email: true,
    conf_terms: true,
    redactions: true,
    components: true,
    licenses: true,
    vulnerabilities: false,
    cyclonedx: false,
    spdx: true
  },
  {
    id: uuidv4(),
    link: 'https://dashboard-app.fly.dev/#/admin/dashboard/sbom/9eD8gz3FN',
    shared_with: ['IBM'],
    created: '2023-04-11T19:14:43Z',
    visits: 2,
    active: true,
    project: 'SBOM Quality Score (sbomqs)',
    version: '1.0.0',
    conf_email: true,
    conf_terms: false,
    redactions: false,
    components: true,
    licenses: false,
    vulnerabilities: true,
    cyclonedx: false,
    spdx: true,
    redacted: false
  },
  {
    id: uuidv4(),
    link: 'https://dashboard-app.fly.dev/#/admin/dashboard/sbom/88eF59gkYY',
    shared_with: ['IBM', 'Oracle', 'HP', 'Uber'],
    created: '2023-01-04T19:14:43Z',
    visits: 130,
    active: true,
    project: 'SBOM Quality Score (sbomqs)',
    version: '1.0.0',
    conf_email: true,
    conf_terms: false,
    redactions: false,
    components: true,
    licenses: false,
    vulnerabilities: false,
    cyclonedx: true,
    spdx: false,
    redacted: false
  },
  {
    id: uuidv4(),
    link: 'https://dashboard-app.fly.dev/#/admin/dashboard/sbom/k82G7l2BY6',
    shared_with: ['Oracle', 'Uber'],
    created: '2023-03-05T19:14:43Z',
    visits: 3,
    active: true,
    project: 'SBOM Quality Score (sbomqs)',
    version: '1.0.0',
    conf_email: true,
    conf_terms: false,
    redactions: false,
    components: true,
    licenses: true,
    vulnerabilities: false,
    cyclonedx: true,
    spdx: false,
    redacted: false
  }
]

export const tablesTableData = [
  {
    logo: avatar1,
    name: 'Esthera Jackson',
    email: 'alexa@simmmple.com',
    subdomain: 'Manager',
    domain: 'Organization',
    status: 'Online',
    date: '14/06/21'
  },
  {
    logo: avatar2,
    name: 'Alexa Liras',
    email: 'laurent@simmmple.com',
    subdomain: 'Programmer',
    domain: 'Developer',
    status: 'Offline',
    date: '12/05/21'
  },
  {
    logo: avatar3,
    name: 'Laurent Michael',
    email: 'laurent@simmmple.com',
    subdomain: 'Executive',
    domain: 'Projects',
    status: 'Online',
    date: '07/06/21'
  },
  {
    logo: avatar4,
    name: 'Freduardo Hill',
    email: 'freduardo@simmmple.com',
    subdomain: 'Manager',
    domain: 'Organization',
    status: 'Online',
    date: '14/11/21'
  },
  {
    logo: avatar5,
    name: 'Daniel Thomas',
    email: 'daniel@simmmple.com',
    subdomain: 'Programmer',
    domain: 'Developer',
    status: 'Offline',
    date: '21/01/21'
  },
  {
    logo: avatar7,
    name: 'Mark Wilson',
    email: 'mark@simmmple.com',
    subdomain: 'Designer',
    domain: 'UI/UX Design',
    status: 'Offline',
    date: '04/09/20'
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

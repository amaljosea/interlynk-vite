import { AiOutlineExclamation } from 'react-icons/ai'
import {
  FaArrowDown,
  FaArrowUp,
  FaBug,
  FaEye,
  FaFilePdf,
  FaGithub,
  FaShare,
  FaThumbsUp,
  FaTools
} from 'react-icons/fa'

export const sbomOrigin = [
  {
    value: 'demo-upload',
    type: 'product',
    origin: 'manual',
    link: '#'
  },
  {
    value: 'sbom-zen',
    type: 'product',
    origin: 'github',
    link: 'https://github.com/interlynk-io/lynk-dash-app/actions/runs/9925589195'
  },
  {
    value: '2.0.31',
    type: 'sbom',
    origin: 'github',
    link: 'https://github.com/interlynk-io/lynk-dash-app/actions/runs/9925589195'
  },
  {
    value: '2.0.32',
    type: 'sbom',
    origin: 'external',
    link: '/vendor/requests'
  },
  {
    value: '2.0.33',
    type: 'sbom',
    origin: 'actions',
    link: 'https://github.com/interlynk-io/lynk-dash-app/actions/runs/9925589195'
  },
  {
    value: '2.0.34',
    type: 'sbom',
    origin: 'jenkins',
    link: 'https://github.com/interlynk-io/lynk-dash-app/actions/runs/9925589195'
  },
  {
    value: '2.0.35',
    type: 'sbom',
    origin: 'manual',
    link: '#'
  }
]

export const settingsData = {
  introduction: {
    name: 'Introduction',
    slug: '/docs',
    children: {
      overview: {
        name: 'Overview',
        slug: '/docs/overview',
        component: () => <p>Text</p>,
        section: 'Overview'
      },
      gettingStarted: {
        name: 'Getting started',
        slug: '/docs/getting-started',
        component: () => <p>Text</p>,
        section: 'Overview'
      }
    }
  }
}

export const ruleSubjectOperatorMapping = [
  {
    category: 'Component',
    name: 'CPE',
    key: 'component_cpe',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Component CPE'
  },
  {
    category: 'Component',
    name: 'License',
    key: 'component_licenses_exp',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Component License'
  },
  {
    category: 'Component',
    name: 'Name',
    key: 'component_group',
    operators: ['Is'],
    subject: 'Component Name'
  },
  {
    category: 'Component',
    name: 'PURL',
    key: 'component_purl',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Component PURL'
  },
  {
    category: 'Component',
    name: 'Supplier',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Component Supplier'
  },
  {
    category: 'Component',
    name: 'Supplier: Organization Name',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Component Supplier: Organization Name'
  },
  {
    category: 'Component',
    name: 'Supplier: Contact Name',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Component Supplier: Contact Name'
  },
  {
    category: 'Component',
    name: 'Supplier: Contact Email',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Component Supplier: Contact Email'
  },
  {
    category: 'Component',
    name: 'Version',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Component Version'
  },
  {
    category: 'Version',
    name: 'Author',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Version Author'
  },
  {
    category: 'Version',
    name: 'Author: Name',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Version Author: Name'
  },
  {
    category: 'Version',
    name: 'Author: Email',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Version Author: Email'
  },
  {
    category: 'Version',
    name: 'Primary Component',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Version Primary Component'
  },
  {
    category: 'Version',
    name: 'Supplier',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Version Supplier'
  },
  {
    category: 'Version',
    name: 'Supplier: Contact Email',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Version Supplier: Contact Email'
  },
  {
    category: 'Version',
    name: 'Supplier: Organization Name',
    operators: ['Is', 'Exists', 'Not Exists'],
    subject: 'Version Supplier: Organization Name'
  }
]

export const sagLabelTypes = [
  'all',
  'Apple Trusted Product',
  'CSA Verified Product',
  'EUCC Certified Product',
  'EU CE Mark',
  'Hitachi Trusted Product',
  'Rockwell Automation Trusted Product',
  'SAG Purl SWID Trusted Product',
  'SAGScore',
  'SAG Trusted Artifact',
  'SAG Trusted Internet Web API',
  'SAG Trusted Product',
  'SAG Trusted Software',
  'SAG Trusted Web Site',
  'Standards Australia Trusted Product',
  'Trust Bond',
  'United Stated DOD Trusted Product',
  'United States DHS Trusted Product',
  'United States DOE Trusted Product',
  'United States FCC Trusted Product',
  'United States FDA Trusted Product',
  'United States VA Trusted Product',
  'U.S. Cyber Trust Mark',
  'US DOE CyTRICS Tested Product'
]

export const sagCategories = [
  'all',
  'Internet Web Service API',
  'IOT Digital Product, unspecified type',
  'Smart Phone Product',
  'Desktop Software Application',
  'FIRMWARE',
  'IOT Assistant Device',
  'Smart Device Mobile Application',
  'Software Bill of Materials',
  'Enterprise Software Application',
  'Battery Inverter Software',
  'Video Surveillance Monitoring Software',
  'Operating System',
  'Solar Inverter Software',
  'Wind Inverter Software',
  'Software Vulnerability Disclosure Report',
  'Smart TV product',
  'Vendor Response File',
  'Video Surveillance Camera',
  'Internet Web Site',
  'Wireless Camera IOT Product'
]

export const sagData = [
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAGCTR_inquiry/getByProdCatlabel',
    productVersion: '2024-0316_SAG-CTR',
    sagScore: 23.75,
    currentDate: '2024-03-18',
    category: 'Internet Web Service API',
    label: 'SAG Trusted Internet Web API'
  },
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAGCTR_inquiry/getlabels',
    productVersion: '2024-0315_SAG-CTR',
    sagScore: 15.25,
    currentDate: '2024-03-17',
    category: 'Internet Web Service API',
    label: 'SAG Trusted Internet Web API'
  },
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAGCTR_inquiry/getProductCategories',
    productVersion: '2024-0307_SAG-CTR',
    sagScore: 10.75,
    currentDate: '2024-03-16',
    category: 'Internet Web Service API',
    label: 'SAG Trusted Internet Web API'
  },
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAGCTR_inquiry/getTrustedProduct',
    productVersion: '2024-0307_SAG-CTR',
    sagScore: 21.11,
    currentDate: '2024-03-15',
    category: 'Internet Web Service API',
    label: 'SAG Trusted Internet Web API'
  },
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAG-PM (TM)',
    productVersion: '1.2',
    sagScore: 34.23,
    currentDate: '2024-03-15',
    category: 'Desktop Software Application',
    label: 'SAG Trusted Software'
  },
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAG-PM (TM)',
    productVersion: '1.2.1',
    sagScore: 65.23,
    currentDate: '2024-03-14',
    category: 'Desktop Software Application',
    link: 'https://softwareassuranceguardian.com/SAG-PM_VendorResponse_V1_2_2.xml',
    label: 'SAG Trusted Software'
  },
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAG-PM (TM)',
    productVersion: '1.2.2',
    sagScore: 11.05,
    currentDate: '2024-03-13',
    category: 'Desktop Software Application',
    label: 'SAG Purl SWID Trusted Product'
  },
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAG-PM (TM)',
    productVersion: '1.2.2',
    sagScore: 23.75,
    currentDate: '2024-03-12',
    category: 'Vendor Response File',
    label: 'SAG Trusted Artifact'
  },
  {
    supplierName: 'Reliable Energy Analytics LLC',
    productName: 'SAG-PM (TM)',
    productVersion: '1.2.2',
    sagScore: 44.75,
    currentDate: '2024-03-10',
    category: 'Desktop Software Application',
    link: 'https://softwareassuranceguardian.com/SAG-PM_VendorResponse_V1_2_2.xml',
    label: 'SAG Trusted Software'
  },
  {
    supplierName: 'Interlynk',
    productName: 'https://www.interlynk.io/',
    productVersion: '2023-0320',
    sagScore: 21.25,
    currentDate: '2024-03-20',
    category: 'Internet Web Site',
    link: 'https://softwareassuranceguardian.com/SAG-PM_VendorResponse_V1_2_2.xml',
    label: 'SAG Trusted Web Site'
  }
]

export const openSsf = [
  {
    name: 'pkg:pypi/acme@1.13.0',
    score: 5.9
  },
  {
    name: 'pkg:pypi/aiodns@2.0.0',
    score: 4.4
  },
  {
    name: 'pkg:pypi/aiohttp@3.7.3',
    score: 7.8
  },
  {
    name: 'pkg:pypi/altgraph@0.17',
    score: 3.5
  },
  {
    name: 'pkg:pypi/async-timeout@3.0.1',
    score: 5.6
  },
  {
    name: 'pkg:pypi/boto3@1.16.51',
    score: 7.9
  },
  {
    name: 'pkg:pypi/botocore@1.19.51',
    score: 8.5
  },
  {
    name: 'pkg:pypi/certbot@1.13.0',
    score: 5.9
  },
  {
    name: 'pkg:pypi/certifi@2021.5.30',
    score: 7.6
  },
  {
    name: 'pkg:pypi/cffi@1.14.4',
    score: 4.9
  },
  {
    name: 'pkg:pypi/chardet@3.0.4',
    score: 4.1
  },
  {
    name: 'pkg:pypi/configargparse@1.4',
    score: 3.5
  },
  {
    name: 'pkg:pypi/configobj@5.0.6',
    score: 3.6
  },
  {
    name: 'pkg:pypi/cryptography@3.3.1',
    score: 8.5
  },
  {
    name: 'pkg:pypi/cyclonedx-bom@0.4.3',
    score: 5.1
  },
  {
    name: 'pkg:pypi/cyclonedx-python-lib@0.4.0',
    score: 5.4
  },
  {
    name: 'pkg:pypi/datedelta@1.3',
    score: 3.0
  },
  {
    name: 'pkg:pypi/distro@1.5.0',
    score: 4.5
  },
  {
    name: 'pkg:pypi/dnspython@2.0.0',
    score: 6.4
  },
  {
    name: 'pkg:pypi/elementpath@2.1.1',
    score: 4.8
  },
  {
    name: 'pkg:pypi/future@0.18.2',
    score: 5.8
  },
  {
    name: 'pkg:pypi/geoip2@4.1.0',
    score: 6.1
  },
  {
    name: 'pkg:pypi/idna@2.10',
    score: 6.9
  },
  {
    name: 'pkg:pypi/importlib-metadata@4.8.1',
    score: 6.4
  },
  {
    name: 'pkg:pypi/ipwhois@1.2.0',
    score: 3.8
  },
  {
    name: 'pkg:pypi/isodate@0.6.0',
    score: 4.5
  },
  {
    name: 'pkg:pypi/jinja2@2.11.2',
    score: 7.0
  },
  {
    name: 'pkg:pypi/jmespath@0.10.0',
    score: 4.7
  },
  {
    name: 'pkg:pypi/josepy@1.8.0',
    score: 4.4
  },
  {
    name: 'pkg:pypi/jsonschema@3.2.0',
    score: 6.0
  },
  {
    name: 'pkg:pypi/lxml@4.6.2',
    score: 6.8
  },
  {
    name: 'pkg:pypi/markupsafe@1.1.1',
    score: 7.1
  },
  {
    name: 'pkg:pypi/multidict@5.1.0',
    score: 6.6
  },
  {
    name: 'pkg:pypi/numpy@1.19.5',
    score: 8.8
  },
  {
    name: 'pkg:pypi/packageurl-python@0.9.3',
    score: 4.9
  },
  {
    name: 'pkg:pypi/packaging@20.7',
    score: 7.4
  },
  {
    name: 'pkg:pypi/pandas@1.2.0',
    score: 6.4
  },
  {
    name: 'pkg:pypi/parsedatetime@2.6',
    score: 2.3
  },
  {
    name: 'pkg:pypi/pefile@2019.4.18',
    score: 3.9
  },
  {
    name: 'pkg:pypi/pillow@9.2.0',
    score: 7.1
  },
  {
    name: 'pkg:pypi/psycopg2@2.8.6',
    score: 4.9
  },
  {
    name: 'pkg:pypi/pycares@3.1.1',
    score: 4.5
  },
  {
    name: 'pkg:pypi/pycparser@2.20',
    score: 6.1
  },
  {
    name: 'pkg:pypi/pycurl@7.43.0.6',
    score: 4.5
  },
  {
    name: 'pkg:pypi/pydnsbl@1.1.2',
    score: 3.8
  },
  {
    name: 'pkg:pypi/pyinstaller-hooks-contrib@2020.11',
    score: 5.6
  },
  {
    name: 'pkg:pypi/pyinstaller@4.1',
    score: 4.9
  },
  {
    name: 'pkg:pypi/pyopenssl@20.0.1',
    score: 5.9
  },
  {
    name: 'pkg:pypi/pyparsing@2.4.7',
    score: 6.7
  },
  {
    name: 'pkg:pypi/pyrfc3339@1.1',
    score: 2.9
  },
  {
    name: 'pkg:pypi/pyrsistent@0.17.3',
    score: 4.3
  },
  {
    name: 'pkg:pypi/python-dateutil@2.8.1',
    score: 6.1
  },
  {
    name: 'pkg:pypi/python-multipart@0.0.5',
    score: 5.0
  },
  {
    name: 'pkg:pypi/pytz@2020.5',
    score: 5.4
  },
  {
    name: 'pkg:pypi/pywin32-ctypes@0.2.0',
    score: 3.8
  },
  {
    name: 'pkg:pypi/pywin32@300',
    score: 4.7
  },
  {
    name: 'pkg:pypi/pyyaml@5.3.1',
    score: 6.1
  },
  {
    name: 'pkg:pypi/rdflib@5.0.0',
    score: 5.9
  },
  {
    name: 'pkg:pypi/requests-toolbelt@0.9.1',
    score: 4.9
  },
  {
    name: 'pkg:pypi/requests@2.25.0',
    score: 8.8
  },
  {
    name: 'pkg:pypi/requirements-parser@0.2.0',
    score: 3.3
  },
  {
    name: 'pkg:pypi/s3transfer@0.3.3',
    score: 6.8
  },
  {
    name: 'pkg:pypi/simplejson@3.17.2',
    score: 4.8
  },
  {
    name: 'pkg:pypi/six@1.15.0',
    score: 4.3
  },
  {
    name: 'pkg:pypi/stix2-patterns@1.3.2',
    score: 4.6
  },
  {
    name: 'pkg:pypi/stix2@2.1.0',
    score: 4.4
  },
  {
    name: 'pkg:pypi/taxii2-client@2.2.2',
    score: 3.9
  },
  {
    name: 'pkg:pypi/toml@0.10.2',
    score: 5.3
  },
  {
    name: 'pkg:pypi/typing-extensions@3.7.4.3',
    score: 6.7
  },
  {
    name: 'pkg:pypi/urllib3@1.26.2',
    score: 9.1
  },
  {
    name: 'pkg:pypi/wincertstore@0.2',
    score: 3.0
  },
  {
    name: 'pkg:pypi/xmlschema@1.2.5',
    score: 4.8
  },
  {
    name: 'pkg:pypi/xmltodict@0.12.0',
    score: 4.8
  },
  {
    name: 'pkg:pypi/yarl@1.6.3',
    score: 6.7
  },
  {
    name: 'pkg:pypi/zipp@3.5.0',
    score: 6.6
  },
  {
    name: 'pkg:pypi/zope.component@5.0.0',
    score: 4.8
  },
  {
    name: 'pkg:pypi/zope.event@4.5.0',
    score: 4.8
  },
  {
    name: 'pkg:pypi/zope.hookable@5.0.1',
    score: 5.0
  },
  {
    name: 'pkg:pypi/zope.interface@5.3.0',
    score: 5.9
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

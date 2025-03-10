import BSI from 'assets/img/bsi.jpg'
import FDA from 'assets/img/fda.jpg'
import NTIA from 'assets/img/ntia.jpg'
import { getFullDate } from 'utils'

import { Stack, Text } from '@chakra-ui/react'

export const componentLinkTypes = [
  'vcs',
  'issue-tracker',
  'website',
  'advisories',
  'bom',
  'mailing-list',
  'social',
  'chat',
  'documentation',
  'support',
  'distribution',
  'license',
  'build-meta',
  'build-system',
  'release-notes',
  'other'
]

export const stages = [
  { value: 'none', label: 'None' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'released', label: 'Released' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'end_of_support', label: 'End of Support' },
  { value: 'end_of_life', label: 'End of Life' }
]

export const sbomPhases = [
  { label: 'Design', value: 'design' },
  { label: 'Source', value: 'source' },
  { label: 'Build', value: 'build' },
  { label: 'Analyzed', value: 'analyzed' },
  { label: 'Deployed', value: 'deployed' },
  { label: 'Runtime', value: 'runtime' }
]

export const licenseStatusTypes = [
  'Approved',
  'Rejected',
  'Replace',
  'Procured',
  'Acceptable Risk'
]

export const severityList = ['critical', 'high', 'low', 'medium', 'unknown']

export const vulnStatusTypes = [
  'Unspecified',
  'In Triage',
  'Not Affected',
  'Affected',
  'Fixed'
]

export const componentTypes = [
  'application',
  'container',
  'data',
  'device',
  'device-driver',
  'file',
  'firmware',
  'framework',
  'library',
  'machine-learning-model',
  'operating-system',
  'platform'
]

export const namespaceOptions = {
  alpm: [
    { value: '', label: '-- Select --' },
    { value: 'arch', label: 'arch' },
    { value: 'arch32', label: 'arch32' },
    { value: 'archarm', label: 'archarm' },
    { value: 'manjaro', label: 'manjaro' },
    { value: 'msys', label: 'msys' }
  ],
  apk: [
    { value: '', label: '-- Select --' },
    { value: 'alpine', label: 'alpine' },
    { value: 'openwrt', label: 'openwrt' }
  ],
  bitnami: [],
  cocoapods: [],
  cargo: [],
  conda: [],
  cran: [],
  deb: [
    { value: '', label: '-- Select --' },
    { value: 'debian', label: 'debian' },
    { value: 'ubuntu', label: 'ubuntu' }
  ],
  generic: [],
  hackage: [],
  mflow: [],
  nuget: [],
  oci: [],
  pub: [],
  pypi: []
}

export const allDefaultActions = [
  {
    id: 'home',
    name: 'Home',
    section: 'navigation',
    path: '/vendor/dashboard'
  },
  {
    id: 'products',
    name: 'Products',
    section: 'navigation',
    path: '/vendor/products'
  },
  {
    id: 'requests',
    name: 'Requests',
    section: 'navigation',
    path: '/vendor/requests'
  },
  {
    id: 'vulnerabilities',
    name: 'Vulnerabilities',
    section: 'navigation',
    path: '/vendor/vulnerabilities?tab=productVulnerabilities'
  },
  {
    id: 'licenses',
    name: 'Licenses',
    section: 'navigation',
    path: '/vendor/licenses'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    section: 'navigation',
    path: '/vendor/analytics'
  },
  {
    id: 'tools',
    name: 'Tools',
    section: 'navigation',
    path: '/vendor/tools'
  },
  {
    id: 'support',
    name: 'Support',
    section: 'navigation',
    path: '/vendor/support'
  },
  {
    id: 'policies',
    name: 'Policies',
    section: 'navigation',
    path: '/vendor/policies'
  },
  {
    id: 'settings',
    name: 'Settings',
    section: 'navigation',
    path: '/vendor/settings?tab=users'
  }
]

export const settingActions = [
  {
    id: 'users',
    name: 'Users',
    section: 'Organization',
    path: '/vendor/settings?tab=users'
  },
  {
    id: 'roles',
    name: 'Roles',
    section: 'Organization',
    path: '/vendor/settings?tab=roles'
  },
  {
    id: 'feeds',
    name: 'Feeds',
    section: 'Organization',
    path: '/vendor/settings?tab=feeds'
  },
  {
    id: 'compliance',
    name: 'Compliance',
    section: 'Organization',
    path: '/vendor/settings?tab=compliance'
  },
  {
    id: 'lists',
    name: 'Lists',
    section: 'Organization',
    path: '/vendor/settings?tab=lists'
  },
  {
    id: 'legal',
    name: 'Legal',
    section: 'Organization',
    path: '/vendor/settings?tab=legal'
  },
  {
    id: 'integrations-org',
    name: 'Integrations (Org)',
    section: 'Organization',
    path: '/vendor/settings?tab=integrations-org'
  },
  {
    id: 'health',
    name: 'Health',
    section: 'Organization',
    path: '/vendor/settings?tab=health'
  },
  {
    id: 'plan',
    name: 'Plan',
    section: 'Organization',
    path: '/vendor/settings?tab=plan'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    section: 'Personal',
    path: '/vendor/settings?tab=integrations'
  },
  {
    id: 'security-tokens',
    name: 'Security Tokens',
    section: 'Personal',
    path: '/vendor/settings?tab=security tokens'
  },
  {
    id: 'custom-fields',
    name: 'Custom Fields',
    section: 'Organization',
    path: '/vendor/settings?tab=custom-fields'
  }
]

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-inline-comments */
export const tagColors = [
  '#ff6900',
  '#fcb900',
  '#7bdcb5',
  '#00d084',
  '#8ed1fc',
  '#0693e3',
  '#abb8c3',
  '#eb144c',
  '#f78da7',
  '#9900ef',
  '#795548',
  '#00bcd4',
  '#3f51b5',
  '#009688'
]
/* eslint-enable no-restricted-syntax */
/* eslint-enable no-inline-comments */

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

// VEX STATUS TOOLTIPS
export const vexInfoData = [
  {
    title: 'Status',
    desc: 'Declares the current state of an occurrence of a vulnerability, after automated or manual analysis.'
  },
  {
    title: 'Justification',
    desc: 'For statements conveying a "not affected" status, a VEX statement MUST include either a status justification or an impact statement informing why the product is not affected by the vulnerability. Justifications are fixed labels defined by VEX. See Status Justifications below for valid values.'
  },
  {
    title: 'Response',
    desc: 'A response to the vulnerability by the manufacturer, supplier, or project responsible for the affected component or service. Responses are strongly encouraged for vulnerabilities where the analysis state is exploitable.'
  },
  {
    title: 'Fixed Version',
    desc: 'For "affected" status with "update" response, Fixed Version can be used to indicate which version of the product includes a fix.'
  },
  {
    title: 'Impact Statement',
    desc: 'For status “not affected”, if justification is not provided, an impact statement must be included \
    that further explains how or why the listed product is “not affected” by this vulnerability. Impact Statement is optional if a justification is provided.'
  },
  {
    title: 'Action Statement',
    desc: `For status “affected”, an action statement must be included that describes actions to remediate or mitigate the vulnerability.`
  },
  {
    title: 'Details',
    desc: `Detailed description of the impact including methods used during assessment. If a vulnerability is not exploitable, this field should include specific details on why the component or service is not impacted by this vulnerability.`
  },
  {
    title: 'Internal Notes',
    desc: `Internal notes or observations made by the team handling the vulnerability, which may include additional context, discussions, or considerations relevant to the analysis or response process. \
    These notes are not exported with the product SBOM or VEX are only used for internal communication and documentation purposes.`
  }
]

// SBOM TOOLTIPS
export const infoData = [
  {
    title: `Created At`,
    desc: `Creatat At is the date and time that the SBOM describing this version was produced. This can be different than when the SBOM was imported into the Interlynk system.`
  },
  {
    title: `SBOM Phases`,
    desc: `Phases identify the product lifecycle phase(s) that this SBOM represents.`
  },
  {
    title: `Creation Tool`,
    desc: `Creation Tool(s) identify all the software tools and their versions used in building the SBOM. Interlynk is automatically added as one of the tools.`
  },
  {
    title: `Authors`,
    desc: `The Author Name is the name of the entity that created the SBOM data.`
  },
  {
    title: `Supplier`,
    desc: `Supplier identifies the name and email of the organization that built, distributed or packaged the application. For open-source components, Supplier can refer to the name of the project or entity distributing the project.`
  },
  {
    title: `Run Vulnerability Scan`,
    desc: `This setting lets you turn on or off vulnerability scanning for your system. It's best to keep this turned on.`
  },
  {
    title: `Retain Vulnerability Status`,
    desc: `This settings lets you turn on or off copying of vulnerability status, when an sbom is imported, whose version matches an existing one.`
  },
  {
    title: `Run SBOM Checks`,
    desc: `This setting lets you decide whether to turn on or off SBOM checks when importing. These checks help you find any issues with the SBOMs you're bringing in.`
  },
  {
    title: `Apply Automation Rules`,
    desc: `This setting decides whether the automation rules set up for the environment should run when importing SBOMs.`
  },
  {
    title: `Run Internal Labeling`,
    desc: `This setting lets you choose whether components are marked as internal when you import an SBOM.`
  },
  {
    title: `Run Auto Archive`,
    desc: `This setting will auto-archive any enabled versions which is not the latest uploaded version.`
  },
  {
    title: `Run Component Support Analysis`,
    desc: `This setting lets you control if Interlynk's component support analysis should be automatically applied to the component support status`
  },
  {
    title: `Retain Vulnerability Status with Version`,
    desc: `This setting lets you choose how long the SBOM data is kept before it's deleted. Once it's gone, you can't get it back.`
  },
  {
    title: `Manufacturer`,
    desc: (
      <Stack>
        <Text>
          This setting allows you to select a manufacturer as the default for
          the environment. When sboms are exported, this is used to set the
          manufacturer.
        </Text>
        <Text>Setup Manufacturer Identities under -</Text>
        <Text>Settings ➡️ Organization ➡️ Legal</Text>
      </Stack>
    )
  },
  {
    title: `Jira Default Project`,
    desc: `This setting allows you to select a default Jira project. Please configure Jira in the Organizarion settings.`
  },
  {
    title: `Component Name`,
    desc: `The component name within an SBOM serves as a unique identifier for a particular software component, helping to distinguish it from others and providing clarity when referring to or discussing components within the software supply chain.`
  },
  {
    title: `Component Description`,
    desc: `Component description refers to the specific description or release of a software component that is included in the SBOM.`
  },
  {
    title: `Component Version`,
    desc: `A component version refers to the specific version or release of a software component that is included in the SBOM. It indicates the precise iteration of the component being referenced within the software product.`
  },
  {
    title: `Component Group`,
    desc: `A component group refers to a categorization or grouping of related software components. This will often be a shortened, single name of the company or project that produced the component, or the source package or domain name. Whitespace and special characters should be avoided. Examples include: apache, org.apache.commons, and apache.org.`
  },
  {
    title: `Component Type`,
    desc: `A component type provides information about the primary purpose of the identified component. The type is intrinsic to how the component is being used rather than the content of the component`
  },
  {
    title: `Component License`,
    desc: `Component license refers to the licensing terms and conditions associated with a specific software component listed in the SBOM document.`
  },
  {
    title: `Component Identifiers`,
    desc: `Component identifiers refer to unique identifiers assigned to each software component listed in the SBOM document. These identifiers serve to uniquely identify and distinguish one component from another within the software inventory.`
  },
  {
    title: `Component Scope`,
    desc: `Component scope specifies the scope of the component to help separate rqeuired components from optional components. If the scope is not specified, 'required' is assumed.`
  },
  {
    title: `Primary Component`,
    desc: `A component is marked primary when the component itself is the subject of the SBOM.`
  },
  {
    title: `Internal Component`,
    desc: `A component is marked internal when the component is represents internally developed components.`
  },
  {
    title: `Support Level`,
    desc: `The software level of support provided through monitoring and maintenance from the software component manufacturer (e.g., actively maintained or abandoned)`
  },
  {
    title: `End-of-Support Date`,
    desc: `The end-of-support date refers to the point in time when a company or software provider will no longer offer updates, fixes, or technical support for a particular component`
  }
]

export const pkgData = [
  {
    title: `Deprecated`,
    desc: `If the entire package has been marked deprecated by the package manager`
  },
  {
    title: `Last Checked`,
    desc: `The date and time when data was last checked against for this package`
  }
]

export const pkgVersionData = [
  {
    title: `License`,
    desc: `License declaration associated with the package version`
  },
  {
    title: `Deprecated`,
    desc: `If this version of the package has been marked deprecated by the package owner`
  },
  {
    title: `Archived`,
    desc: `If this version of the package has been marked archived by the package owner`
  },
  {
    title: `Pre-release`,
    desc: `If this version of the package has been marked pre-released by the package owner`
  },
  {
    title: `Outdated`,
    desc: `If a newer version of the package exists`
  },
  {
    title: `Published`,
    desc: `The date and time when the current version was published`
  },
  {
    title: `Most Recent Version`,
    desc: `The most recent version of this package is available at the package manager`
  },
  {
    title: `Last Checked`,
    desc: `The date and time when data was last checked against for this package`
  }
]

export const repositoryData = [
  {
    title: `Name`,
    desc: `The name specified at the code repository`
  },
  {
    title: `Owner`,
    desc: `The owner associated with the code repository`
  },
  {
    title: `Description`,
    desc: `The description text associated with the code repository`
  },
  {
    title: `Source Archived`,
    desc: `If the source code repository is archived`
  },
  {
    title: `Stars`,
    desc: `Count of stars on the code repository`
  },
  {
    title: `Forks`,
    desc: `Count of forks on the code repository`
  },
  {
    title: `Watchers`,
    desc: `Count of watchers on the code repository`
  },
  {
    title: `Contibutors`,
    desc: `Count of contributors to the code repository`
  },
  {
    title: `Relases`,
    desc: `Number of releases associated with the code repository`
  },
  {
    title: `Issues`,
    desc: `Number of issues associated with the code repository`
  },
  {
    title: `OpenSSF Scorecard`,
    desc: `OpenSSF Scorecard is an automated tool that assesses a number of important heuristics associated with software security`
  },
  {
    title: `License`,
    desc: `License declaration associated with the code repository`
  },
  {
    title: `Last Checked`,
    desc: `The date and time when data was last checked against for this code repository`
  }
]

export const complianceData = [
  {
    title: `Timestamp`,
    desc: (
      <Stack>
        <Text>
          The Timestamp is the date and time that the SBOM was produced.
        </Text>
        <Text>Interlynk automatically resolves missing Timestamp.</Text>
      </Stack>
    )
  },
  {
    title: `Supplier Name`,
    desc: (
      <Stack>
        <Text>
          Supplier identifies the name and email of the organization that built,
          distributed or packaged the application. For open-source components,
          Supplier can refer to the name of the project or entity distributing
          the project.
        </Text>
        <Text>To resolve this, add Supplier details under General Tab.</Text>
      </Stack>
    )
  },
  {
    title: `Unique ID`,
    desc: (
      <Stack>
        <Text>
          Unique identifiers provide additional information to help uniquely
          define a component. A unique identifier can be generated relative to
          some globally unique hierarchy or namespace or reference an existing
          global coordinate system.
        </Text>
        <Text>
          Interlynk automatically resolves missing unique identifiers.
        </Text>
      </Stack>
    )
  },
  {
    title: `Author`,
    desc: (
      <Stack>
        <Text>
          The Author Name is intended to be the name of the entity that created
          the SBOM data. As a minimum expectation, the Author Name attribute
          should name as many participants as are involved in authoring the SBOM
          data as possible.
        </Text>
        <Text>To resolve this, add Author details under General Tab.</Text>
      </Stack>
    )
  },
  {
    title: `Component Name`,
    desc: (
      <Stack>
        <Text>
          Component Name is defined as the public name for a component defined
          by the original supplier.
        </Text>
        <Text>
          Interlynk ignores any component that is missing a name in imported
          SBOM.
        </Text>
      </Stack>
    )
  },
  {
    title: `Component Version`,
    desc: (
      <Stack>
        <Text>
          Component Version is a supplier-defined identifier that specifies an
          update change in software from a previously identified version.
        </Text>
        <Text>{`To find all components that are missing versions, go to Checks Tab and
          filter for "SB-HC-12: Component has a version".`}</Text>
        <Text>{`To resolve this, add version for each component using Component Tab > Edit Component > Details.`}</Text>
      </Stack>
    )
  },
  {
    title: `Component Supplier Name`,
    desc: (
      <Stack>
        <Text>
          Component Supplier Name is the entity that creates, defines, and
          identifies a component. It should be identified carefully as it is a
          significant contributor to achieving component identification at
          scale.
        </Text>
        <Text>{`To find all components that are missing suppliers, go to Checks
          Tab and filter for "SB-HC-15: Component has a supplier".`}</Text>
        <Text>{`To resolve this, add supplier for each component using Component Tab > Edit Component > Supplier.`}</Text>
      </Stack>
    )
  },
  {
    title: `Component Other unique identifiers`,
    desc: (
      <Stack>
        <Text>
          Component Unique identifiers provide additional information to help
          uniquely define a component. A unique identifier can be generated
          relative to some globally unique hierarchy or namespace or reference
          an existing global coordinate system.
        </Text>
        <Text>{`To find all components that are
          missing versions, go to Checks Tab and filter for "SB-HC-17: Component
          has a purl" and "SB-HC-19: Component has a CPE".`}</Text>
        <Text>{`To resolve this, add either CPE or PURL for each component using Component Tab > Edit Component > Identifiers.`}</Text>
      </Stack>
    )
  },
  {
    title: `Component Relationships`,
    desc: (
      <Stack>
        <Text>
          Component Relationship attribute describes the association of a
          component listed within the SBOM to other components.
        </Text>
        <Text>{`To find all
          components that are missing versions, go to Checks Tab and filter for
          "SB-HC-24: Component has relationship's".`}</Text>
        <Text>{`To resolve this, add a relationship for each component using Component Tab > Edit Components > Relationships.`}</Text>
      </Stack>
    )
  },
  {
    title: `Component support level`,
    desc: (
      <Stack>
        <Text>
          {`Component Support attribute describes the level of support provided
          through monitoring and maintenance.`}
        </Text>
        <Text>
          {`To find all components that are missing support details, go to Checks
          Tab and filter for "SB-HC-25: Component has support level".`}
        </Text>
        <Text>{`To resolve this, select support level for each component using Component
        Tab > Edit Components > Details > Support Level`}</Text>
      </Stack>
    )
  }
]

export const exportCsvTableConfig = {
  'Vulnerability Detail View': {
    defaultSelectedColumns: [
      'Product',
      'Version',
      'Component Name',
      'Component Version',
      'Environment',
      'Status'
    ],
    additionalColumns: [],
    mapDataForExport: (data) =>
      data.map((row) => ({
        Product: row?.component?.sbom?.project?.projectGroup?.name || '',
        Version: row?.component?.sbom?.projectVersion || '',
        'Component Name': row?.component?.name || '',
        'Component Version': row?.component?.version || '',
        Environment: row?.component?.sbom?.project?.name || '',
        Status: row?.vexStatus?.name || 'Unspecified'
      }))
  },
  'SBOM Components View': {
    defaultSelectedColumns: [
      'Ecosystem',
      'Component Name',
      'Component Version',
      'PURL',
      'Licenses',
      'Updated'
    ],
    additionalColumns: [
      'Description',
      'Group',
      'Type',
      'Internal',
      'Supplier Organization Name',
      'Supplier URL',
      'Supplier Contact Name',
      'Supplier Contact Email',
      'CPES',
      'Scope',
      'Support Level',
      'End-Of-Support Date',
      'Primary',
      'Links'
    ],
    mapDataForExport: (data) =>
      data.map((row) => ({
        Ecosystem: row?.purl?.split('/')[0] || '',
        'Component Name': row?.name || 'N/A',
        'Component Version': row?.version || '',
        PURL: row?.purl || '',
        Licenses: row?.licensesExp || '',
        Updated: row?.updatedAt || '',
        Description: `"${row?.description || 'N/A'}"`,
        Group: row?.group || '',
        Type: row?.kind || 'N/A',
        Internal: row?.internal ? 'True' : 'False',
        'Supplier Organization Name': row?.suppliers[0]?.name || 'N/A',
        'Supplier URL': row?.suppliers[0]?.url || 'N/A',
        'Supplier Contact Name': row?.suppliers[0]?.contactName || 'N/A',
        'Supplier Contact Email': row?.suppliers[0]?.contactEmail || 'N/A',
        CPES: row?.cpes?.map((item) => item) || '',
        Scope: row?.scope || 'N/A',
        'Support Level': row?.supportLevel || 'N/A',
        'End-Of-Support Date': row?.endOfSupport || 'N/A',
        Primary: row?.primary ? 'True' : 'False',
        Links:
          row?.externalUrls
            ?.map((link) => `${link.name}: ${link.url}`)
            .join('; ') || ''
      }))
  },
  'SBOM Vulnerability View': {
    defaultSelectedColumns: [
      'ID',
      'Component Name',
      'Component Version',
      'Severity',
      'Source',
      'CVSS',
      'EPSS',
      'Status',
      'Updated'
    ],
    additionalColumns: [
      'Description',
      'Published',
      'Last Modified',
      'Fixed Versions',
      'Last Affected Version',
      'CVSS Vector',
      'NVD Alias ID',
      'EPSS Percentile',
      'Links'
    ],
    mapDataForExport: (data) =>
      data.map((row) => ({
        ID: row?.vuln?.vulnId || '',
        'Component Name': row?.component?.name || '',
        'Component Version': row?.component?.version || '',
        Severity: row?.vuln?.sev || '',
        Source: row?.vuln?.source || '',
        CVSS: row?.vuln?.cvssScore || '',
        EPSS:
          row?.vuln?.vulnInfo?.epssScores?.length > 0
            ? `${(row?.vuln?.vulnInfo?.epssScores[0] * 100).toFixed(3)} %`
            : '-',
        Status: row?.vexStatus?.name || 'Unspecified',
        Updated: row?.vuln?.updatedAt || '',
        Description: row?.vuln?.desc || '',
        Published: `"${getFullDate(row?.vuln?.publishedAt)}"` || '',
        'Last Modified': `"${getFullDate(row?.vuln?.lastModifiedAt)}"` || '',
        'Fixed Versions': `"${row?.fixedVersions}"` || '',
        'Last Affected Version': `"${row?.lastAffectedVersions}"` || 'N/A',
        'CVSS Vector': row?.vuln?.cvssVector || '',
        'NVD Alias ID': row?.vuln?.nvdAliasId || '',
        'EPSS Percentile': row?.vuln?.vulnInfo?.epssPercentile
          ? `${(row?.vuln?.vulnInfo?.epssPercentile * 100).toFixed()} %`
          : '0 %',
        Links: (() => {
          const advisories = row?.isPart
            ? row?.currentExternalUrls?.find(
                (item) => item.name === 'advisories'
              )
            : row?.externalUrls?.find((item) => item.name === 'advisories')
          const documentation = row?.isPart
            ? row?.currentExternalUrls?.find(
                (item) => item.name === 'documentation'
              )
            : row?.externalUrls?.find((item) => item.name === 'documentation')
          const other = row?.isPart
            ? row?.currentExternalUrls?.find((item) => item.name === 'other')
            : row?.externalUrls?.find((item) => item.name === 'other')
          const issueTracker = row?.isPart
            ? row?.currentExternalUrls?.find(
                (item) => item.name === 'issue-tracker'
              )
            : row?.externalUrls?.find((item) => item.name === 'issue-tracker')

          const linksArray = [
            advisories?.url,
            documentation?.url,
            other?.url,
            issueTracker?.url
          ].filter(Boolean)

          return linksArray.length > 0 ? linksArray.join('; ') : ''
        })(),
        [row?.componentVulnCustomFields[0]?.componentVulnCustomFieldDefinition
          .displayName || '']: row?.componentVulnCustomFields[0]?.value || 'NA',
        [row?.componentVulnCustomFields[1]?.componentVulnCustomFieldDefinition
          .displayName || '']: row?.componentVulnCustomFields[1]?.value || 'NA'
      }))
  },
  'SBOM License View': {
    defaultSelectedColumns: ['License Expression', 'Components', 'Status'],
    additionalColumns: [],
    mapDataForExport: (data) => {
      return data.map((row) => {
        const sortedComponents = row?.components
          ? [...row.components].sort((a, b) => a?.name?.localeCompare(b?.name))
          : []

        return {
          'License Expression': row?.licenseExpression || '',
          Components:
            sortedComponents.length > 0
              ? sortedComponents.map((item) => item?.name).join('; ')
              : 'No Components Available',
          Status: row?.derivedState || 'Not Available'
        }
      })
    }
  },
  'Vulnerability View': {
    defaultSelectedColumns: [
      'ID',
      'Severity',
      'Source',
      'CVSS',
      'EPSS',
      'Statuses',
      'Published',
      'Modified'
    ],
    additionalColumns: [],
    mapDataForExport: (data) => {
      return data.map((row) => {
        const formattedStatuses = row?.metrics
          ? `Affected: ${row.metrics.affectedCount}; Fixed: ${row.metrics.fixedCount}; In Triage: ${row.metrics.inTriageCount}; Not Affected: ${row.metrics.notAffectedCount}; Unspecified: ${row.metrics.unspecifiedCount}`
          : 'No Statuses Available'
        return {
          ID: row?.vulnId,
          Severity: row?.sev,
          Source: row?.source,
          CVSS: row?.cvssScore,
          EPSS:
            row?.vulnInfo?.epssScores?.length > 0
              ? `${(row?.vulnInfo?.epssScores[0] * 100).toFixed(3)} %`
              : '-',
          Statuses: formattedStatuses,
          Published: `"${getFullDate(row?.publishedAt)}"`,
          Modified: `"${getFullDate(row?.lastModifiedAt)}"`
        }
      })
    }
  },
  'Support Status View': {
    defaultSelectedColumns: [
      'Name',
      'Version',
      'Assessment',
      'Support Level',
      'End Of Support'
    ],
    additionalColumns: ['Assessed Date', 'Last Assessed By', 'Explanation'],
    mapDataForExport: (data) => {
      return data.map((row) => {
        const { name, version, componentSupportLevel } = row || {}
        const { level, endDate, user, notes, updatedAt } =
          componentSupportLevel || {}
        return {
          Name: name,
          Version: version,
          Assessment: user?.id ? 'Manual' : 'Automatic',
          'Support Level': level ? level?.replaceAll('_', ' ') : 'N/A',
          'End Of Support': endDate
            ? new Date(endDate).toLocaleDateString()
            : 'N/A',
          'Assessed Date': updatedAt
            ? new Date(updatedAt).toLocaleDateString()
            : 'N/A',
          'Last Assessed By': user?.name || 'N/A',
          Explanation: notes || 'N/A'
        }
      })
    }
  },
  Users: {
    defaultSelectedColumns: ['Name', 'Email', 'Role', 'Joined', 'Status'],
    additionalColumns: [],
    mapDataForExport: (data) => {
      return data?.map((row) => {
        const { user } = row || {}
        const { email, name, role, invitationAcceptedAt, invitationStatus } =
          user || {}
        return {
          Name: name || 'N/A',
          Email: email || 'N/A',
          Role: role?.name || 'N/A',
          Joined: invitationAcceptedAt
            ? new Date(invitationAcceptedAt).toLocaleDateString()
            : 'N/A',
          Status: invitationStatus?.replace(/_/g, ' ') || 'N/A'
        }
      })
    }
  }
}

export const CVSS4_SCORES = {
  // --------- BASE METRICS --------

  // Exploitability Metrics
  AV: 'Attack Vector',
  AC: 'Attack Complexity',
  AT: 'Attack Requirements',
  PR: 'Privileges Required',
  UI: 'User Interaction',

  // Vulnerable System Impact Metrics
  VC: 'Confidentiality',
  VI: 'Integrity',
  VA: 'Availability',

  // Subsequent System Impact Metrics
  SC: 'Confidentiality',
  SI: 'Integrity',
  SA: 'Availability',

  // ------- SUPPLEMENTAL METRICS  -------

  S: 'Safety',
  AU: 'Automatable',
  R: 'Recovery',
  V: 'Value Density',
  RE: 'Vulnerability Response Effort',
  U: 'Provider Urgency',

  // ------- ENVIRONMENTAL (MODIFIED BASE METRICS)  ------

  // Exploitability Metrics
  MAV: 'Attack Vector',
  MAC: 'Attack Complexity',
  MAT: 'Attack Requirements',
  MPR: 'Privileges Required',
  MUI: 'User Interaction',

  // Vulnerable System Impact Metrics
  MVC: 'Confidentiality',
  MVI: 'Integrity',
  MVA: 'Availability',

  // Subsequent System Impact Metrics
  MSC: 'Confidentiality',
  MSI: 'Integrity',
  MSA: 'Availability',

  // --------- ENVIRONMENTAL (SECURITY REQUIREMENTS) ---------
  CR: 'Confidentiality Requirements',
  IR: 'Integrity Requirements',
  AR: 'Availability Requirements',

  // -------- Threat Metrics --------

  E: 'Exploit Maturity'
}

export const CVSS3_SCORES = {
  // ----- BASE SCORE METRICS -----

  // Exploitability Metrics
  AV: 'Attack Vector',
  AC: 'Attack Complexity',
  PR: 'Privileges Required',
  UI: 'User Interaction',
  S: 'Scope',

  // Impact Metrics
  C: 'Confidentiality Impact',
  I: 'Integrity Impact',
  A: 'Availability Impact',

  // ---- TEMPORAL SCORE METRICS -----

  E: 'Exploit Code Maturity',
  RL: 'Remediation Level',
  RC: 'Report Confidence',

  //  ------- ENVIRONMENTAL SCORE METRICS ------

  // Exploitability Metrics
  MAV: 'Modified Attack Vector',
  MAC: 'Modified Attack Complexity',
  MPR: 'Modified Privileges Required',
  MUI: 'Modified User Interaction',
  MS: 'Modified Scope',

  // Impact Metrics
  MC: 'Modified Confidentiality Impact',
  MI: 'Modified Integrity Impact',
  MA: 'Modified Availability Impact',

  // Impact Subscore Modifiers
  CR: 'Confidentiality Requirement',
  IR: 'Integrity Requirement',
  AR: 'Availability Requirement'
}

export const CVSS4_METRICS = {
  AV: {
    N: 'Network',
    A: 'Adjacent Network',
    L: 'Local',
    P: 'Physical'
  },
  AC: {
    L: 'Low',
    H: 'High'
  },
  AT: {
    N: 'None',
    P: 'Present'
  },
  PR: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  UI: {
    N: 'None',
    P: 'Passive',
    A: 'Active'
  },
  VC: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  VI: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  VA: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  SC: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  SI: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  SA: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  S: {
    X: 'Not Defined',
    N: 'Negligible',
    P: 'Present'
  },
  AU: {
    X: 'Not Defined',
    N: 'No',
    Y: 'Yes'
  },
  R: {
    X: 'Not Defined',
    A: 'Automatic',
    U: 'User',
    I: 'Irrecoverable'
  },
  V: {
    X: 'Not Defined',
    D: 'Diffuse',
    C: 'Concentrated'
  },
  RE: {
    X: 'Not Defined',
    L: 'Low',
    M: 'Moderate',
    H: 'High'
  },
  U: {
    X: 'Not Defined',
    Clear: 'Clear',
    Green: 'Green',
    Amber: 'Amber',
    Red: 'Red'
  },
  MAV: {
    X: 'Not Defined',
    N: 'Network',
    A: 'Adjacent',
    L: 'Local',
    P: 'Physical'
  },
  MAC: {
    X: 'Not Defined',
    L: 'Low',
    H: 'High'
  },
  MAT: {
    X: 'Not Defined',
    N: 'None',
    P: 'Present'
  },
  MPR: {
    X: 'Not Defined',
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  MUI: {
    X: 'Not Defined',
    N: 'None',
    P: 'Passive',
    A: 'Active'
  },
  MVC: {
    X: 'Not Defined',
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  MVI: {
    X: 'Not Defined',
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  MVA: {
    X: 'Not Defined',
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  MSC: {
    X: 'Not Defined',
    L: 'Low',
    H: 'High',
    N: 'Negligible'
  },
  MSI: {
    X: 'Not Defined',
    S: 'Safety',
    L: 'Low',
    H: 'High',
    N: 'Negligible'
  },
  MSA: {
    X: 'Not Defined',
    S: 'Safety',
    L: 'Low',
    H: 'High',
    N: 'Negligible'
  },
  CR: {
    X: 'Not Defined',
    M: 'Medium',
    L: 'Low',
    H: 'High'
  },
  IR: {
    X: 'Not Defined',
    M: 'Medium',
    L: 'Low',
    H: 'High'
  },
  AR: {
    X: 'Not Defined',
    M: 'Medium',
    L: 'Low',
    H: 'High'
  },
  E: {
    X: 'Not Defined',
    A: 'Attacted',
    P: 'POC',
    U: 'Unreported'
  }
}

export const CVSS3_METRICS = {
  AV: {
    N: 'Network',
    A: 'Adjacent Network',
    L: 'Local',
    P: 'Physical'
  },
  AC: {
    L: 'Low',
    H: 'High'
  },
  PR: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  UI: {
    N: 'None',
    R: 'Required'
  },
  S: {
    C: 'Changed',
    U: 'Unchanged'
  },
  C: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  I: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  A: {
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  E: {
    X: 'Not Defined',
    H: 'High',
    P: 'Proof of concept code',
    U: 'Unproven that exploit exists'
  },
  RL: {
    X: 'Not Defined',
    O: 'Official fix',
    T: 'Temporary Fix',
    W: 'Workaround',
    U: 'Unavailabel'
  },
  RC: {
    U: 'Unknown',
    R: 'Reasonable',
    C: 'Confirmed'
  },
  MAV: {
    X: 'Not Defined',
    N: 'Network',
    A: 'Adjacent Network',
    L: 'Local',
    P: 'Physical'
  },
  MAC: {
    X: 'Not Defined',
    L: 'Low',
    H: 'High'
  },
  MPR: {
    X: 'Not Defined',
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  MUI: {
    X: 'Not Defined',
    N: 'None',
    R: 'Required'
  },
  MS: {
    X: 'Not Defined',
    U: 'Unchanged',
    C: 'Changed'
  },
  MC: {
    X: 'Not Defined',
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  MI: {
    X: 'Not Defined',
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  MA: {
    X: 'Not Defined',
    N: 'None',
    L: 'Low',
    H: 'High'
  },
  CR: {
    X: 'Not Defined',
    M: 'Medium',
    L: 'Low',
    H: 'High'
  },
  IR: {
    X: 'Not Defined',
    M: 'Medium',
    L: 'Low',
    H: 'High'
  },
  AR: {
    X: 'Not Defined',
    M: 'Medium',
    L: 'Low',
    H: 'High'
  }
}

export const packageTypes = [
  { value: '', label: '-- Select --' },
  { value: 'alpm', label: 'alpm' },
  { value: 'apk', label: 'apk' },
  { value: 'bitbucket', label: 'bitbucket' },
  { value: 'bitnami', label: 'bitnami' },
  { value: 'cocoapods', label: 'cocoapods' },
  { value: 'cargo', label: 'cargo' },
  { value: 'composer', label: 'composer' },
  { value: 'conan', label: 'conan' },
  { value: 'conda', label: 'conda' },
  { value: 'cran', label: 'cran' },
  { value: 'deb', label: 'deb' },
  { value: 'docker', label: 'docker' },
  { value: 'gem', label: 'gem' },
  { value: 'generic', label: 'generic' },
  { value: 'github', label: 'github' },
  { value: 'golang', label: 'golang' },
  { value: 'hex', label: 'hex' },
  { value: 'hackage', label: 'hackage' },
  { value: 'huggingface', label: 'huggingface' },
  { value: 'maven', label: 'maven' },
  { value: 'mlflow', label: 'mlflow' },
  { value: 'npm', label: 'npm' },
  { value: 'nuget', label: 'nuget' },
  { value: 'qpkg', label: 'qpkg' },
  { value: 'oci', label: 'oci' },
  { value: 'pub', label: 'pub' },
  { value: 'pypi', label: 'pypi' },
  { value: 'rpm', label: 'rpm' },
  { value: 'swid', label: 'swid' },
  { value: 'swift', label: 'swift' }
]

export const examplePURLs = {
  alpm: 'pkg:alpm/pacman@1.0.0',
  apk: 'pkg:apk/alpine@3.16.0',
  bitbucket: 'pkg:bitbucket/repo-name@latest',
  bitnami: 'pkg:bitnami/redis@6.2.5',
  cocoapods: 'pkg:cocoapods/Alamofire@5.4.4',
  cargo: 'pkg:cargo/crate-name@1.2.3',
  composer: 'pkg:composer/laravel/laravel@8.5.0',
  conan: 'pkg:conan/openssl@1.1.1k',
  conda: 'pkg:conda/numpy@1.21.0',
  cran: 'pkg:cran/ggplot2@3.3.5',
  deb: 'pkg:deb/debian/curl@7.74.0',
  docker: 'pkg:docker/library/nginx@1.21.0',
  gem: 'pkg:gem/rails@6.1.4',
  generic: 'pkg:generic/my-package@2.0.0',
  github: 'pkg:github/user/repo@v1.0.0',
  golang: 'pkg:golang/github.com/gin-gonic/gin@v1.7.3',
  hex: 'pkg:hex/phoenix@1.5.9',
  hackage: 'pkg:hackage/lens@4.19.2',
  huggingface: 'pkg:huggingface/transformers@4.9.1',
  maven: 'pkg:maven/org.apache.commons/commons-lang3@3.12.0',
  mlflow: 'pkg:mlflow/scikit-learn@0.24.2',
  npm: 'pkg:npm/react@17.0.2',
  nuget: 'pkg:nuget/Newtonsoft.Json@13.0.1',
  qpkg: 'pkg:qpkg/my-qnap-package@1.0.0',
  oci: 'pkg:oci/nginx@1.21.0',
  pub: 'pkg:pub/flutter@2.2.3',
  pypi: 'pkg:pypi/numpy@1.21.0',
  rpm: 'pkg:rpm/redhat/curl@7.74.0',
  swid: 'pkg:swid/example@1.0.0',
  swift: 'pkg:swift/alamofire@5.4.4'
}

export const complianceList = [
  {
    id: 1,
    img: FDA,
    slug: 'fda',
    title: 'FDA Cybersecurity Compliance',
    url: 'https://www.fda.gov/media/119933/download',
    desc: 'SBOM requirements from FDA issued the final guidance Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions.'
  },
  {
    id: 2,
    img: NTIA,
    slug: 'ntia',
    title: 'NTIA Minimum Elements',
    url: 'https://www.ntia.doc.gov/files/ntia/publications/sbom_minimum_elements_report.pdf',
    desc: 'The NTIA (National Telecommunications and Information Administration) Minimum Elements for a Software Bill of Materials (SBOM) are a set of guidelines and recommendations that define the essential information an SBOM should contain.'
  },
  {
    id: 3,
    img: BSI,
    slug: 'bsi',
    title: 'BSI TR-03183',
    url: 'https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/TechGuidelines/TR03183/BSI-TR-03183-2.pdf?__blob=publicationFile&v=5',
    desc: 'The Technical Guideline TR-03183: Cyber Resilience Requirements for Manufacturers and Products aims to provide manufacturers with advance access to the type of requirements that will be imposed on them by the future Cyber Resilience Act (CRA) of the EU.'
  }
]

export const FREE_TIER_PRODUCT_LIMIT = 10
export const FREE_TIER_USER_LIMIT = 5

const usageData = {
  title: 'Usage',
  features: [
    { feature: 'Users', val1: FREE_TIER_USER_LIMIT, val2: 'Custom' },
    { feature: 'Products', val1: FREE_TIER_PRODUCT_LIMIT, val2: 'Unlimited' }
  ]
}

const sbomFeatures = {
  title: 'SBOM Features',
  features: [
    { feature: 'SBOM Management', val1: true, val2: true },
    { feature: 'SBOM Manual Build', val1: true, val2: true },
    { feature: 'SBOM Editor', val1: true, val2: true },
    { feature: 'SBOM Quality Scoring', val1: true, val2: true },
    { feature: 'SBOM Compliance Assessment', val1: true, val2: true },
    { feature: 'SBOM ShareLynk', val1: true, val2: true },
    { feature: 'SBOM Automation Rules', val1: false, val2: true },
    { feature: 'SBOM Parts Composition', val1: false, val2: true },
    { feature: 'SBOM In-Place Signing', val1: false, val2: true },
    { feature: 'SBOM Component Privacy', val1: false, val2: true }
  ]
}

const riskManagementFeatures = {
  title: 'Risk Management Features',
  features: [
    { feature: 'Vulnerability Management', val1: true, val2: true },
    { feature: 'Exploitability Editor (VEX)', val1: true, val2: true },
    {
      feature: 'End-of-life / End-of-service Detection',
      val1: false,
      val2: true
    },
    { feature: 'Open Source Risk Scoring', val1: false, val2: true },
    { feature: 'OpenSSF Scorecard Risk Scoring', val1: false, val2: true }
  ]
}

const managementAndReportingFeatures = {
  title: 'Management & Reporting Features',
  features: [
    { feature: 'Policy Management', val1: true, val2: true },
    { feature: 'Role Based Access Control (RBAC)', val1: false, val2: true },
    { feature: 'Custom Roles', val1: false, val2: true },
    { feature: 'Integrated License Manager', val1: false, val2: true },
    { feature: 'Analytics', val1: false, val2: true }
  ]
}

const supportFeatures = {
  title: 'Support Features',
  features: [
    { feature: 'Product Support', val1: 'Email', val2: 'Chat, Slack, Email' }
  ]
}

const integrationsFeatures = {
  title: 'Integrations Features',
  features: [
    {
      feature: 'Workflow Integrations',
      val1: false,
      val2: 'JIRA, Teams, Slack, GitHub'
    }
  ]
}

// Combine all feature objects into one array
export const upgradePlanAllFeatures = [
  usageData,
  sbomFeatures,
  riskManagementFeatures,
  managementAndReportingFeatures,
  supportFeatures,
  integrationsFeatures
]

export const supportLevels = [
  { id: 1, label: 'All', value: 'all' },
  { id: 2, label: 'Unspecified', value: 'unspecified' },
  { id: 3, label: 'Actively Maintained', value: 'actively_maintained' },
  { id: 4, label: 'No Longer Maintained', value: 'no_longer_maintained' },
  { id: 5, label: 'Abandoned', value: 'abandoned' }
]

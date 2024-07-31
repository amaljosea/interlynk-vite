export const settingActions = [
  {
    id: 'general',
    name: 'General',
    section: 'Organization',
    path: '/vendor/settings?tab=general'
  },
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
    id: 'checks',
    name: 'Checks',
    section: 'Organization',
    path: '/vendor/settings?tab=checks'
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
    id: 'connections',
    name: 'Connections',
    section: 'Organization',
    path: '/vendor/settings?tab=connections'
  },
  {
    id: 'personal-details',
    name: 'Personal Details',
    section: 'Personal',
    path: '/vendor/settings?tab=personal-details'
  },
  {
    id: 'organizations',
    name: 'Organizations',
    section: 'Personal',
    path: '/vendor/settings?tab=organizations'
  },
  {
    id: 'security-tokens',
    name: 'Security Tokens',
    section: 'Personal',
    path: '/vendor/settings?tab=security-tokens'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    section: 'Personal',
    path: '/vendor/settings?tab=notifications'
  }
]

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

export const labels = [
  {
    id: 1,
    name: 'bug',
    description: 'Something is not working',
    color: '#E53E3E',
    issues: 15
  },
  { id: 2, name: 'demo', description: '', color: '#DD6B20', issues: 0 },
  {
    id: 3,
    name: 'dependencies',
    description: 'Pull requests that update a dependency file',
    color: '#D69E2E',
    issues: 2
  },
  {
    id: 43,
    name: 'documentation',
    description: 'Improvements or additions to documentation',
    color: '#38A169',
    issues: 2
  },
  {
    id: 5,
    name: 'enhancement',
    description: 'New feature or request',
    color: '#319795',
    issues: 30
  },
  {
    id: 6,
    name: 'FDA',
    description: '',
    color: '#3182CE',
    issues: 0
  }
]

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

// SBOM TOOLTIPS
export const infoData = [
  {
    title: `Vulnerability Scan`,
    desc: `This setting lets you turn on or off vulnerability scanning for your system. It's best to keep this turned on.`
  },
  {
    title: `Retain Vulnerability Status`,
    desc: `This settings lets you turn on or off copying of vulnerability status, when an sbom is imported, whose version matches an existing one.`
  },
  {
    title: `Checks`,
    desc: `This setting lets you decide whether to turn on or off SBOM checks when importing. These checks help you find any issues with the SBOMs you're bringing in.`
  },
  {
    title: `Automation`,
    desc: `This setting decides whether the automation rules set up for the environment should run when importing SBOMs.`
  },
  {
    title: `Internal Component Labeling`,
    desc: `This setting lets you choose whether components are marked as internal when you import an SBOM.`
  },
  {
    title: `Data Retaintion`,
    desc: `This setting lets you choose how long the SBOM data is kept before it's deleted. Once it's gone, you can't get it back.`
  },
  {
    title: `Manufacturer`,
    desc: `This setting allows you to select a manufacturer as the default for the environment. When sboms are exported, this is used to set the manufacturer.`
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
  }
]

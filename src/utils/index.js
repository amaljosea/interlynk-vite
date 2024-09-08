// USER IMAGES
import userOne from 'assets/img/abhi.png'
import custom from 'assets/img/custom.png'
import grype from 'assets/img/grype.png'
import userThree from 'assets/img/rcn.jpg'
import scout from 'assets/img/scout.png'
import snyk from 'assets/img/snyk.png'
import userTwo from 'assets/img/sp.png'
import trivy from 'assets/img/trivy.png'
import userNone from 'assets/img/user.png'
import AlpmIcon from 'assets/svg/alpm.png'
import CondaIcon from 'assets/svg/anaconda.png'
import ApkIcon from 'assets/svg/apk.png'
import AWSIcon from 'assets/svg/aws.svg'
import AzureIcon from 'assets/svg/azure.svg'
import BitbucketIcon from 'assets/svg/bitbucket.png'
import BitnamiIcon from 'assets/svg/bitnami.svg'
import CargoIcon from 'assets/svg/cargo.png'
import CocoapodsIcon from 'assets/svg/cocoapods.png'
import ComposerIcon from 'assets/svg/composer.png'
import ConanIcon from 'assets/svg/conan.png'
import CranIcon from 'assets/svg/cran.svg'
import DebIcon from 'assets/svg/debian.png'
import DocIcon from 'assets/svg/docker.png'
import DockerIcon from 'assets/svg/docker.svg'
import GemIcon from 'assets/svg/gem.png'
import GenericIcon from 'assets/svg/generic.png'
import GitHubIcon from 'assets/svg/github.svg'
import GolangIcon from 'assets/svg/go.svg'
import HackageIcon from 'assets/svg/haskell.png'
import HexIcon from 'assets/svg/hex.png'
import HuggingFaceIcon from 'assets/svg/huggingface.png'
import MavenIcon from 'assets/svg/maven.png'
import MlflowIcon from 'assets/svg/mflow.png'
import NpmIcon from 'assets/svg/npm.png'
import NugetIcon from 'assets/svg/nuget.png'
import OciIcon from 'assets/svg/oci.png'
import PubIcon from 'assets/svg/pub.png'
import PypiIcon from 'assets/svg/pypi.png'
import QpkgIcon from 'assets/svg/qpkg.png'
import RpmIcon from 'assets/svg/rpm.png'
import SwidIcon from 'assets/svg/swid.png'
import SwiftIcon from 'assets/svg/swift.png'
import { toLower } from 'lodash'
import { PackageURL } from 'packageurl-js'
import { sbomOrigin } from 'variables/general'

import { LetterCIcon } from 'components/Icons/Icons'
import { LetterHIcon } from 'components/Icons/Icons'
import { LetterMIcon } from 'components/Icons/Icons'
import { LetterLIcon } from 'components/Icons/Icons'

import { FaBalanceScale, FaBox, FaBug, FaCube, FaCubes } from 'react-icons/fa'
import {
  FaA,
  FaFileImport,
  FaGithub,
  FaScrewdriverWrench,
  FaUserAstronaut
} from 'react-icons/fa6'

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const getLink = (name) => {
  const result = sbomOrigin?.find((item) => item.value === name)
  const { link } = result || ''
  return link || ''
}

export const getType = (name) => {
  const result = sbomOrigin?.find((item) => item.value === name)
  const { origin } = result || ''
  if (origin === 'github') {
    return <FaGithub />
  } else if (origin === 'external') {
    return <FaFileImport />
  } else if (origin === 'actions') {
    return <FaA />
  } else if (origin === 'jenkins') {
    return <FaUserAstronaut />
  } else {
    return <FaScrewdriverWrench />
  }
}

export const getFormat = (name) => {
  const result = sbomOrigin?.find((item) => item.value === name)
  const { origin } = result || ''
  if (origin === 'github') {
    return 'Github'
  } else if (origin === 'external') {
    return 'External'
  } else if (origin === 'actions') {
    return 'Github Actions'
  } else if (origin === 'jenkins') {
    return 'Jenkins'
  } else {
    return 'Manual Build'
  }
}

export const getConImg = (name) => {
  switch (name) {
    case 'Docker Hub':
      return DockerIcon
    case 'Amazon ECR':
      return AWSIcon
    case 'Azure Container Registry':
      return AzureIcon
    case 'Github Container Registry':
      return GitHubIcon
  }
}

export const GetIcon = (name, colorMode) => {
  const light = { filter: 'none' }
  const dark = { filter: 'brightness(0) invert(1)' }
  const iconStyle = colorMode === 'light' ? light : dark
  switch (name) {
    case 'pkg:golang':
      return <img width={'36px'} src={GolangIcon} alt='golang' />
    case 'pkg:maven':
      return (
        <img width={'24px'} style={iconStyle} src={MavenIcon} alt='maven' />
      )
    case 'pkg:apache':
      return <img width={'24px'} src={MavenIcon} alt='apache' />
    case 'pkg:bitbucket':
      return <img width={'22px'} src={BitbucketIcon} alt='bitbucket' />
    case 'pkg:alpm':
      return <img width={'26px'} src={AlpmIcon} alt='alpm' />
    case 'pkg:apk':
      return <img width={'30px'} src={ApkIcon} alt='apk' />
    case 'pkg:cocoapods':
      return <img width={'26px'} src={CocoapodsIcon} alt='cocoapods' />
    case 'pkg:conda':
      return <img width={'30px'} src={CondaIcon} alt='anaconda' />
    case 'pkg:cargo':
      return <img width={'30px'} src={CargoIcon} alt='cargo' />
    case 'pkg:composer':
      return <img width={'26px'} src={ComposerIcon} alt='composer' />
    case 'pkg:conan':
      return <img width={'26px'} src={ConanIcon} alt='conan' />
    case 'pkg:deb':
      return <img width={'32px'} src={DebIcon} alt='deb' />
    case 'pkg:cran':
      return <img src={CranIcon} width={'28px'} alt='cran' />
    case 'pkg:bitnami':
      return <img src={BitnamiIcon} width={'28px'} alt='bitnami' />
    case 'pkg:docker':
      return <img src={DocIcon} width={'26px'} alt='docker' />
    case 'pkg:gem':
      return <img src={GemIcon} width={'26px'} alt='gem' />
    case 'pkg:generic':
      return <img src={GenericIcon} width={'26px'} alt='generic' />
    case 'pkg:github':
      return <img src={GitHubIcon} width={'26px'} alt='github' />
    case 'pkg:hackage':
      return <img src={HackageIcon} width={'26px'} alt='hackage' />
    case 'pkg:hex':
      return <img src={HexIcon} width={'26px'} alt='hex' />
    case 'pkg:huggingface':
      return <img src={HuggingFaceIcon} width={'26px'} alt='huggingface' />
    case 'pkg:mlflow':
      return <img src={MlflowIcon} width={'26px'} alt='mlflow' />
    case 'pkg:npm':
      return <img src={NpmIcon} width={'26px'} alt='npm' />
    case 'pkg:nuget':
      return (
        <img src={NugetIcon} style={iconStyle} width={'28px'} alt='nuget' />
      )
    case 'pkg:qpkg':
      return <img src={QpkgIcon} width={'28px'} alt='qpkg' />
    case 'pkg:oci':
      return <img src={OciIcon} width={'22px'} alt='oci' />
    case 'pkg:pypi':
      return <img src={PypiIcon} width={'26px'} alt='pypi' />
    case 'pkg:pub':
      return <img src={PubIcon} width={'26px'} alt='pub' />
    case 'pkg:rpm':
      return <img src={RpmIcon} width={'26px'} alt='rpm' />
    case 'pkg:swid':
      return <img src={SwidIcon} width={'20px'} alt='swid' />
    case 'pkg:swift':
      return <img src={SwiftIcon} width={'24px'} alt='swift' />
  }
}

export const scanImage = (name) => {
  switch (name) {
    case 'Grype':
      return grype
    case 'Trivy':
      return trivy
    case 'Scout':
      return scout
    case 'Snyk':
      return snyk
    case 'Custom':
      return custom
  }
}

export const sevIcon = (severity) => {
  switch (severity) {
    case 'critical':
      return LetterCIcon
    case 'super critical':
      return LetterCIcon
    case 'high':
      return LetterHIcon
    case 'super high':
      return LetterHIcon
    case 'medium':
      return LetterMIcon
    case 'low':
      return LetterLIcon
    case 'super low':
      return LetterLIcon
    case 'negligible':
      return LetterLIcon
    default:
      return LetterLIcon
  }
}

export const sevColor = (severity) => {
  switch (toLower(severity)) {
    case 'critical':
    case 'super critical':
      return { bg: '#FED7D7', text: '#822727' }
    case 'high':
    case 'super high':
      return { bg: '#FEEBC8', text: '#7B341E' }
    case 'medium':
      return { bg: '#FEFCBF', text: '#744210' }
    case 'low':
    case 'super low':
    case 'negligible':
      return { bg: '#C6F6D5', text: '#22543D' }
    default:
      return { bg: 'gray', text: 'black' }
  }
}

export const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
  }
}

export const displayPic = (email) => {
  switch (email) {
    case 'abhisek@interlynk.io':
      return userOne
    case 'sp@interlynk.io':
      return userTwo
    case 'rcn@interlynk.io':
      return userThree
    default:
      return userNone
  }
}

const calculateTimeDifference = (inputDate) => {
  const currentDate = new Date()
  const inputDateObj = new Date(inputDate)
  const timeDifference = currentDate - inputDateObj
  return timeDifference
}

const formatTime = (timeDifference) => {
  if (timeDifference < 0) {
    return '0 seconds ago'
  }

  const seconds = Math.floor(timeDifference / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  } else if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  } else if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  } else {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`
  }
}

export const timeSince = (inputDate) => {
  const timeDifference = calculateTimeDifference(inputDate)
  return formatTime(timeDifference)
}

export const regions = [
  {
    name: 'US East (Ohio) - us-east-2',
    id: 'us-east-2'
  },
  {
    name: 'US East (N. Virginia) - us-east-1',
    id: 'us-east-1'
  },
  {
    name: 'US West (N. California) - us-west-1',
    id: 'us-west-1'
  },
  {
    name: 'US West (Oregon) - us-west-2',
    id: 'us-west-2'
  },
  {
    name: 'Africa (Cape Town) - af-south-1',
    id: 'af-south-1'
  },
  {
    name: 'Asia Pacific (Hong Kong) - ap-east-1',
    id: 'ap-east-1'
  },
  {
    name: 'Asia Pacific (Hyderabad) - ap-south-2',
    id: 'ap-south-2'
  },
  {
    name: 'Asia Pacific (Jakarta) - ap-southeast-3',
    id: 'ap-southeast-3'
  },
  {
    name: 'Asia Pacific (Melbourne) - ap-southeast-4',
    id: 'ap-southeast-4'
  },
  {
    name: 'Asia Pacific (Mumbai) - ap-south-1',
    id: 'ap-south-1'
  },
  {
    name: 'Asia Pacific (Osaka) - ap-northeast-3',
    id: 'ap-northeast-3'
  },
  {
    name: 'Asia Pacific (Seoul) - ap-northeast-2',
    id: 'ap-northeast-2'
  },
  {
    name: 'Asia Pacific (Singapore) - ap-southeast-1',
    id: 'ap-southeast-1'
  },
  {
    name: 'Asia Pacific (Sydney) - ap-southeast-2',
    id: 'ap-southeast-2'
  },
  {
    name: 'Asia Pacific (Tokyo) - ap-northeast-1',
    id: 'ap-northeast-1'
  },
  {
    name: 'Canada (Central) - ca-central-1',
    id: 'ca-central-1'
  },
  {
    name: 'Europe (Frankfurt) - eu-central-1',
    id: 'eu-central-1'
  },
  {
    name: 'Europe (Ireland) - eu-west-1',
    id: 'eu-west-1'
  },
  {
    name: 'Europe (London) - eu-west-2',
    id: 'eu-west-2'
  },
  {
    name: 'Europe (Milan) - eu-south-1',
    id: 'eu-south-1'
  },
  {
    name: 'Europe (Paris) - eu-west-3',
    id: 'eu-west-3'
  },
  {
    name: 'Europe (Spain) - eu-south-2',
    id: 'eu-south-2'
  },
  {
    name: 'Europe (Stockholm) - eu-north-1',
    id: 'eu-north-1'
  },
  {
    name: 'Europe (Zurich) - eu-central-2',
    id: 'eu-central-2'
  },
  {
    name: 'Middle East (Bahrain) - me-south-1',
    id: 'me-south-1'
  },
  {
    name: 'Middle East (UAE) - me-central-1',
    id: 'me-central-1'
  },
  {
    name: 'South America (São Paulo) - sa-east-1',
    id: 'sa-east-1'
  },
  {
    name: 'AWS GovCloud (US-East) - us-gov-east-1',
    id: 'us-gov-east-1'
  },
  {
    name: 'AWS GovCloud (US-West) - us-gov-west-1',
    id: 'us-gov-west-1'
  }
]

export const formattedTime = (initiated, completed) => {
  const initiatedAt = new Date(initiated)
  const completedAt = new Date(completed)

  const timeTakenInMillis = completedAt.getTime() - initiatedAt.getTime()

  const seconds = Math.floor(timeTakenInMillis / 1000)
  const minutes = Math.floor(seconds / 60)
  // const hours = Math.floor(minutes / 60)

  const timeTaken = `${minutes % 60}m ${seconds % 60}s`

  return timeTaken
}

export const dateTime = (updatedAt) => {
  const date = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: userTimezone
  })
  const time = new Date(updatedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimezone
  })

  return `${date} ${time}`
}

export const getDateFormat = (date) => {
  const currentDate = new Date(date)
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  const formatted = `${year}-${month}-${day}`
  return formatted
}

export const link_captions = ['Active', 'Shared With', 'Created', 'Link', '']

export const vuln_captions = [
  '',
  'CVE ID',
  'Severity',
  'CVSS',
  'Component',
  'Version',
  'Fixed (Component)',
  'Fixed (Product)',
  'Scanner',
  'Status',
  ''
]

export const img_captions = [
  'Scan',
  'Image',
  'Connector',
  'Tags',
  'Last Pushed',
  'Scanners',
  'Actions'
]

export const getActiveRoute = (routes) => {
  let activeRoute = 'Default Brand Text'
  for (let i = 0; i < routes.length; i++) {
    if (routes[i].collapse) {
      let collapseActiveRoute = getActiveRoute(routes[i].views)
      if (collapseActiveRoute !== activeRoute) {
        return collapseActiveRoute
      }
    } else if (routes[i].category) {
      let categoryActiveRoute = getActiveRoute(routes[i].views)
      if (categoryActiveRoute !== activeRoute) {
        return categoryActiveRoute
      }
    } else {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name
      }
    }
  }
  return activeRoute
}

export const getActiveNavbar = (routes) => {
  let activeNavbar = false
  for (let i = 0; i < routes.length; i++) {
    if (routes[i].category) {
      let categoryActiveNavbar = getActiveNavbar(routes[i].views)
      if (categoryActiveNavbar !== activeNavbar) {
        return categoryActiveNavbar
      }
    } else {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        if (routes[i].secondaryNavbar) {
          return routes[i].secondaryNavbar
        }
      }
    }
  }
  return activeNavbar
}

export const convertDateFormat = (inputDate) => {
  const date = new Date(inputDate)
  const month = date.toLocaleString('default', { month: 'short' })
  const day = date.getDate()
  return `${month} ${day}`
}

export const getFullDateAndTime = (dateString, timeZone = userTimezone) => {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone
  }

  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', options)
}

export const getFullDate = (dateString) => {
  const date = new Date(dateString)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const findSimilarItems = (currentData, selectedData) => {
  const mergedData = currentData.map((currentItem) => {
    const matchingSelected = selectedData.find(
      (selectedItem) => selectedItem.vuln.vulnId === currentItem.vuln.vulnId
    )
    if (matchingSelected) {
      const hasLogs = matchingSelected.componentVulnLogs.length > 0
      const selectedVuln =
        hasLogs &&
        matchingSelected.componentVulnLogs[
          matchingSelected.componentVulnLogs.length > 1
            ? matchingSelected.componentVulnLogs.length - 1
            : 0
        ]
      return {
        ...currentItem,
        importStatus: matchingSelected.vexStatus,
        importJustification: matchingSelected.vexJustification,
        importNotes: selectedVuln.note || null,
        importDetail: selectedVuln.detail || null,
        importResponse: matchingSelected.cdxResponseId
          ? matchingSelected.cdxResponseId
          : null,
        importFixedIn: selectedVuln.fixedIn || null,
        importActionStmt: selectedVuln.actionStmt || null,
        importStatement: matchingSelected.impact
      }
    }
  })

  const data = [...mergedData]
  const filterList = data.filter((item) => item !== undefined)

  return filterList
}

export const findUniqueItems = (currentArray, importArray) => {
  const uniqueItems = []

  for (const currentItem of currentArray) {
    const matchingImportItem = importArray.find(
      (importItem) =>
        importItem.vuln.vulnId === currentItem.vuln.vulnId &&
        importItem.component.name === currentItem.component.name &&
        importItem.component.version === currentItem.component.version
    )

    if (!matchingImportItem) {
      uniqueItems.push(currentItem)
    }
  }

  return uniqueItems
}

export function generateRandomId(length = 12) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let randomId = ''
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return randomId
}

export const customStyles = (
  headColor,
  dividerColor,
  paddingCell,
  paddingHeadCell
) => {
  return {
    headCells: {
      style: {
        fontFamily: 'inherit',
        fontWeight: 700,
        backgroundColor: 'transparent', // change this to the desired color
        color: headColor, // change this to the desired text color
        padding: paddingHeadCell
      }
    },
    headRow: {
      style: {
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: dividerColor
      }
    },
    cells: {
      style: {
        backgroundColor: 'transparent', // cell background color
        padding: paddingCell
      }
    },
    rows: {
      style: {
        backgroundColor: 'transparent', // row background color
        '&:not(:last-of-type)': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: dividerColor
        }
      },
      stripedStyle: {
        backgroundColor: 'transparent' // striped row background color
      }
    },
    table: {
      style: {
        backgroundColor: 'transparent' // entire table background color
      }
    },
    progress: {
      style: {
        backgroundColor: 'transparent' // progress component background color
      }
    },
    subHeader: {
      style: {
        padding: 0,
        backgroundColor: 'transparent' // sub-header background color
      }
    },
    noData: {
      style: {
        backgroundColor: 'transparent',
        color: headColor
      }
    },
    expanderRow: {
      style: {
        backgroundColor: 'transparent' // expandable row background color
      }
    },
    expanderCell: {
      style: {
        '& svg': {
          color: 'darkgray'
        }
      }
    }
  }
}

export const normalizeSBOMVersion = (sbom) => {
  if (sbom?.primaryComponent?.version) {
    return sbom?.primaryComponent?.version
  } else if (sbom?.primaryComponent?.name) {
    return sbom?.primaryComponent?.name
  } else {
    return `Uploaded at ${getFullDateAndTime(sbom?.createdAt)}`
  }
}

// REMOVE DUPLICATE PRODUCTS VERSIONS
export const removeDuplicates = (arr) => {
  if (arr === null || arr === undefined) {
    return []
  }
  const uniqueVersions = {}

  for (const item of arr) {
    const normalizedVersion = normalizeSBOMVersion(item)
    if (
      !uniqueVersions[normalizedVersion] ||
      item.updatedAt > uniqueVersions[normalizedVersion].creationAt
    ) {
      uniqueVersions[normalizedVersion] = item
    }
  }

  const versions = Object.values(uniqueVersions).sort((a, b) => {
    const dateA = new Date(a.creationAt)
    const dateB = new Date(b.creationAt)
    return dateB - dateA
  })
  return versions
}

export const validateCpe = (value) => {
  const cpeRegex =
    // eslint-disable-next-line no-useless-escape
    /^cpe:2\.3:[aho\*\-]?(:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])?){5}(:(([a-zA-Z]{2,3}(-([a-zA-Z]{2}|[0-9]{3}))?)|[\*\-])?)(:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])?){4}$/
  return cpeRegex.test(value)
}

export const validateUrl = (url) => {
  const urlRegex =
    // eslint-disable-next-line no-useless-escape
    /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?::\d{2,5})?(?:\/[\w\-._~:\/?#\[\]@!\$&'()*+,;=%]*)?$/
  return urlRegex.test(url)
}

export const validPassword = (value) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[<>^~!@#$%^&*()-_=+{}|\\;:'",.?/`])(.{8,16})$/
  return passwordRegex.test(value)
}

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  // Ensure the email doesn't have consecutive dots in the domain part
  const hasConsecutiveDots = /\.\./.test(email)
  return emailRegex.test(email) && !hasConsecutiveDots
}

export const toast_error_message_duration = 300

export const displayErrorMessage = (status_code, message) => {
  if (status_code === 200 || status_code === 400) {
    return message
  } else if (status_code === 401) {
    return 'You are not authorized to view this page.'
  } else if (status_code === 403) {
    return 'You are forbidden to view this page.'
  } else if (status_code === 404) {
    return 'The request page was not found.'
  } else if (status_code === 405) {
    return 'The requested method is not allowed.'
  } else {
    return 'An internal error occured. Please retry later.'
  }
}

export const permissionList = (data) => {
  if (data && data.length > 0) {
    const keyMap = new Map(data.map((obj) => [obj.key, { ...obj }]))
    const supersededKeys = new Set()
    const newData = data.map((obj) => {
      const newObj = { ...obj }
      if (newObj.supersededBy && newObj.supersededBy.length > 0) {
        newObj.supersededBy = newObj.supersededBy.map((key) => {
          supersededKeys.add(key)
          return keyMap.get(key)
        })
      }
      return newObj
    })
    return newData.filter((obj) => !supersededKeys.has(obj.key))
  }
}

export const isDefaultEnv = (name) => {
  switch (name) {
    case 'default':
      return true
    case 'development':
      return true
    case 'production':
      return true
    default:
      return false
  }
}

export const filterEnvList = (projects) => {
  const defaultEnvs = [...projects]
    .filter(
      (item) =>
        item.name === 'default' ||
        item.name === 'development' ||
        item.name === 'production'
    )
    .sort((a, b) => a?.name?.localeCompare(b?.name))
  const newEnvs = [...projects]
    .filter(
      (item) =>
        item.name !== 'default' &&
        item.name !== 'development' &&
        item.name !== 'production'
    )
    .sort((a, b) => a?.name?.localeCompare(b?.name))
  return defaultEnvs && newEnvs ? [...defaultEnvs, ...newEnvs] : []
}

export const envOrderList = (projects) => {
  const defaultEnvs = [...projects]
    .filter(
      (item) =>
        item.label === 'default' ||
        item.label === 'development' ||
        item.label === 'production'
    )
    .sort((a, b) => a?.label?.localeCompare(b?.label))
  const newEnvs = [...projects]
    .filter(
      (item) =>
        item.label !== 'default' &&
        item.label !== 'development' &&
        item.label !== 'production'
    )
    .sort((a, b) => a?.label?.localeCompare(b?.label))
  return defaultEnvs && newEnvs ? [...defaultEnvs, ...newEnvs] : []
}

export const purlString = (value) => PackageURL.fromString(value)

export const linkURl = (type, id) => {
  if (type === 'osv') {
    return `https://osv.dev/vulnerability/${id}`
  } else {
    return `https://nvd.nist.gov/vuln/detail/${id}`
  }
}

export const capitalizeFirstLetter = (str) => {
  return str?.charAt(0)?.toUpperCase() + str?.slice(1)
}

export const areArraysEqual = (arr1, arr2) => {
  // Check if the arrays have the same length
  if (arr1.length !== arr2.length) {
    return false
  }

  // Check if all elements in both arrays are equal
  return arr1.every((element, index) => element === arr2[index])
}

export const sortByUpdatedAt = (data) => {
  const sortedData = [...data]?.sort((a, b) => {
    const dateA = new Date(a.updatedAt)
    const dateB = new Date(b.updatedAt)
    return dateB - dateA
  })
  return sortedData
}

export const truncatedValue = (name, length) => {
  if (name !== '') {
    return name?.length > length ? `${name?.substring(0, length)}...` : name
  } else {
    return name
  }
}

export const parseJSONSafely = (str) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    console.err(e)
    // Return a default object, or null based on use case.
    return {}
  }
}

export const updatedValue = (operator) => {
  // Capitalize the operator and replace underscores with spaces
  return operator?.replace(/_/g, ' ')?.replace(/\b\w/g, (c) => c)
}

export const getIcon = (subject) => {
  const sub = String(subject).toUpperCase()
  if (sub.startsWith('VULNERABILITY')) return FaBug
  if (sub.startsWith('LICENSE')) return FaBalanceScale
  if (sub.startsWith('COMPONENT')) return FaCube
  if (sub.startsWith('SBOM') || sub.startsWith('VERSION')) return FaCubes
  return FaBox
}

export const getLabel = (subject) => {
  const sub = String(subject).toUpperCase()
  if (sub.startsWith('VULNERABILITY')) return 'Vulnerability'
  if (sub.startsWith('LICENSE')) return 'License'
  if (sub.startsWith('COMPONENT')) return 'Component'
  if (sub.startsWith('SBOM') || sub.startsWith('VERSION')) return 'SBOM'
  return 'S'
}

export const typeOptions = [
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

export const isUnknown = (cpes, purl) => {
  let isValid
  if (purl !== '' || purl !== null) {
    try {
      PackageURL.fromString(purl)
      isValid = true
    } catch (ex) {
      isValid = false
    }
  } else {
    isValid = false
  }
  if (cpes?.length === 0 && isValid === false) {
    return true
  } else {
    return false
  }
}

export const getRandomColor = () => {
  const getLightValue = () => Math.floor(Math.random() * 128) + 128
  const r = getLightValue().toString(16).padStart(2, '0')
  const g = getLightValue().toString(16).padStart(2, '0')
  const b = getLightValue().toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

export const hexToRGBA = (hex, opacity) => {
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16)
    g = parseInt(hex[3] + hex[4], 16)
    b = parseInt(hex[5] + hex[6], 16)
  }
  return `rgba(${r},${g},${b},${opacity})`
}

export const tourStyles = {
  popover: (base) => ({
    ...base,
    width: '480px',
    maxWidth: '100%',
    background: '#2B6CB0',
    fontSize: '14px',
    color: 'white',
    paddingTop: '56px'
  }),
  close: (base) => ({
    ...base,
    top: '26px',
    right: '25px',
    color: 'white'
  }),
  badge: (base) => ({
    ...base,
    fontWeight: 'bold',
    width: 'fit-content',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: 'white',
    top: '16px',
    left: '20px'
  }),
  dot: (base, state) => ({
    ...base,
    backgroundColor: state.current ? '#EBF8FF' : 'none'
  }),
  controls: (base) => ({
    ...base,
    button: {
      ...base.button,
      color: 'white'
    }
  })
}

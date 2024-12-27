/* eslint-disable */
import AlpmIcon from 'assets/svg/alpm.png'
import CondaIcon from 'assets/svg/anaconda.png'
import ApkIcon from 'assets/svg/apk.png'
import BitbucketIcon from 'assets/svg/bitbucket.png'
import BitnamiIcon from 'assets/svg/bitnami.svg'
import CargoIcon from 'assets/svg/cargo.png'
import CocoapodsIcon from 'assets/svg/cocoapods.png'
import ComposerIcon from 'assets/svg/composer.png'
import ConanIcon from 'assets/svg/conan.png'
import CranIcon from 'assets/svg/cran.svg'
import DebIcon from 'assets/svg/debian.png'
import DocIcon from 'assets/svg/docker.png'
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
import { parseISO } from 'date-fns'
import { format as formatWithTZ, toZonedTime } from 'date-fns-tz'
import { toLower } from 'lodash'
import { PackageURL } from 'packageurl-js'
import { sbomOrigin } from 'variables/general'

import { LetterCIcon } from 'components/Icons/Icons'
import { LetterHIcon } from 'components/Icons/Icons'
import { LetterMIcon } from 'components/Icons/Icons'
import { LetterLIcon } from 'components/Icons/Icons'

import { BsBack } from 'react-icons/bs'
import {
  FaBalanceScale,
  FaBox,
  FaBug,
  FaCube,
  FaCubes,
  FaDownload,
  FaEdit,
  FaHammer,
  FaMinus,
  FaPlus,
  FaRobot,
  FaTimesCircle,
  FaUpload
} from 'react-icons/fa'
import {
  FaA,
  FaArrowRotateRight,
  FaArrowsRotate,
  FaBan,
  FaFileImport,
  FaGithub,
  FaScrewdriverWrench,
  FaToggleOff,
  FaToggleOn,
  FaUserAstronaut
} from 'react-icons/fa6'
import { MdDelete, MdOutlineArchive, MdOutlineUnarchive } from 'react-icons/md'
import { VscDebugRerun } from 'react-icons/vsc'

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

//Get formatted time accounting the time zone
export function formatDateWithTimeZone(
  date,
  dateFormat = 'MMMM dd, yyyy hh:mm a zzz'
) {
  if (!date) return ''
  const timeZone = date.endsWith('Z')
    ? 'UTC' // If 'Z', it's UTC
    : undefined

  const parsedDate = parseISO(date)
  const zonedDate = timeZone ? toZonedTime(parsedDate, timeZone) : parsedDate
  return formatWithTZ(zonedDate, dateFormat, { timeZone })
}

//Get the formatted current date and time
export const currentDateTime = (dateFormat = 'MMMM dd, yyyy hh:mm a') => {
  const now = new Date()
  const utcDate = toZonedTime(now, 'UTC')
  return formatWithTZ(utcDate, dateFormat) + ' UTC'
}

export const isMobileOrTablet = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
    userAgent
  )
}

export const getFileName = (name, type) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${name.toLowerCase()}-${year}${month}${day}-${hours}${minutes}${seconds}.${type}`
}

export const isCustomerView = () => {
  return window.location.pathname.startsWith('/customer')
}

export const getSignedUrlParams = () => {
  return sessionStorage.getItem('signedUrlParams')
}

export const getLink = (name) => {
  const result = sbomOrigin?.find((item) => item.value === name)
  const { link } = result || ''
  return link || '#'
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

export const cvssColor = (cvss) => {
  if (cvss >= 9.0) {
    return 'red'
  } else if (cvss >= 7.0) {
    return 'orange'
  } else if (cvss >= 6.0) {
    return 'yellow'
  } else if (cvss === '') {
    return 'gray'
  } else {
    return 'green'
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
    case 'unknown':
      return { bg: '#EDF2F7', text: '#1A202C' }
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

export const getEolStatusColor = (eolDate) => {
  const currentDate = new Date()
  const sixMonthsFromToday = new Date()

  sixMonthsFromToday.setMonth(sixMonthsFromToday.getMonth() + 6)

  if (new Date(eolDate) <= currentDate) {
    return 'red'
  } else if (new Date(eolDate) <= sixMonthsFromToday) {
    return 'orange'
  } else {
    return 'green'
  }
}

export const getColor = (result) => {
  switch (result) {
    case 'inform':
      return 'blue'
    case 'pass':
      return 'green'
    case 'warn':
      return 'yellow'
    case 'fail':
      return 'red'
    case 'skipped':
      return 'orange'
    case 'error':
      return 'gray'
  }
}

export const getChangelogColor = (type) => {
  switch (type) {
    case 'create':
      return 'green'
    case 'created':
      return 'green'
    case 'update':
      return 'blue'
    case 'updated':
      return 'blue'
    case 'modified':
      return 'pink'
    case 'destroyed':
      return 'red'
    case 'rerun':
      return 'purple'
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

// Checks if the given URL contains any whitespace.
export const hasWhiteSpace = (url) => {
  return /\s/.test(url)
}

export const timeSince = (inputDate) => {
  const timeDifference = calculateTimeDifference(inputDate)
  return formatTime(timeDifference)
}

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

export const disableButtonTemporarily = (setDisabled, delay = 3000) => {
  setDisabled(true)
  setTimeout(() => {
    setDisabled(false)
  }, delay)
}

export const convertDateFormat = (inputDate) => {
  const date = new Date(inputDate)
  const month = date.toLocaleString('default', { month: 'short' })
  const day = date.getDate()
  return `${month} ${day}`
}

export const getFullDate = (dateString, timeZone = userTimezone) => {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  }
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', options)
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
    return `Uploaded at ${getFullDate(sbom?.createdAt)}`
  }
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

export const validatePhoneNumber = (phone) => {
  const phoneRegex =
    /^\+?[1-9]\d{0,2}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
  return phoneRegex.test(phone)
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

export const truncatedValue = (name = '', length = 10) => {
  return name?.length > length ? `${name.substring(0, length)}...` : name
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

//Icon for confirmationModal
export const getConfirmatonModalIcon = (title) => {
  if (title.includes('Archive')) return MdOutlineArchive
  if (title.includes('Restore')) return MdOutlineUnarchive
  if (title.includes('Disable')) return FaToggleOff
  if (title.includes('Enable')) return FaToggleOn
  if (title.includes('Delete') || title.includes('Remove')) return MdDelete
  if (title.includes('Reprocess')) return FaArrowRotateRight
  if (title.includes('Cancel')) return FaBan
  if (title.includes('Rerun')) return VscDebugRerun
  return null
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

export const isValidPurl = (purl) => {
  if (purl) {
    try {
      PackageURL.fromString(decodeURI(purl))
      return true
    } catch (ex) {
      return false
    }
  } else {
    return false
  }
}

export const generateRandomColor = () => {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  )
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

export const detectOS = () => {
  const { userAgent } = window.navigator
  if (/Windows NT 10.0/.test(userAgent)) return 'Windows 10'
  if (/Windows NT 6.2/.test(userAgent)) return 'Windows 8'
  if (/Windows NT 6.1/.test(userAgent)) return 'Windows 7'
  if (/Windows NT 6.0/.test(userAgent)) return 'Windows Vista'
  if (/Windows NT 5.1/.test(userAgent)) return 'Windows XP'
  if (/Mac OS X 10[._]\d+/.test(userAgent)) return 'Mac OS X'
  if (/Linux/.test(userAgent)) return 'Linux'
  if (/Android/.test(userAgent)) return 'Android'
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
  return 'Unknown'
}

export const convertToCSV = (data, columns) => {
  const csvRows = []

  // Headers
  const headers = columns.join(',')
  csvRows.push(headers)

  // Rows
  data.forEach((row) => {
    const values = columns.map((column) =>
      row[column] !== undefined && row[column] !== null ? row[column] : 'NA'
    )
    csvRows.push(values.join(','))
  })

  return csvRows.join('\n')
}

export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.setAttribute('hidden', '')
  a.setAttribute('href', url)
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export const generateCsvFileName = ({
  tableType,
  rowsToExport,
  applyFilters,
  product,
  version,
  vulnId,
  projectGroupName
}) => {
  const filterStatus = applyFilters ? 'Filtered' : 'Unfiltered'
  const rowCount = rowsToExport === '200' ? 'All' : rowsToExport

  const fileNameTemplates = {
    'SBOM Components View': `${product}-${version}-Components-${filterStatus}-${rowCount}.csv`,
    'Vulnerability Detail View': `Vulnerabilities-${vulnId}-Products-${filterStatus}-${rowCount}.csv`,
    'SBOM Vulnerability View': `${product}-${version}-Vulnerabilities-${filterStatus}-${rowCount}.csv`,
    'SBOM License View': `${product}-${version}-Licenses-${filterStatus}-${rowCount}.csv`,
    'Vulnerability View': projectGroupName
      ? `${projectGroupName}-Vulnerabilities-${filterStatus}-${rowCount}.csv`
      : `Vulnerabilities-${filterStatus}-${rowCount}.csv`,
    'SBOM Support View': `${product}-${version}-Support-${filterStatus}-${rowCount}.csv`
  }

  return fileNameTemplates[tableType] || ''
}

//Function to print a required list of items with the expected punctuations, used for docs/pdf
export const listItemsForDoc = (listArray, key, key2) => {
  if (listArray.length === 0) return undefined

  if (listArray.length === 1) {
    const singleValue = key2
      ? `${listArray[0][key]} - ${listArray[0][key2]}`
      : `${listArray[0][key]}`
    return singleValue
  }

  let listString = ''
  listArray.map((list, index) => {
    const value = key2 ? `${list?.[key]} - ${list?.[key2]}` : list?.[key]

    if (index === 0) {
      listString += `${value}, `
    } else if (index === listArray.length - 1) {
      listString += ` ${value}`
    } else {
      listString += ` ${value}, `
    }
  })

  return listString
}

//Function for KEV filterting used under vulnerabilities
export const setKEV = (kev) => {
  if (kev === 'all' || kev === '') {
    return undefined
  } else if (kev === 'yes') {
    return true
  } else {
    return false
  }
}

// Reusable function to parse EPSS range into min and max values
export const parseEpssRange = (epss) => {
  // Check if epss is valid (not empty, 'all', or undefined)
  if (epss && epss !== 'all' && epss !== '') {
    const [min, max] = epss.split('-').map((val) => parseFloat(val) / 100)
    return {
      min,
      max
    }
  }
  // Return undefined if epss is invalid
  return undefined
}

export const transformLicenseString = (licenseText) => {
  if (!licenseText) return ''

  // Return the string unchanged if it starts with "LicenseRef-interlynk-"
  if (licenseText.startsWith('LicenseRef-interlynk-')) {
    return licenseText
  }

  // Return the string unchanged if it starts with "LicenseRef-"
  if (licenseText.startsWith('LicenseRef-')) {
    return licenseText
  }

  const sanitizedValue = licenseText.trim().replace(/\s+/g, '-')
  return `LicenseRef-interlynk-${sanitizedValue}`
}

export const parseLicenseString = (licenseText) => {
  if (!licenseText) return ''

  if (licenseText.startsWith('LicenseRef-interlynk-')) {
    return licenseText.slice('LicenseRef-interlynk-'.length).replace(/-/g, ' ')
  }

  return licenseText
}

export const valueToColor = (action, event, orig, updated) => {
  if (action == 'updated') {
    if (updated == '[]') {
      return 'red.500'
    } else if (orig == '[]') {
      return 'green.500'
    } else {
      return 'blue.500'
    }
  } else if (action == 'created') {
    if (event == 'auto_check') {
      return 'blue.500'
    } else {
      return 'green.500'
    }
  } else if (
    action == 'tool' ||
    action === 'retracted' ||
    action === 'restored' ||
    action === 'replaced'
  ) {
    return 'blue.500'
  } else if (action == 'auto_check') {
    return 'purple.500'
  } else if (action == 'download') {
    return 'blue.500'
  } else if (action == 'uploaded') {
    return 'green.500'
  } else if (action == 'failed') {
    return 'pink.500'
  } else if (action == 'destroyed') {
    return 'pink.500'
  }
}

export const valueToIcon = (action, event, orig, updated) => {
  if (action == 'updated') {
    if (updated == '[]') {
      return FaMinus
    } else if (orig == '[]') {
      return FaPlus
    } else {
      return FaEdit
    }
  } else if (action == 'created') {
    return FaHammer
  } else if (action == 'replaced') {
    return FaArrowsRotate
  } else if (action == 'retracted' || action == 'restored') {
    return BsBack
  } else if (action == 'tool') {
    return FaHammer
  } else if (action == 'auto_check') {
    return FaRobot
  } else if (action == 'download') {
    return FaDownload
  } else if (action == 'uploaded') {
    return FaUpload
  } else if (action == 'failed') {
    return FaTimesCircle
  } else if (action == 'destroyed') {
    return FaMinus
  }
}

export const valueToText = (action, event, orig, updated) => {
  if (action == 'updated') {
    if (updated == '[]') {
      return `${orig}`
    } else if (orig == '[]') {
      return `${updated}`
    } else if (event === 'primary') {
      return `Modified: ${orig === 'f' ? 'False' : 'True'} to ${
        updated === 't' ? 'True' : 'False'
      }`
    } else {
      return `Modified: ${orig} to ${updated}`
    }
  } else if (action == 'created') {
    return `${updated}`
  } else if (action == 'retracted' || action == 'restored') {
    return `${orig}`
  } else if (action == 'tool') {
    return `${updated}`
  } else if (action == 'auto_check') {
    return `${updated}`
  } else if (action == 'downloaded') {
    return `${updated}`
  } else if (action == 'uploaded') {
    return `${updated}`
  } else if (action == 'failed') {
    return `${updated?.substring(0, 100)}...`
  }
}

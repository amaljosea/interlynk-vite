/* eslint-disable */
import { format, parseISO } from 'date-fns'
import { format as formatWithTZ, toZonedTime } from 'date-fns-tz'
import { PackageURL } from 'packageurl-js'
import { sbomOrigin } from 'variables/general'

export const getFilterValue = (value, allValue = 'all') =>
  value.includes(allValue) || value.length === 0 ? undefined : value

export const formatString = (input) => {
  return input
    ?.split('_')
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    ?.join(' ')
}

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

export const getFullDateTime = (date) => {
  const currentDate = new Date(date)
  const zonedDate = toZonedTime(currentDate, userTimezone)
  const formattedDate = format(zonedDate, 'yyyy-MM-dd hh:mm:ss a', {
    userTimezone
  })
  return formattedDate
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

export const getDateFormat = (date) => {
  const currentDate = new Date(date)
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  const formatted = `${year}-${month}-${day}`
  return formatted
}

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

export const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { hours, minutes, seconds }
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

export const updatedValue = (operator) => {
  // Capitalize the operator and replace underscores with spaces
  return operator?.replace(/_/g, ' ')?.replace(/\b\w/g, (c) => c)
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

//Validate name for registration and profile edit
export const nameRegex = /^[a-zA-Z0-9 _-]+$/

export const isValidHexCode = (hex) => {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexPattern.test(hex)
}

//Usage ex: PolicyTable
export const formatConditionValue = (item) => {
  const isEPSS =
    item?.subject === 'VULNERABILITY_EPSS' &&
    (item?.operator === 'LESS_THAN' || item?.operator === 'MORE_THAN')
  if (item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS') return ''
  return `${item?.value}${isEPSS ? ' %' : ''}`
}

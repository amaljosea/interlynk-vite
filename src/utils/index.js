/* eslint-disable */
import { format, parseISO } from 'date-fns'
import { format as formatWithTZ, toZonedTime } from 'date-fns-tz'
import { PackageURL } from 'packageurl-js'
import { sbomOrigin } from 'variables/general'

export const csvToJson = (csvContent) => {
  const rows = csvContent.trim().split('\n')
  const headers = rows[0].split(',')

  return rows.slice(1).map((row) => {
    const values = row.split(',')
    return headers.reduce((acc, header, i) => {
      acc[header] = values[i]
      return acc
    }, {})
  })
}

export const getUndefinedIfEmptyOrAll = (value, allValue = 'all') =>
  value.includes(allValue) || value.length === 0 ? undefined : value

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

export const getSignedUrlParams = () => {
  return sessionStorage.getItem('signedUrlParams')
}

export const isSbomArchived = (sbom) => {
  return sbom?.lifecycle === 'archived'
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
  const headers = columns.map((column) => escapeCSVField(column)).join(',')
  csvRows.push(headers)
  // Rows
  data.forEach((row) => {
    const values = columns.map((column) => {
      const value =
        row[column] !== undefined && row[column] !== null ? row[column] : 'NA'
      return escapeCSVField(value)
    })
    csvRows.push(values.join(','))
  })
  return csvRows.join('\n')
}

// Helper function to properly escape CSV fields
const escapeCSVField = (field) => {
  field = String(field)
  // If the field contains commas, quotes, or newlines, it needs to be quoted
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    const removeOuterQuotes = (str) => {
      return str.replace(/^"(.*)"$/, '$1')
    }
    console.log(field)
    field = removeOuterQuotes(field)
    console.log(field)
    field = field.replace(/"/g, '""')
    console.log(field)
    // Wrap the field in quotes
    console.log(`"${field}"`)
    return `"${field}"`
  }
  return field
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
  projectGroupName,
  orgName
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
    'Support Status View': `${product}-${version}-Support-${filterStatus}-${rowCount}.csv`,
    Users: `${orgName}-Users.csv`
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

  if (licenseText?.startsWith('LicenseRef-interlynk-')) {
    return licenseText?.slice('LicenseRef-interlynk-'.length).replace(/-/g, ' ')
  }

  return licenseText
}

export const isValidHexCode = (hex) => {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexPattern.test(hex)
}

//Usage ex: automation columns
export const formatFieldValue = (item) => {
  switch (item?.field) {
    case 'component_support_level':
      return item?.value?.replaceAll('_', ' ')
    case 'component_end_of_support':
      return new Date(item?.value).toLocaleDateString()
    default:
      return item?.value
  }
}

//Usage ex: PolicyTable
export const formatConditionValue = (item) => {
  const isEPSS =
    item?.subject === 'VULNERABILITY_EPSS' &&
    (item?.operator === 'LESS_THAN' || item?.operator === 'MORE_THAN')
  if (item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS') return ''
  return `${item?.value}${isEPSS ? ' %' : ''}`
}

export const filterString = (input) => {
  if (typeof input !== 'string') {
    throw new Error('Invalid input: Only strings are allowed.')
  }
  return input.replace(/([a-z])([A-Z])/g, '$1 $2')
}

//Format the support level csv fields
export const formatSupportLevel = (level) => {
  const parts = level.split('_') // Split by underscore
  if (parts.length > 1) {
    // Capitalize only the first word and lowercase the rest
    return parts
      .map((part, index) => {
        if (index === 0) {
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() // First word capitalized
        }
        return part.toLowerCase() // Rest of the words in lowercase
      })
      .join(' ')
  }
  // Capitalize if there is only one word
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
}

export const fetchNodes = (res, selector) => {
  return selector?.split('.')?.reduce((acc, key) => acc?.[key], res?.data)
}

export const calculateExpiryDate = (days) => {
  if (!days || days <= 0) return 'N/A'

  const today = new Date()
  today.setUTCDate(today.getUTCDate() + days)
  return today.toLocaleDateString()
}

export const setIntensity = (level) => {
  switch (level) {
    case 'unspecified':
      return 'cyan'
    case 'actively_maintained':
      return 'green'
    case 'no_longer_maintained':
      return 'orange'
    case 'abandoned':
      return 'red'
    default:
      return 'gray'
  }
}

export const findShortestPath = (pathArray, currentShortestPath = []) => {
  if (!pathArray || pathArray.length === 0) {
    return currentShortestPath
  }
  const shortestPath = pathArray.reduce((minPath, currentPath) => {
    if (currentPath.depth < minPath.depth) {
      return currentPath
    }
    return minPath
  }, pathArray[0])
  return findShortestPath(shortestPath.path, [
    ...currentShortestPath,
    shortestPath
  ])
}

export const isValidWebhookURL = (url) => {
  try {
    // Check if the URL is valid and uses HTTPS
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'https:') {
      return false
    }

    // Patterns for Microsoft Teams and Slack webhooks
    const teamsWebhookPattern =
      /https:\/\/outlook\.office\.com\/webhook\/.*\/IncomingWebhook\/.*\/.*$/
    const slackWebhookPattern =
      /https:\/\/hooks\.slack\.com\/services\/.*\/.*\/.*$/

    // Check if the URL matches either pattern
    return teamsWebhookPattern.test(url) || slackWebhookPattern.test(url)
  } catch (e) {
    return false
  }
}

export const getDate = (totalDays) => {
  const today = new Date()
  today?.setDate(today.getDate() + totalDays)
  return today
}

export const getTotalDays = (dateString) => {
  if (!dateString) return 0

  const givenDate = new Date(dateString)
  const today = new Date()

  givenDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffInMs = givenDate - today
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24))
}

export const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : 'N/A'
}

export const splitBySupportLevel = (groups) => {
  const withSupport = groups?.flatMap((group) =>
    group?.occurrences?.filter(
      (occurrence) => occurrence?.componentSupportLevel !== null
    )
  )
  const withoutSupport = groups?.flatMap((group) =>
    group?.occurrences?.filter(
      (occurrence) => occurrence?.componentSupportLevel === null
    )
  )

  return { withSupport, withoutSupport }
}

import {
  CVSS3_METRICS,
  CVSS3_SCORES,
  CVSS4_METRICS,
  CVSS4_SCORES
} from 'variables/general'

export const getCvssVersion = (cvssString) => {
  if (!cvssString?.startsWith('CVSS:')) return 'unknown'
  const versionPattern = /CVSS:(\d\.\d)/
  const match = cvssString?.match(versionPattern)
  if (match) {
    const version = match[1]
    if (version.startsWith('4')) {
      return '4'
    } else if (version.startsWith('3')) {
      return '3'
    }
  }
  return 'unknown'
}

export const getCvssObject = (value) => {
  const result = {}
  const sanitizedString = value?.replace(/^CVSS:(3.0|3.1|4.0)\//, '')
  const pairs = sanitizedString?.split('/')
  pairs?.forEach((pair) => {
    const [key, value] = pair.split(':')
    if (key && value) {
      result[key] = value
    }
  })
  return result
}

export const getFormatedCvss = (version, cvss) => {
  const formatedCVSS = {}
  const metrics = version === '3' ? CVSS3_METRICS : CVSS4_METRICS
  for (const [key, value] of Object.entries(cvss)) {
    if (version === '3') {
      if (CVSS3_SCORES[key]) {
        formatedCVSS[CVSS3_SCORES[key]] = metrics[key][value]
      }
    } else if (version === '4') {
      if (CVSS4_SCORES[key]) {
        formatedCVSS[CVSS4_SCORES[key]] = metrics[key][value]
      }
    }
  }
  return formatedCVSS
}

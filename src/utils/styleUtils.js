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
import { toLower } from 'lodash'
import { sbomOrigin } from 'variables/general'

import { useColorModeValue } from '@chakra-ui/system'

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
  FaArrowRotateRight,
  FaArrowsRotate,
  FaBan,
  FaToggleOff,
  FaToggleOn
} from 'react-icons/fa6'
import {
  FaA,
  FaFileImport,
  FaGithub,
  FaScrewdriverWrench,
  FaUserAstronaut
} from 'react-icons/fa6'
import { MdDelete, MdOutlineArchive, MdOutlineUnarchive } from 'react-icons/md'
import { VscDebugRerun } from 'react-icons/vsc'

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

//Usage ex: PolicyColumns
export const getResultColor = (result) => {
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

//Usage ex: Request table
export const getStatusColor = (status) => {
  switch (status) {
    case 'Sent':
      return 'green'
    case 'Bounced':
      return 'orange'
    case 'Canceled':
      return 'red'
    case 'Uploaded':
      return 'blue'
    case 'Declined':
      return 'red'
    case 'Accepted':
      return 'green'
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
  if (hex?.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex?.length === 7) {
    r = parseInt(hex[1] + hex[2], 16)
    g = parseInt(hex[3] + hex[4], 16)
    b = parseInt(hex[5] + hex[6], 16)
  }
  return `rgba(${r},${g},${b},${opacity})`
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

export const getSupportStatusColor = (eolDate, warningMonths = 6) => {
  const currentDate = new Date()
  const warningDate = new Date()
  warningDate.setMonth(currentDate.getMonth() + warningMonths)

  const targetDate = new Date(eolDate)

  if (targetDate <= currentDate) {
    return 'red'
  } else if (targetDate <= warningDate) {
    return 'orange'
  } else {
    return 'green'
  }
}

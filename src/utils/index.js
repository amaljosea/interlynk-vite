import grype from 'assets/img/grype.png'
import trivy from 'assets/img/trivy.png'
import scout from 'assets/img/scout.png'
import snyk from 'assets/img/snyk.png'
import custom from 'assets/img/custom.png'

import { LetterCIcon } from 'components/Icons/Icons'
import { LetterHIcon } from 'components/Icons/Icons'
import { LetterMIcon } from 'components/Icons/Icons'
import { LetterLIcon } from 'components/Icons/Icons'

import DockerIcon from 'assets/svg/docker.svg'
import AWSIcon from 'assets/svg/aws.svg'
import AzureIcon from 'assets/svg/azure.svg'
import GitHubIcon from 'assets/svg/github.svg'
import GitlabIcon from 'assets/svg/gitlab.svg'

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
    case 'Gitlab':
      return GitlabIcon
    default:
      break
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
  switch (severity) {
    case 'critical':
      return 'red'
    case 'super critical':
      return 'red'
    case 'high':
      return 'orange'
    case 'super high':
      return 'orange'
    case 'medium':
      return 'yellow'
    case 'low':
      return 'green'
    case 'super low':
      return 'green'
    case 'negligible':
      return 'green'
    default:
      return 'blue'
  }
}

export const statusColor = (status) => {
  if (status && status.name === 'Fixed') {
    return 'blue'
  } else if (status && status.name === 'Not Affected') {
    return 'green'
  } else if (status && status.name == 'Affected') {
    return 'red'
  } else if (status && status.name === 'False Positive') {
    return 'gray'
  } else {
    return 'cyan'
  }
}

export const timeSince = (dateStr) => {
  var date = new Date(dateStr)
  var seconds = Math.floor((new Date() - date) / 1000)
  var interval = seconds / 31536000
  if (interval > 1) {
    return Math.floor(interval) + ' years ago'
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' months ago'
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + ' days ago'
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago'
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago'
  }
  return Math.floor(seconds) + ' seconds ago'
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
  const hours = Math.floor(minutes / 60)

  const timeTaken = `${minutes % 60}m ${seconds % 60}s`

  return timeTaken
}

export const dateTime = (updatedAt) => {
  const date = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Los_Angeles'
  })
  const time = new Date(updatedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles'
  })

  return `${date} ${time}`
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

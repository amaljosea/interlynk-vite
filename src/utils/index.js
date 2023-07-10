import docker from 'assets/img/docker.png'
import amazon from 'assets/img/amazon.png'
import azure from 'assets/img/azure.png'
import github from 'assets/img/github.png'
import gitlab from 'assets/img/gitlab.png'

import grype from 'assets/img/grype.png'
import trivy from 'assets/img/trivy.png'
import scout from 'assets/img/scout.png'
import snyk from 'assets/img/snyk.png'
import custom from 'assets/img/custom.png'

import { LetterCIcon } from 'components/Icons/Icons'
import { LetterHIcon } from 'components/Icons/Icons'
import { LetterMIcon } from 'components/Icons/Icons'
import { LetterLIcon } from 'components/Icons/Icons'

export const getConImg = (name) => {
  switch (name) {
    case 'Docker Hub':
      return docker
    case 'Amazon ECR':
      return amazon
    case 'Azure Container Registry':
      return azure
    case 'Github (ghcr.io)':
      return github
    case 'Gitlab':
      return gitlab
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

export const sevIcon = (version) => {
  if (version >= 9.0) {
    return LetterCIcon
  } else if (version >= 7.0) {
    return LetterHIcon
  } else if (version >= 6.0) {
    return LetterMIcon
  } else {
    return LetterLIcon
  }
}

export const sevColor = (verion) => {
  if (verion >= 9.0) {
    return 'red'
  } else if (verion >= 7.0) {
    return 'orange'
  } else if (verion >= 6.0) {
    return 'yellow'
  } else {
    return 'green'
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

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

export const getConImg = (name) => {
  switch (name) {
    case 'Docker Hub':
      return docker
      break
    case 'Amazon ECR':
      return amazon
      break
    case 'Azure Container Registry':
      return azure
      break
    case 'Github (ghcr.io)':
      return github
      break
    case 'Gitlab':
      return gitlab
      break
    default:
      break
  }
}

export const scanImage = (name) => {
  switch (name) {
    case 'Grype':
      return grype
      break
    case 'Trivy':
      return trivy
      break
    case 'Scout':
      return scout
      break
    case 'Snyk':
      return snyk
      break
    case 'Custom':
      return custom
      break
  }
}

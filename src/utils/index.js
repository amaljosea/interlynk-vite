import docker from 'assets/img/docker.png'
import amazon from 'assets/img/amazon.png'
import azure from 'assets/img/azure.png'
import github from 'assets/img/github.png'
import gitlab from 'assets/img/gitlab.png'

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

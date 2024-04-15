import { gql, useQuery } from '@apollo/client'
import { checkIfCustomer } from 'utils/url'

export const GetProjectsVendor = gql`
  query GetProjectsVendor($projectGroupId: Uuid!) {
    projectGroup(id: $projectGroupId) {
      name
      defaultProject {
        id
      }
      projects {
        id
        name
      }
    }
  }
`

export const GetProjectsCustomer = gql`
  query GetProjectsCustomer($projectGroupId: Uuid!) {
    shareLynkQuery {
      projectGroup(id: $projectGroupId) {
        name
        defaultProject {
          id
        }
        projects {
          id
          name
        }
      }
    }
  }
`

export const useProjectGroup = ({ projectGroupId }) => {
  const isCustomer = checkIfCustomer()
  const { data } = useQuery(
    isCustomer ? GetProjectsCustomer : GetProjectsVendor,
    {
      skip: !projectGroupId,
      variables: { projectGroupId }
    }
  )
  const projectGroup = isCustomer
    ? data?.shareLynkQuery?.projectGroup
    : data?.projectGroup

  console.log({ projectGroup })
  return {
    projects: projectGroup?.projects || [],
    name: projectGroup?.name,
    defaultProjectId: projectGroup?.defaultProject?.id
  }
}

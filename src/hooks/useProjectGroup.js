import { gql, useQuery } from '@apollo/client'
import { isCustomerView } from 'utils'

export const GetProjectsVendor = gql`
  query GetProjectsVendor($projectGroupId: Uuid!) {
    projectGroup(id: $projectGroupId) {
      id
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
        id
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
  const isCustomer = isCustomerView()
  const { data, loading } = useQuery(
    isCustomer ? GetProjectsCustomer : GetProjectsVendor,
    {
      skip: !projectGroupId,
      variables: { projectGroupId }
    }
  )
  const projectGroup = isCustomer
    ? data?.shareLynkQuery?.projectGroup
    : data?.projectGroup

  // console.log({ projectGroup })
  return {
    projects: projectGroup?.projects || [],
    name: projectGroup?.name,
    defaultProjectId: projectGroup?.defaultProject?.id,
    loading
  }
}

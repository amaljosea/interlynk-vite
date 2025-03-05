import { gql, useQuery } from '@apollo/client'

import { useRouteFlags } from 'hooks/useRouteFlags'

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
  const { isCustomerView } = useRouteFlags()
  const { data, loading } = useQuery(
    isCustomerView ? GetProjectsCustomer : GetProjectsVendor,
    {
      skip: !projectGroupId,
      variables: { projectGroupId }
    }
  )
  const projectGroup = isCustomerView
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

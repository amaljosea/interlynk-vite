import { gql } from '@apollo/client'

export const GetAllConnectors = gql`
  query GetAllConnectors {
    connectors {
      id
      name
      kind
    }
  }
`

export const GetAllOrgConnectors = gql`
  query GetAllOrgConnectors($id: ID!) {
    organizationConnectors(organizationId: $id) {
      id
      connector {
        name
      }
      name
      username
      updatedAt
      enabled
    }
  }
`

import { gql } from '@apollo/client'

export const OrgConnectorCreate = gql`
  mutation OrgConnectorCreate(
    $orgId: Uuid!
    $connId: Uuid!
    $name: String!
    $user: String!
    $token: String!
    $enabled: Boolean
  ) {
    organizationConnectorCreate(
      input: {
        organizationId: $orgId
        connectorId: $connId
        name: $name
        username: $user
        token: $token
        enabled: $enabled
      }
    ) {
      organizationConnector {
        id
        organizationId
        connectorId
        connector {
          name
        }
        name
        username
        enabled
      }
    }
  }
`

export const OrgConnectorUpdate = gql`
  mutation OrgConnectorUpdate($id: ID!, $name: String, $enabled: Boolean) {
    organizationConnectorUpdate(
      input: { id: $id, name: $name, enabled: $enabled }
    ) {
      organizationConnector {
        id
        organizationId
        connectorId
        connector {
          name
        }
        name
        username
        enabled
      }
    }
  }
`

export const OrgConnectorDelete = gql`
  mutation OrgConnectorDelete($id: ID!) {
    organizationConnectorDelete(input: { id: $id }) {
      organizationConnector {
        id
      }
    }
  }
`

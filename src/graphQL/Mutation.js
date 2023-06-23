import { gql } from '@apollo/client'

export const OrgConnectorCreate = gql`
  mutation OrgConnectorCreate(
    $orgId: Uuid!
    $connId: Uuid!
    $name: String
    $user: String!
    $token: String!
    $readonly: Boolean
    $enabled: Boolean
  ) {
    organizationConnectorCreate(
      input: {
        organizationConnectorInput: {
          organizationId: $orgId
          connectorId: $connId
          name: $name
          username: $user
          token: $token
          readOnly: $readonly
          enabled: $enabled
        }
      }
    ) {
      organizationConnector {
        id
        connector {
          name
        }
        name
        username
        readOnly
        enabled
      }
    }
  }
`

export const OrgConnectorUpdate = gql`
  mutation OrgConnectorUpdate(
    $id: ID!
    $orgId: Uuid!
    $connId: Uuid!
    $name: String
    $user: String!
    $token: String!
    $readonly: Boolean
    $enabled: Boolean
  ) {
    organizationConnectorUpdate(
      input: {
        id: $id
        organizationConnectorInput: {
          organizationId: $orgId
          connectorId: $connId
          name: $name
          username: $user
          token: $token
          readOnly: $readonly
          enabled: $enabled
        }
      }
    ) {
      organizationConnector {
        id
        organizationId
        connectorId
        name
        username
        readOnly
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

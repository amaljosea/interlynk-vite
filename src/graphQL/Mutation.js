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

export const scannerUpdate = gql`
  mutation scannerUpdate(
    $id: ID!
    $company: String!
    $name: String!
    $version: String!
    $description: String!
    $releasedAt: ISO8601Date!
  ) {
    scannerUpdate(
      input: {
        id: $id
        company: $company
        name: $name
        version: $version
        description: $description
        releasedAt: $releasedAt
      }
    ) {
      scanner {
        id
        company
        name
        description
        version
      }
    }
  }
`

export const imageCreate = gql`
  mutation orgImageCreate($id: Uuid!, $name: String!) {
    imageCreate(input: { organizationConnectorId: $id, name: $name }) {
      image {
        id
        name
        organizationConnector {
          id
          organizationId
          connectorId
          name
          username
          enabled
        }
        organizationConnectorId
        updatedAt
      }
    }
  }
`

export const imgScannerCreate = gql`
  mutation imgScannerCreate($imgVersionId: Uuid!, $scannerId: Uuid!) {
    imageScannerCreate(
      input: { imageVersionId: $imgVersionId, scannerId: $scannerId }
    ) {
      imageScanner {
        id
        imageVersion {
          id
          imageId
          name
        }
        imageVersionId
        scanner {
          id
          company
          name
        }
        scannerId
        updatedAt
      }
    }
  }
`

export const imgScannerDelete = gql`
  mutation imgScannerDelete($id: ID!) {
    imageScannerDelete(input: { id: $id }) {
      imageScanner {
        id
        imageVersion {
          id
          imageId
          name
        }
        imageVersionId
        scanner {
          id
          company
          name
        }
        scannerId
        updatedAt
      }
    }
  }
`

export const imageVersionCreate = gql`
  mutation imageVersionCreate(
    $imageId: Uuid!
    $name: String!
    $size: Int!
    $imageShaId: String!
  ) {
    imageVersionCreate(
      input: {
        imageId: $imageId
        name: $name
        sizeInBytes: $size
        imageShaId: $imageShaId
      }
    ) {
      imageVersion {
        id
        image {
          id
          name
          organizationConnectorId
        }
        imageShaId
        name
        sizeInBytes
        updatedAt
      }
    }
  }
`

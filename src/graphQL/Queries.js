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

export const getAllScanners = gql`
  query GetAllScanners {
    scanners {
      id
      company
      name
      version
    }
  }
`

export const GetAllImages = gql`
  query GetAllImages($id: ID!) {
    images(organizationId: $id) {
      id
      name
      organizationConnector {
        id
        connector {
          name
        }
        name
        username
        updatedAt
        enabled
      }
      organizationConnectorId
      updatedAt
    }
  }
`

export const getImageVersion = gql`
  query getImageVersion($id: ID!) {
    imageVersions(imageId: $id) {
      id
      image {
        id
        name
        organizationConnectorId
      }
      imageId
      name
      sizeInBytes
      updatedAt
    }
  }
`

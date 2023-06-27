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
      imageVersions {
        name
      }
      organizationConnector {
        id
        name
      }
      imageScanners {
        id
        name
        version
        company
      }
      scanResults {
        id
        cveId
        compName
        compVersion
        fixedInComp
        cvssv3
        scanner {
          id
          name
        }
      }
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

export const getVulnerabilities = gql`
  query getVulnerabilities($id: ID!) {
    images(organizationId: $id) {
      id
      name
      scanResults {
        id
        cveId
        compName
        compVersion
        fixedInComp
        fixedInImage
        cvssv3
        scanner {
          id
          name
        }
      }
    }
  }
`

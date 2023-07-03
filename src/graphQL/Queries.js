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
        name
        connector {
          name
        }
      }
      imageScanners {
        id
        name
        version
        company
      }
      imageVersions {
        id
        name
      }
      updatedAt
    }
  }
`

export const getImage = gql`
  query getImage($id: ID!) {
    image(id: $id) {
      id
      name
      updatedAt
      imageScanners {
        id
        name
        company
      }
      imageVersions {
        name
        imageVulns {
          cveId
          cvss {
            v2Score
            v3Score
          }
          component {
            fixedInVersion
            name
            version
          }
          scanners {
            name
          }
          severity
        }
      }
    }
  }
`

export const getImageVersion = gql`
  query getImageVersion($id: ID!, $imageID: ID) {
    imageVersion(id: $id) {
      id
      image {
        name
      }
      imageScanners {
        id
        name
        version
      }
      imageShaId
      name
      sizeInBytes
      updatedAt
      imageVulns(imageVersionId: $id, imageId: $imageID) {
        cveId
        component {
          fixedInVersion
          name
          version
        }
        cvss {
          v2Score
          v3Score
        }
        severity
        fixedInImage
        scanners {
          id
          name
          version
        }
      }
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

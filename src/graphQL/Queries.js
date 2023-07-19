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
  query GetAllOrgConnectors {
    organizationConnectors {
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
    }
  }
`

export const GetAllImages = gql`
  query GetAllImages {
    images {
      id
      name
      scanEnabled
      organizationConnector {
        id
        name
        connector {
          name
        }
      }
      lastPushedAt
      imageScanners {
        id
        name
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
      imageVersions {
        id
        name
      }
      shareLynks {
        id
        enabled
        signedUrlParams
        shareUsers {
          email
        }
        shareScanners {
          scanner {
            id
            name
            company
          }
        }
        updatedAt
      }
    }
  }
`

export const getImageVersion = gql`
  query getImageVersion($id: ID!) {
    imageVersion(id: $id) {
      id
      image {
        id
        name
      }
      imageScanners {
        id
        company
        name
        updatedAt
      }
      name
      updatedAt
      imageVulns(imageVersionId: $id) {
        cveId
        component {
          fixedInVersion
          name
          version
        }
        vexVuln {
          vexStatus {
            id
            name
          }
          vexJustification {
            id
            name
          }
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
          company
          updatedAt
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

export const getVexLogs = gql`
  query getVexLogs(
    $imageVersionId: ID!
    $cveId: String!
    $compName: String!
    $version: String!
  ) {
    vexLogs(
      imageVersionId: $imageVersionId
      cveId: $cveId
      compName: $compName
      version: $version
    ) {
      id
      note
      vexJustification {
        name
      }
      vexStatus {
        name
      }
      user {
        name
        email
      }
      updatedAt
    }
  }
`

export const getVexStatuses = gql`
  query getVexStatuses {
    vexStatuses {
      id
      name
    }
  }
`

export const getVexJustifications = gql`
  query getVexJustifications {
    vexJustifications {
      id
      name
    }
  }
`

export const GetSignedImage = gql`
  query GetSignedImage($signedParams: String!) {
    image(signedParams: $signedParams) {
      id
      name
      imageScanners {
        id
        name
        company
        updatedAt
      }
      imageVersions {
        id
        name
      }
      lastPushedAt
      updatedAt
    }
  }
`

export const GetSignedImageVersion = gql`
  query GetSignedImageVersion($signedParams: String!, $imgVersionId: ID!) {
    imageVersion(signedParams: $signedParams) {
      id
      name
      imageVulns(imageVersionId: $imgVersionId) {
        component {
          name
          version
          fixedInVersion
        }
        cveId
        cvss {
          v2Score
          v3Score
        }
        scanners {
          id
          name
          company
        }
        severity
        vexVuln {
          vexStatus {
            id
            name
          }
          vexJustification {
            id
            name
          }
        }
      }
    }
  }
`

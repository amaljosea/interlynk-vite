import { gql } from '@apollo/client'

export const GetOrgInfo = gql`
  query GetOrganization {
    organization {
      id
      name
      email
      url
      organizationSettings {
        id
        value
        setting {
          id
          name
          kind
        }
      }
    }
  }
`

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

// export const getImageVersion = gql`
//   query getImageVersion($id: ID!) {
//     imageVersion(id: $id) {
//       id
//       image {
//         id
//         name
//         scanEnabled
//       }
//       imageScanners {
//         id
//         company
//         name
//         updatedAt
//       }
//       name
//       updatedAt
//       lastPushedAt
//       imageScannerRun(id: $id) {
//         initiatedAt
//         completedAt
//         status
//         vulnDbVersion
//         dbLastUpdatedAt
//         scannerVersion
//         scannerId
//       }
//       imageVulns(imageVersionId: $id) {
//         cveId
//         component {
//           fixedInVersion
//           name
//           version
//         }
//         vexVuln {
//           fixedByImageVersion {
//             name
//           }
//           vexStatus {
//             id
//             name
//           }
//           vexJustification {
//             id
//             name
//           }
//         }
//         cvss {
//           v2Score
//           v3Score
//         }
//         severity
//         fixedInImage
//         scanners {
//           id
//           name
//           company
//           updatedAt
//         }
//       }
//     }
//   }
// `

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
  query GetSignedImageVersion(
    $signedParams: String!
    $imgVersionId: ID!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    imageVersion(signedParams: $signedParams) {
      id
      name
      lastPushedAt
      tags
      image {
        id
        name
        scanEnabled
      }
      imageScanners {
        id
        company
        name
        updatedAt
      }
      imageScannerRun(id: $imgVersionId) {
        initiatedAt
        completedAt
        status
        vulnDbVersion
        dbLastUpdatedAt
        scannerVersion
        scannerId
        failedAt
      }
      imageVulns(
        imageVersionId: $imgVersionId
        first: $first
        last: $last
        after: $after
        before: $before
      ) {
        pageInfo {
          startCursor
          hasPreviousPage
          endCursor
          hasNextPage
        }
        nodes {
          cveId
          component {
            name
            version
            fixedInVersion
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
          vexVuln {
            fixedByImageVersion {
              name
            }
            vexJustification {
              name
            }
            vexStatus {
              name
            }
          }
        }
      }
    }
  }
`

export const ImagePagination = gql`
  query GetImagesForOrg(
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    images(first: $first, after: $after, last: $last, before: $before) {
      pageInfo {
        hasPreviousPage
        startCursor
        endCursor
        hasNextPage
      }
      nodes {
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
  }
`

export const GetImgVersionPagination = gql`
  query GetImageVersion(
    $imageVersionId: ID!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    imageVersion(id: $imageVersionId) {
      id
      name
      lastPushedAt
      tags
      image {
        id
        name
        scanEnabled
      }
      imageScanners {
        id
        company
        name
        updatedAt
      }
      imageScannerRun(id: $imageVersionId) {
        initiatedAt
        completedAt
        status
        vulnDbVersion
        dbLastUpdatedAt
        scannerVersion
        scannerId
        failedAt
      }
      imageVulns(
        imageVersionId: $imageVersionId
        first: $first
        last: $last
        after: $after
        before: $before
      ) {
        pageInfo {
          startCursor
          hasPreviousPage
          endCursor
          hasNextPage
        }
        nodes {
          cveId
          component {
            name
            version
            fixedInVersion
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
          vexVuln {
            fixedByImageVersion {
              name
            }
            vexJustification {
              name
            }
            vexStatus {
              name
            }
          }
        }
      }
    }
  }
`

export const GetSettings = gql`
  query GetAllSettings {
    settings {
      id
      name
      kind
      friendlyName
    }
  }
`

export const GetFeedLogs = gql`
  query GetFeed(
    $date: String!
    $severity: String
    $source: String
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    feedLogs(
      date: $date
      severity: $severity
      source: $source
      first: $first
      last: $last
      after: $after
      before: $before
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        refId
        editedAt
        publishedAt
        severity
        source
        id
        description
      }
    }
  }
`

export const GetProjectData = gql`
  query GetProjects($first: Int, $last: Int, $after: String, $before: String) {
    projects(first: $first, last: $last, after: $after, before: $before) {
      pageInfo {
        endCursor
        hasNextPage
        startCursor
        hasPreviousPage
      }
      nodes {
        id
        name
        description
        updatedAt
        organizationId
        sboms {
          id
          cpes
          spec
          creationAt
          specVersion
          project {
            id
          }
          tools {
            id
            name
          }
          authors {
            name
            email
          }
          suppliers {
            name
            email
          }
          components {
            id
            name
            version
            primary
            internal
            purl
            cpes
            licenses
          }
        }
      }
    }
  }
`

export const GetSBOM = gql`
  query GetSbom($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      cpes
      spec
      purl
      creationAt
      updatedAt
      specVersion
      project {
        id
        name
      }
      tools {
        id
        name
        version
        updatedAt
      }
      authors {
        id
        name
        email
        updatedAt
      }
      suppliers {
        id
        name
        email
        updatedAt
      }
      components {
        id
        name
        version
        primary
        internal
        purl
        cpes
        licenses
        updatedAt
        uniqueId
        kind
      }
    }
  }
`

export const GetProject = gql`
  query getProject($id: ID!) {
    project(id: $id) {
      id
      name
      sboms {
        id
        components {
          primary
          version
        }
      }
    }
  }
`

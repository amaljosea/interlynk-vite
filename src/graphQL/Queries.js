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

export const GetImages = gql`
  query getImages($first: Int, $last: Int, $after: String, $before: String) {
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
          format
          updatedAt
          primaryComponent {
            id
            name
            version
          }
          components(
            after: $after
            before: $before
            first: $first
            last: $last
          ) {
            nodes {
              primary
              version
            }
          }
        }
      }
    }
  }
`

export const GetSBOM = gql`
  query GetSbom(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      spec
      format
      creationAt
      updatedAt
      specVersion
      primaryComponent {
        id
        name
        version
      }
      stats {
        compCount
        compLicenseCount
        compCpeCount
        compPurlCount
      }
      project {
        id
        name
      }
      licenses
      lifecycle
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
      components(after: $after, before: $before, first: $first, last: $last) {
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
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
          copyright
          publisher
          description
          licenseExp
          group
          suppliers {
            id
            name
            email
            updatedAt
          }
        }
      }
    }
  }
`

export const GetProject = gql`
  query getProject(
    $id: ID!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    project(id: $id) {
      id
      name
      description
      updatedAt
      sboms {
        id
        spec
        specVersion
        updatedAt
        primaryComponent {
          id
          name
          version
        }
        components(after: $after, before: $before, first: $first, last: $last) {
          nodes {
            primary
            version
          }
        }
      }
    }
  }
`

export const DownloadSBOM = gql`
  query downloadSbom(
    $projectId: Uuid!
    $sbomId: Uuid!
    $spec: String
    $format: String
    $includeVulns: Boolean
    $includeVex: Boolean
    $original: Boolean
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      download(
        sbomId: $sbomId
        spec: $spec
        format: $format
        includeVulns: $includeVulns
        includeVex: $includeVex
        original: $original
      )
    }
  }
`

// Get all sharelynks
export const GetAllShareLynks = gql`
  query getAllShareLynks {
    shareLynks {
      id
      enabled
      updatedAt
      signedUrlParams
      shareUsers {
        email
        tos
      }
      contents {
        __typename
        ... on Image {
          id
          name
        }
        ... on Project {
          id
          name
        }
      }
    }
  }
`

// Customer page - Get All shared products
export const GetSignedProjects = gql`
  query getSignedProjects(
    $signedParams: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    projects(signedParams: $signedParams) {
      id
      description
      name
      updatedAt
      sboms {
        id
        format
        updatedAt
        primaryComponent {
          id
          name
          version
        }
        components(after: $after, before: $before, first: $first, last: $last) {
          nodes {
            primary
            version
          }
        }
      }
    }
  }
`

// Get All shared images
export const GetSignedImages = gql`
  query getSignedImages($signedParams: String!) {
    images(signedParams: $signedParams) {
      id
      name
      scanEnabled
      organizationConnector {
        id
        name
        connector {
          id
          name
          kind
          updatedAt
        }
      }
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

export const GetSignedImage = gql`
  query getSignedImage($imageId: Uuid!, $signedParams: String!) {
    image(imageId: $imageId, signedParams: $signedParams) {
      id
      name
      updatedAt
      imageVersions {
        id
        name
      }
    }
  }
`

// Get signed image
export const GetSignedImageVerion = gql`
  query getSignedImageVersion(
    $signedParams: String!
    $imageId: Uuid!
    $imageVersionId: Uuid!
    $versionId: ID!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    imageVersion(
      signedParams: $signedParams
      imageId: $imageId
      imageVersionId: $imageVersionId
    ) {
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
      imageScannerRun(id: $versionId) {
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
        imageVersionId: $versionId
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

// Get signed product

export const GetProjectInfo = gql`
  query getProjectInfo(
    $signedParams: String!
    $projectId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    project(signedParams: $signedParams, projectId: $projectId) {
      id
      name
      description
      updatedAt
      sboms {
        id
        spec
        specVersion
        primaryComponent {
          id
          name
          version
        }
        components(after: $after, before: $before, first: $first, last: $last) {
          nodes {
            primary
            version
          }
        }
      }
    }
  }
`

export const GetSignedSBOM = gql`
  query getSignedSBOM(
    $projectId: Uuid!
    $sbomId: Uuid!
    $signedParams: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId, signedParams: $signedParams) {
      id
      cpes
      spec
      purl
      format
      creationAt
      updatedAt
      specVersion
      project {
        id
        name
      }
      licenses
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
      components(after: $after, before: $before, first: $first, last: $last) {
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
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
          suppliers {
            id
            name
            email
            updatedAt
          }
        }
      }
    }
  }
`

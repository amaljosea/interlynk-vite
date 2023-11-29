import { gql } from '@apollo/client'

// GET ORG INFO
export const GetOrg = gql`
  query GetOrganization {
    organization {
      email
      id
      name
      updatedAt
      url
      currentUser {
        id
        name
        email
        apiKeys {
          id
          rawToken
          tokenMask
          revoked
          expired
          createdAt
          updatedAt
          revokedAt
          expiresAt
          notes
        }
      }
      users {
        id
        name
        email
        role
        timezone
        createdAt
      }
      organizationConnectors {
        enabled
        name
      }
      organizationComponents {
        id
        matchStr
        updatedAt
      }
    }
  }
`

// GET ORGANIZATION RULES
export const GetOrgRules = gql`
  query GetOrgRules(
    $field: OrganizationRuleOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      organizationRules(orderBy: { field: $field, direction: $direction }) {
        id
        action
        enabled
        severity
        updatedAt
        rule {
          shortDesc
          longDesc
          friendlyId
          category
        }
      }
    }
  }
`

// GET ORGANIZATION SETTINGS
export const GetOrgSettings = gql`
  query GetOrgRules {
    organization {
      organizationSettings {
        id
        value
        setting {
          name
          friendlyName
          kind
        }
      }
    }
  }
`

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
  query GetProjectData(
    $search: String
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ProjectOrderByFields!
    $direction: OrderByDirection!
  ) {
    projects(
      search: $search
      first: $first
      last: $last
      after: $after
      before: $before
      orderBy: { field: $field, direction: $direction }
    ) {
      totalCount
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
        enabled
        sboms {
          id
          format
          creationAt
          updatedAt
          primaryComponent {
            id
            name
            version
          }
        }
      }
    }
  }
`

// ----------------------- PRODUCT DETAILS PAGE ---------------------------

// GET PRODUCT INFO
export const GetProductData = gql`
  query GetProductData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      updatedAt
      vulnRunStatus
      primaryComponent {
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
      }
      stats {
        compCount
        compLicenseCount
        compCpeCount
        compPurlCount
        vulnStats
      }
      project {
        id
        name
      }
      lifecycle
      creationAt
      updatedAt
      licenses
      licenseExp
      format
      spec
      specVersion
      tools {
        id
        name
        version
        vendor
        updatedAt
      }
      project {
        name
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
        url
        contactEmail
        contactName
      }
    }
  }
`

// GET COMPONENT DATA
export const GetComponentData = gql`
  query GetComponentData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $search: String
    $licenses: [String!]
    $supplierName: [String!]
    $ecosystem: [String!]
    $kind: [String!]
    $internal: Boolean
    $primary: Boolean
    $field: ComponentOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(
        sbomId: $sbomId
        after: $after
        before: $before
        first: $first
        last: $last
        search: $search
        licenses: $licenses
        supplierName: $supplierName
        ecosystem: $ecosystem
        kind: $kind
        internal: $internal
        primary: $primary
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
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
          externalUrls {
            name
            url
          }
          suppliers {
            id
            name
            contactEmail
            contactName
            updatedAt
          }
        }
      }
    }
  }
`

// GET COMPONENT DEPENDENCY
export const GetCompDependency = gql`
  query GetCompDependency($compId: Uuid!, $sbomId: Uuid!) {
    component(id: $compId, sbomId: $sbomId) {
      id
      dependencyOf {
        id
        relType
        fromId
        toId
        fromComp {
          id
          name
          version
        }
        updatedAt
      }
      dependsOn {
        id
        relType
        fromId
        toId
        toComp {
          id
          name
          version
        }
        updatedAt
      }
    }
  }
`

// GET COMPONENT PATH TO ROOT
export const GetComponentPath = gql`
  query GetComponentPath($compId: Uuid!, $sbomId: Uuid!) {
    component(id: $compId, sbomId: $sbomId) {
      id
      pathToPrimary {
        depth
        path {
          id
          name
          version
        }
      }
    }
  }
`

// GET ALL COMPONENT DATA
export const GetAllComponents = gql`
  query GetSbom(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ComponentOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(
        sbomId: $sbomId
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
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
        }
      }
    }
  }
`

// GET COMPONENT FILTER DATA
export const GetCompFilterData = gql`
  query GetCompFilterData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      filters {
        ecosystems
        supplierNames
        kinds
        licenses
      }
    }
  }
`

// PRODUCT VULNERABILITIES DATA
export const GetVulnData = gql`
  query GetVulnData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $search: String
    $severity: [String!]
    $status: [String!]
    $componentName: [String!]
    $kev: Boolean
    $epss: RangeInput
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ComponentVulnOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      vulns(
        sbomId: $sbomId
        search: $search
        severity: $severity
        status: $status
        componentName: $componentName
        kev: $kev
        epss: $epss
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          id
          impact
          vuln {
            vulnId
            desc
            sev
            cvssScore
            cvssVector
            source
            publishedAt
            lastModifiedAt
            nvdAliasId
            updatedAt
            vulnInfo {
              cveId
              epssScore
              epssScores
              epssPercentile
              kev
            }
          }
          componentVulnLogs {
            id
            changedBy
            status
            justification
            impact
            note
            updatedAt
          }
          component {
            name
            version
          }
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

// GET VULNERABILITIES FILTER DATA
export const GetVulnFilterData = gql`
  query GetVulnFilterData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      filters {
        vulnCompNames
        vulnSeverities
        vulnStatuses
      }
    }
  }
`

// HEALTH CHECK RESULTES
export const GetCheckResults = gql`
  query GetCheckResults(
    $projectId: Uuid!
    $sbomId: Uuid!
    $category: [String!]
    $status: [String!]
    $severity: [String!]
    $search: String
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: CheckResultOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      checkResults(
        sbomId: $sbomId
        category: $category
        status: $status
        severity: $severity
        search: $search
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          id
          sbomId
          componentId
          primary
          status
          updatedAt
          component {
            id
            name
            version
            licenses
            licenseExp
          }
          organizationRule {
            severity
            action
            rule {
              shortDesc
              longDesc
              friendlyId
            }
          }
        }
      }
    }
  }
`

// GET HEALTH CHECK FILTER DATA
export const GetCheckFilterData = gql`
  query GetCheckFilterData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      filters {
        checkCategories
        checkCompNames
        checkSeverities
        checkStatuses
      }
    }
  }
`

// CHANGE LOG DATA
export const GetChangeLogs = gql`
  query GetChangeLogs(
    $projectId: Uuid!
    $sbomId: Uuid!
    $search: String
    $changedBy: [String!]
    $changeObject: [String!]
    $changeType: [String!]
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ActivityLogOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      activityLogs(
        sbomId: $sbomId
        search: $search
        changedBy: $changedBy
        changeObject: $changeObject
        changeType: $changeType
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          event
          action
          orig
          updated
          createdAt
          updatedAt
          changedBy
          loggablePrefix
          loggableType
        }
      }
    }
  }
`

// GET LOGS FILTER DATA
export const GetLogsFilterData = gql`
  query GetLogsFilterData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      filters {
        logChangeBys
        logChangeObjects
        logChangeTypes
      }
    }
  }
`

export const GetProject = gql`
  query GetProject($id: Uuid!) {
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
        creationAt
        primaryComponent {
          id
          name
          version
        }
      }
    }
  }
`

export const GetProjectCheck = gql`
  query GetProjectCheck(
    $id: Uuid!
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    project(id: $id) {
      id
      autoChecks(after: $after, before: $before, first: $first, last: $last) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          applicability
          attrName
          condition
          createdAt
          enabled
          lookup
          id
          setTo
          updatedAt
        }
      }
    }
  }
`

export const GetProjectLogs = gql`
  query GetProjectLogs(
    $id: Uuid!
    $search: String
    $changedBy: [String!]
    $changeType: [String!]
    $changeObject: [String!]
    $field: ActivityLogOrderByFields!
    $direction: OrderByDirection!
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    project(id: $id) {
      id
      activityLogs(
        projectId: $id
        search: $search
        changedBy: $changedBy
        changeType: $changeType
        changeObject: $changeObject
        orderBy: { field: $field, direction: $direction }
        after: $after
        before: $before
        first: $first
        last: $last
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          event
          action
          orig
          updated
          createdAt
          updatedAt
          changedBy
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
  query getSignedProjects($signedParams: String!) {
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
  query getProjectInfo($signedParams: String!, $projectId: Uuid!) {
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
      }
    }
  }
`

// ----------------------- PRODUCT DETAILS PAGE ---------------------------

// GET PRODUCT INFO
export const GetSignedProductData = gql`
  query GetSignedProductData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $signedParams: String!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId, signedParams: $signedParams) {
      id
      updatedAt
      primaryComponent {
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
      }
      stats {
        compCount
        compLicenseCount
        compCpeCount
        compPurlCount
        vulnStats
      }
      project {
        id
        name
      }
      lifecycle
      creationAt
      updatedAt
      licenses
      format
      tools {
        id
        name
        version
        vendor
        updatedAt
      }
      project {
        name
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
        url
        contactEmail
        contactName
      }
    }
  }
`

// GET COMPONENT DATA
export const GetSignedComponentData = gql`
  query GetSignedComponentData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $signedParams: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $search: String
    $licenses: [String!]
    $supplierName: [String!]
    $ecosystem: [String!]
    $kind: [String!]
    $internal: Boolean
    $primary: Boolean
    $field: ComponentOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId, signedParams: $signedParams) {
      id
      components(
        sbomId: $sbomId
        after: $after
        before: $before
        first: $first
        last: $last
        search: $search
        licenses: $licenses
        supplierName: $supplierName
        ecosystem: $ecosystem
        kind: $kind
        internal: $internal
        primary: $primary
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
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
          externalUrls {
            name
            url
          }
          suppliers {
            id
            name
            contactEmail
            contactName
            updatedAt
          }
        }
      }
    }
  }
`

// GET ALL COMPONENT DATA
export const GetSignedAllComponents = gql`
  query GetSbom(
    $projectId: Uuid!
    $sbomId: Uuid!
    $signedParams: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ComponentOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId, signedParams: $signedParams) {
      id
      components(
        sbomId: $sbomId
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          id
          name
        }
      }
    }
  }
`

// GET COMPONENT FILTER DATA
export const GetSignedCompFilterData = gql`
  query GetSignedCompFilterData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $signedParams: String!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId, signedParams: $signedParams) {
      id
      filters {
        ecosystems
        supplierNames
        kinds
        licenses
      }
    }
  }
`

// PRODUCT VULNERABILITIES DATA
export const GetSignedVulnData = gql`
  query GetVulnData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $signedParams: String!
    $search: String
    $severity: [String!]
    $componentName: [String!]
    $status: [String!]
    $kev: Boolean
    $epss: RangeInput
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ComponentVulnOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId, signedParams: $signedParams) {
      vulns(
        sbomId: $sbomId
        search: $search
        severity: $severity
        componentName: $componentName
        status: $status
        kev: $kev
        epss: $epss
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          id
          vuln {
            vulnId
            desc
            sev
            cvssScore
            cvssVector
            source
            publishedAt
            lastModifiedAt
            nvdAliasId
            updatedAt
            vulnInfo {
              cveId
              epssScore
              epssScores
              kev
            }
          }
          componentVulnLogs {
            id
            changedBy
            status
            justification
            note
            updatedAt
          }
          component {
            name
            version
          }
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

// GET VULNERABILITIES FILTER DATA
export const GetSignedVulnFilterData = gql`
  query GetVulnFilterData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $signedParams: String!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId, signedParams: $signedParams) {
      id
      filters {
        vulnCompNames
        vulnSeverities
        vulnStatuses
      }
    }
  }
`

// HEALTH CHECK RESULTES
export const GetSignedCheckResults = gql`
  query GetCheckResults(
    $projectId: Uuid!
    $sbomId: Uuid!
    $signedParams: String!
    $category: [String!]
    $status: [String!]
    $severity: [String!]
    $componentName: [String!]
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: CheckResultOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId, signedParams: $signedParams) {
      id
      checkResults(
        sbomId: $sbomId
        category: $category
        status: $status
        severity: $severity
        componentName: $componentName
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          id
          sbomId
          componentId
          primary
          status
          updatedAt
          component {
            id
            name
          }
          organizationRule {
            severity
            action
            rule {
              shortDesc
              longDesc
              friendlyId
            }
          }
        }
      }
    }
  }
`

// GET HEALTH CHECK FILTER DATA
export const GetSignedCheckFilterData = gql`
  query GetCheckFilterData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      filters {
        checkCategories
        checkSeverities
        checkStatuses
      }
    }
  }
`

// CHANGE LOG DATA
export const GetSignedChangeLogs = gql`
  query GetChangeLogs(
    $projectId: Uuid!
    $sbomId: Uuid!
    $search: String
    $changedBy: [String!]
    $changeObject: [String!]
    $changeType: [String!]
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ActivityLogOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      activityLogs(
        sbomId: $sbomId
        search: $search
        changedBy: $changedBy
        changeObject: $changeObject
        changeType: $changeType
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          event
          action
          orig
          updated
          createdAt
          updatedAt
          changedBy
          loggablePrefix
          loggableType
        }
      }
    }
  }
`

// GET LOGS FILTER DATA
export const GetSignedLogsFilterData = gql`
  query GetLogsFilterData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      filters {
        logChangeBys
        logChangeObjects
        logChangeTypes
      }
    }
  }
`

// CPE AUTOCOMPLETE
export const CpeAutoComplete = gql`
  query CpeAutoComplete($input: IdAutoCompletionInput!) {
    idAutoComplete(input: $input) {
      result
    }
  }
`

import { gql } from '@apollo/client'

// GET ORG NAME
export const GetOrgName = gql`
  query GetOrgName {
    organization {
      name
    }
  }
`

export const UserSettings = gql`
  query UserSettings {
    currentUserSettings {
      productDetailsOnboardingCompleted
      sbomDetailsOnboardingCompleted
    }
  }
`

// GET USERS
export const GetUsers = gql`
  query GetUsers($search: String) {
    organization {
      users(search: $search) {
        id
        name
        email
        role {
          id
          name
          permissions
        }
        createdAt
        invitationStatus
        invitationAcceptedAt
        profileImage {
          filename
          url
        }
      }
    }
  }
`

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
        superAdmin
        unconfirmedEmail
        profileImage {
          filename
          url
        }
        role {
          id
          name
        }
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
        role {
          id
          name
          permissions
        }
        createdAt
        invitationStatus
        invitationAcceptedAt
        profileImage {
          filename
          url
        }
      }
      organizationComponents {
        id
        matchStr
        updatedAt
      }
    }
  }
`

// GET USER PERMISSIONS
export const GetUserPermissions = gql`
  query GetUserPermissions {
    organization {
      id
      currentUser {
        id
        role {
          id
          permissionsMap {
            category
            description
            key
            name
            supersededBy
            value
            hidden
          }
        }
      }
    }
  }
`

// GET ALL PERMISSIONS
export const GetAllPermissions = gql`
  query GetAllPermissions {
    organization {
      organizationRoles {
        id
        name
        permissionsMap {
          category
          hidden
          description
          key
          name
          supersededBy
          value
        }
      }
    }
  }
`

// GET ORG ROLES
export const GetRoles = gql`
  query GetRoles {
    organization {
      currentUser {
        role {
          name
        }
      }
      organizationRoles {
        id
        name
        createdAt
      }
    }
  }
`

// GET ORGANIZATION METRICS
export const GetOrgMetrics = gql`
  query GetOrgMetrics($env: String) {
    organizationMetric(envName: $env) {
      projectCount
      versionCount
      componentCount
      vulnsMetric
      latestImports {
        event
        updated
        changedBy
      }
      latestVulns {
        vulnId
        desc
      }
      latestVersions {
        id
        createdAt
        creationAt
        updatedAt
        projectId
        projectVersion
        project {
          id
          name
          sboms {
            id
          }
          projectGroup {
            id
            name
            defaultProject {
              id
              name
            }
          }
        }
        primaryComponent {
          id
          name
          version
        }
        stats {
          compCount
          compLicenseCount
          vulnStats
        }
      }
      latestProjects {
        id
        name
        updatedAt
        sboms {
          id
          primaryComponent {
            name
            version
          }
          stats {
            compCount
            compLicenseCount
            vulnStats
          }
        }
      }
      latestActivity {
        event
        updatedAt
        changedBy
        action
        orig
        updated
      }
    }
  }
`

// LIST CURRENT USER'S ORGANIZATIONS
export const MyOrganizations = gql`
  query MyOrganizations(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $invitationStatuses: [OrgUserInvitationStatuses!]
  ) {
    myOrganizations(
      first: $first
      last: $last
      after: $after
      before: $before
      invitationStatuses: $invitationStatuses
    ) {
      nodes {
        id
        name
        email
        status
        updatedAt
        invitationStatus
        url
      }
    }
  }
`

// LIST CURRENT USER'S ORGANIZATIONS
export const AllOrganizations = gql`
  query AllOrganizations(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $status: OrganizationStatusEnum
  ) {
    allOrganizations(
      first: $first
      last: $last
      after: $after
      before: $before
      status: $status
    ) {
      nodes {
        id
        name
        email
        status
        updatedAt
        url
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
  query GetOrgSettings {
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

export const GetProductNames = gql`
  query GetProductNames(
    $enabled: Boolean
    $first: Int
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      projectGroups(
        enabled: $enabled
        first: $first
        orderBy: { field: $field, direction: $direction }
      ) {
        nodes {
          id
          name
        }
      }
    }
  }
`

export const GetProductTable = gql`
  query GetProjectTable(
    $search: String
    $enabled: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      id
      projectGroups(
        search: $search
        enabled: $enabled
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
          enabled
          sbomsCount
          defaultProject {
            id
          }
          projects {
            id
            name
          }
          description
          updatedAt
        }
      }
    }
  }
`

// GET PROJECT GROUPS
export const GetProjectGroups = gql`
  query GetProjectGroups(
    $search: String
    $enabled: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      projectGroups(
        search: $search
        enabled: $enabled
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
          enabled
          defaultProject {
            id
            name
            description
            updatedAt
            enabled
            sboms {
              id
              format
              createdAt
              creationAt
              updatedAt
              primaryComponent {
                id
                name
                version
              }
            }
          }
          projects {
            id
            name
            description
            updatedAt
            enabled
            projectGroup {
              id
              name
            }
            sboms {
              id
              format
              creationAt
              createdAt
              updatedAt
              projectVersion
              primaryComponent {
                id
                name
                version
              }
            }
          }
          description
          enabled
          updatedAt
        }
      }
    }
  }
`

// GET PROJECT SETTINGS
export const GetProjectSettings = gql`
  query GetProjectSettings($id: Uuid!) {
    project(id: $id) {
      id
      name
      projectSetting {
        id
        checksEnabled
        automatedFixesEnabled
        dataRetentionDays
        internalCompMatchingEnabled
        vulnScanningEnabled
        copyVexFromPrevious
        jiraProject
        organizationManufacturer {
          id
          organizationName
        }
      }
    }
  }
`

export const GetDefaultJiraProduct = gql`
  query GetProjectSettings($id: Uuid!) {
    project(id: $id) {
      id
      projectSetting {
        id
        jiraProject
      }
    }
  }
`

// GET ACTIVE PROJECT GROUP
export const GetProjectGroup = gql`
  query GetProjectGroup($id: Uuid!) {
    projectGroup(id: $id) {
      description
      enabled
      id
      name
      organizationId
      updatedAt
      defaultProject {
        description
        enabled
        id
        name
        projectGroupId
        updatedAt
      }
      projects {
        description
        enabled
        id
        name
        projectGroupId
        updatedAt
        sboms {
          id
          format
          creationAt
          updatedAt
          projectVersion
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

// GET ACTIVCE PROJECT GROUP FOR PUBLIC VIEW
export const ShareLynkProjectGroup = gql`
  query ShareLynkProjectGroup($id: Uuid!) {
    shareLynkQuery {
      projectGroup(id: $id) {
        description
        enabled
        id
        name
        organizationId
        updatedAt
        defaultProject {
          description
          enabled
          id
          name
          projectGroupId
          updatedAt
        }
        projects {
          description
          enabled
          id
          name
          projectGroupId
          updatedAt
        }
      }
    }
  }
`

// GET GLOBAL VULNERABILITIES
export const GetGlobalVulns = gql`
  query GetGlobalVulns(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $search: String
    $severity: [String!]
    $projectNames: [String!]
    $projectIds: [Uuid!]
    $projectGroupIds: [Uuid!]
    $status: [String!]
    $kev: Boolean
    $epss: RangeInput
    $field: VulnOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      vulns(
        after: $after
        first: $first
        before: $before
        last: $last
        search: $search
        projectNames: $projectNames
        projectGroupIds: $projectGroupIds
        status: $status
        severity: $severity
        kev: $kev
        epss: $epss
        orderBy: { field: $field, direction: $direction }
        projectIds: $projectIds
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        nodes {
          cvssScore
          cvssVector
          desc
          id
          lastModifiedAt
          nvdAliasId
          organizationId
          publishedAt
          sev
          source
          updatedAt
          vulnId
          metrics {
            affectedCount
            fixedCount
            inTriageCount
            notAffectedCount
            unspecifiedCount
          }
          vulnInfo {
            cveId
            epssPercentile
            epssScore
            epssScores
            id
            kev
            updatedAt
          }
        }
      }
    }
  }
`

// GET SINGLE GLOBAL VULNERABILITIES
export const GetGlobalVulnData = gql`
  query GetGlobalVulnData($id: Uuid!) {
    vuln(id: $id) {
      id
      desc
      vulnId
      source
      updatedAt
      cvssScore
      cvssVector
      publishedAt
      lastModifiedAt
      vulnInfo {
        id
        kev
        epssScore
      }
      organization {
        projectGroups {
          nodes {
            name
          }
        }
      }
      componentCount
      projectGroupsCount
      sbomVersions
      sbomVersionsCount
    }
  }
`

// GET COMP VULN DATA
export const GetCompVulnData = gql`
  query GetCompVulnData(
    $id: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $search: String
    $vexComplete: Boolean
    $projectIds: [Uuid!]
    $projectGroupIds: [Uuid!]
    $projectNames: [String!]
    $versions: [String!]
    $statuses: [String!]
  ) {
    componentVulns(
      vulnId: $id
      after: $after
      first: $first
      before: $before
      last: $last
      search: $search
      projectIds: $projectIds
      projectGroupIds: $projectGroupIds
      projectNames: $projectNames
      sbomVersions: $versions
      status: $statuses
      vexComplete: $vexComplete
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        vulnId
        updatedAt
        isComplete
        vexStatus {
          id
          name
        }
        component {
          id
          name
          version
          group
          kind
          sbom {
            id
            createdAt
            creationAt
            updatedAt
            projectVersion
            hasConnectedSboms
            project {
              id
              name
              projectGroup {
                id
                name
              }
            }
            primaryComponent {
              id
              name
              version
            }
          }
        }
      }
    }
  }
`

// GET ALL CONNECTED SBOMS
export const GetConnectedSbom = gql`
  query GetConnectedSbom(
    $projectId: Uuid!
    $sbomId: Uuid!
    $componentVulnId: Uuid!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      connectedSboms {
        projectVersion
        project {
          name
          projectGroup {
            name
          }
        }
        parentDispositionFrom(componentVulnId: $componentVulnId) {
          id
          vexStatus {
            name
          }
        }
      }
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

// ----------------------- PRODUCT DETAILS PAGE ---------------------------

// GET PRODUCT VERSION
export const GetVersionsTable = gql`
  query GetVersionsTable(
    $id: Uuid!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $search: String
    $field: SbomOrderByFields!
    $direction: OrderByDirection!
  ) {
    project(id: $id) {
      id
      sbomVersions(
        first: $first
        after: $after
        last: $last
        before: $before
        search: $search
        orderBy: { direction: $direction, field: $field }
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
          creationAt
          updatedAt
          lifecycle
          projectVersion
          vulnRunStatus
          stats {
            compCount
            compLicenseCount
            vulnStats
          }
        }
      }
    }
  }
`

// GET VERSION CREATE DATE
export const GetVersionsDate = gql`
  query GetVersionsDate(
    $id: Uuid!
    $first: Int
    $field: SbomOrderByFields!
    $direction: OrderByDirection!
  ) {
    project(id: $id) {
      id
      sbomVersions(
        first: $first
        orderBy: { direction: $direction, field: $field }
      ) {
        nodes {
          creationAt
        }
      }
    }
  }
`

// GET ALL PRIMARY VERSIONS
export const GetAllSboms = gql`
  query GetAllSboms($id: Uuid!) {
    project(id: $id) {
      sboms {
        projectVersion
      }
    }
  }
`

// GET SBOM VERSIONS
export const GetSbomVersions = gql`
  query GetSbomVersions(
    $id: Uuid!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $field: SbomOrderByFields!
    $direction: OrderByDirection!
  ) {
    project(id: $id) {
      sbomVersions(
        first: $first
        after: $after
        last: $last
        before: $before
        orderBy: { direction: $direction, field: $field }
      ) {
        nodes {
          id
          creationAt
          projectVersion
          project {
            name
            projectGroup {
              name
            }
          }
          licensesExp
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
    }
  }
`

// GET SBOM ALTERNATIVES
export const GetSbomAlternatives = gql`
  query GetSbomAlternatives($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      projectVersion
      alternatives {
        id
        creationAt
        updatedAt
        lifecycle
        projectVersion
        stats {
          compCount
          compLicenseCount
          vulnStats
        }
      }
    }
  }
`

// GET SHARED PRODUCT VERSION
export const ShareVersionTable = gql`
  query ShareVersionTable(
    $id: Uuid!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $search: String
    $field: SbomOrderByFields!
    $direction: OrderByDirection!
  ) {
    shareLynkQuery {
      project(id: $id) {
        sbomVersions(
          first: $first
          after: $after
          last: $last
          before: $before
          search: $search
          orderBy: { direction: $direction, field: $field }
        ) {
          totalCount
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
          nodes {
            id
            creationAt
            updatedAt
            lifecycle
            projectVersion
            stats {
              compCount
              compLicenseCount
              vulnStats
            }
          }
        }
      }
    }
  }
`

// GET SHARED SBOM VERSIONS
export const GetShareSbomVersions = gql`
  query GetShareSbomVersions($id: Uuid!) {
    shareLynkQuery {
      project(id: $id) {
        sbomVersions {
          nodes {
            id
            creationAt
            projectVersion
            project {
              name
              projectGroup {
                name
              }
            }
            licensesExp
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
      }
    }
  }
`

// GET SBOM ALTERNATIVES
export const GetShareSbomAlternatives = gql`
  query GetShareSbomAlternatives($sbomId: Uuid!) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        projectVersion
        alternatives {
          id
          creationAt
          updatedAt
          lifecycle
          projectVersion
          stats {
            compCount
            compLicenseCount
            vulnStats
          }
        }
      }
    }
  }
`

// GET PRODUCT INFO
export const GetProductData = gql`
  query GetProductData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      updatedAt
      vulnRunStatus
      projectVersion
      sbomParts {
        id
      }
      policyResultMetrics {
        skippedCount
        failedCount
        errorCount
        passedCount
        informCount
        warnCount
      }
      primaryComponent {
        id
        name
        version
        primary
        internal
        purl
        cpes
        licensesExp
        updatedAt
        uniqueId
        kind
        copyright
        publisher
        description
        licensesExp
        group
        scope
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
        projectGroup {
          id
          name
        }
      }
      lifecycle
      createdAt
      creationAt
      updatedAt
      licensesExp
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

// GET SHARE PRODUCT INFO
export const ShareProductData = gql`
  query ShareProductData($sbomId: Uuid!) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        id
        updatedAt
        projectVersion
        primaryComponent {
          id
          name
          version
          primary
          internal
          purl
          cpes
          licensesExp
          updatedAt
          uniqueId
          kind
          copyright
          publisher
          description
          licensesExp
          group
          scope
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
          projectGroup {
            id
            name
          }
        }
        lifecycle
        createdAt
        creationAt
        updatedAt
        licensesExp
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
    $direct: Boolean
    $includeParts: Boolean
    $orderBy: ComponentOrderByInput
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
        direct: $direct
        orderBy: $orderBy
        includeParts: $includeParts
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
          updatedAt
          uniqueId
          kind
          copyright
          publisher
          description
          licensesExp
          group
          scope
          externalUrls {
            name
            url
          }
          suppliers {
            id
            name
            url
            contactEmail
            contactName
          }
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
    }
  }
`

// GET TOTAL COMPONENTS
export const GetTotalComponents = gql`
  query GetTotalComponents(
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
      }
    }
  }
`

// GET PRIMARY COMPONENT DATA
export const GetPrimaryComponent = gql`
  query GetPrimaryComponent(
    $projectId: Uuid!
    $sbomId: Uuid!
    $primary: Boolean
    $field: ComponentOrderByFields!
    $direction: OrderByDirection!
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(
        sbomId: $sbomId
        primary: $primary
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        nodes {
          id
        }
      }
    }
  }
`

export const GetSharPrimartComp = gql`
  query ShareComponentData(
    $sbomId: Uuid!
    $primary: Boolean
    $field: ComponentOrderByFields!
    $direction: OrderByDirection!
  ) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        id
        components(
          sbomId: $sbomId
          primary: $primary
          orderBy: { field: $field, direction: $direction }
        ) {
          totalCount
          nodes {
            id
          }
        }
      }
    }
  }
`

export const ShareComponentData = gql`
  query ShareComponentData(
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
    $direct: Boolean
    $field: ComponentOrderByFields!
    $direction: OrderByDirection!
  ) {
    shareLynkQuery {
      sbom(id: $sbomId) {
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
          direct: $direct
          orderBy: { field: $field, direction: $direction }
        ) {
          totalCount
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
          nodes {
            id
            name
            version
            primary
            internal
            purl
            cpes
            updatedAt
            uniqueId
            kind
            copyright
            publisher
            description
            licensesExp
            group
            scope
            externalUrls {
              name
              url
            }
            suppliers {
              id
              name
              url
              contactEmail
              contactName
            }
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
      }
    }
  }
`

// GET COMPONENT DEPENDENCY
export const GetCompDependency = gql`
  query GetCompDependency($compId: Uuid!, $sbomId: Uuid!) {
    component(id: $compId, sbomId: $sbomId) {
      id
      name
      version
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

// GET SHARED COMPONENT DEPENDENCY
export const GetShareCompDependency = gql`
  query GetShareCompDependency($compId: Uuid!) {
    shareLynkQuery {
      component(id: $compId) {
        id
        name
        version
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
  query GetAllComponents(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(
        sbomId: $sbomId
        after: $after
        before: $before
        first: $first
        last: $last
      ) {
        nodes {
          id
          name
          version
        }
      }
    }
  }
`
// GET ALL VUNERABILITIES
export const GetAllVulnerabilities = gql`
  query GetVulnData(
    $projectId: Uuid!
    $sbomId: Uuid!
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
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
      }
    }
  }
`

// GET ALL SHARE COMPONENTS
export const AllShareComponents = gql`
  query AllShareComponents(
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        components(
          sbomId: $sbomId
          after: $after
          before: $before
          first: $first
          last: $last
        ) {
          nodes {
            name
            version
          }
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

// GET SHARE COMPONENT FILTER DATA =
export const ShareCompFilters = gql`
  query ShareCompFilters($sbomId: Uuid!) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        filters {
          ecosystems
          supplierNames
          kinds
          licenses
        }
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
    $source: SbomVulnSourceEnum
    $kev: Boolean
    $epss: RangeInput
    $direct: Boolean
    $vexComplete: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ComponentVulnOrderByFields!
    $direction: OrderByDirection!
    $includeRetracted: Boolean
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      vulns(
        sbomId: $sbomId
        search: $search
        severity: $severity
        status: $status
        componentName: $componentName
        vulnerabilitySource: $source
        kev: $kev
        epss: $epss
        direct: $direct
        vexComplete: $vexComplete
        after: $after
        before: $before
        first: $first
        last: $last
        orderBy: { field: $field, direction: $direction }
        includeRetracted: $includeRetracted
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
          isPart
          isComplete
          fixedVersions
          lastAffectedVersions
          isFirstDegreePart
          cdxResponseId
          impact
          note
          detail
          actionStmt
          fixedIn
          externalUrls {
            name
            url
          }
          currentExternalUrls {
            name
            url
          }
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
            detail
            response
            actionStmt
            fixedIn
            updatedAt
          }
          component {
            name
            version
            group
            kind
            sbom {
              id
              createdAt
              projectVersion
              project {
                projectGroup {
                  id
                  name
                }
              }
              primaryComponent {
                name
                version
              }
            }
          }
          vexStatus {
            id
            name
          }
          vexJustification {
            id
            name
          }
          cdxResponse {
            id
            name
          }
        }
      }
    }
  }
`
// SHARE VULNERABILITIES DATA
export const ShareVulnData = gql`
  query ShareVulnData(
    $sbomId: Uuid!
    $search: String
    $severity: [String!]
    $status: [String!]
    $componentName: [String!]
    $source: SbomVulnSourceEnum
    $kev: Boolean
    $epss: RangeInput
    $direct: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ComponentVulnOrderByFields!
    $direction: OrderByDirection!
    $vexComplete: Boolean
    $includeRetracted: Boolean
  ) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        vulns(
          sbomId: $sbomId
          search: $search
          severity: $severity
          status: $status
          componentName: $componentName
          vulnerabilitySource: $source
          kev: $kev
          epss: $epss
          direct: $direct
          after: $after
          before: $before
          first: $first
          last: $last
          orderBy: { field: $field, direction: $direction }
          vexComplete: $vexComplete
          includeRetracted: $includeRetracted
        ) {
          totalCount
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
          nodes {
            id
            impact
            isPart
            isFirstDegreePart
            cdxResponseId
            externalUrls {
              name
              url
            }
            currentExternalUrls {
              name
              url
            }
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
              detail
              response
              actionStmt
              fixedIn
              updatedAt
            }
            component {
              name
              version
              sbom {
                id
                createdAt
                projectVersion
                project {
                  projectGroup {
                    name
                  }
                }
                primaryComponent {
                  name
                  version
                }
              }
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

// GET SHARE VULN FILTER DATA
export const ShareVulnFilters = gql`
  query ShareVulnFilters($sbomId: Uuid!) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        filters {
          vulnCompNames
          vulnSeverities
          vulnStatuses
        }
      }
    }
  }
`

// HEALTH CHECK RESULTES
export const GetCheckResults = gql`
  query GetCheckResults(
    $projectId: Uuid!
    $sbomId: Uuid!
    $checkId: [String!]
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
        checkId: $checkId
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
          sbom {
            spec
            licensesExp
            authors {
              name
              email
              updatedAt
            }
            suppliers {
              name
              url
              contactEmail
              contactName
            }
          }
          componentId
          primary
          status
          updatedAt
          component {
            id
            name
            version
            licensesExp
            primary
            internal
            group
            kind
            purl
            cpes
            suppliers {
              name
              url
              contactEmail
              contactName
            }
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
          copiedFromId
        }
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
        createdAt
        creationAt
        projectVersion
        primaryComponent {
          id
          name
          version
        }
      }
    }
  }
`

// GET SHARE PROJECT
export const ShareProject = gql`
  query ShareProject($id: Uuid!) {
    shareLynkQuery {
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
          createdAt
          creationAt
          projectVersion
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

// GET PROJECT AUTOMATIONS
export const GetProjectCheck = gql`
  query GetProjectCheck(
    $id: Uuid!
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    project(id: $id) {
      automationRules(
        after: $after
        before: $before
        first: $first
        last: $last
      ) {
        totalCount
        nodes {
          active
          createdAt
          description
          id
          name
          projectId
          updatedAt
          isSystem
          priority
          automationActions {
            id
            field
            subject
            value
            automationRuleId
            operator
          }
          automationConditions {
            automationRuleId
            createdAt
            field
            operator
            value
            id
            subject
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`

// GET AUTOMATION MAPPING
export const AutomationConditionSubjectFieldMapping = gql`
  query AutomationConditionSubjectFieldMapping {
    automationConditionSubjectFieldMapping {
      key
      name
      operators
      subject
    }
  }
`

// GET PROJECT LOGS
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

// GET ACTIVITY LOG FILTERS
export const GetLogFilters = gql`
  query GetLogFilters($id: Uuid!) {
    project(id: $id) {
      activityLogFilters {
        logChangeBys
        logChangeObjects
        logChangeTypes
      }
    }
  }
`

// GET ACTIVITY LOG FILTERS
export const GetSbomLogFilters = gql`
  query GetSbomLogFilters($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      activityLogFilters {
        logChangeBys
        logChangeObjects
        logChangeTypes
      }
    }
  }
`
// DOWNLOAD SBOM FROM VENDOR SITE
export const DownloadSBOM = gql`
  query downloadSbom(
    $projectId: Uuid!
    $sbomId: Uuid!
    $includeVulns: Boolean
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      download(sbomId: $sbomId, includeVulns: $includeVulns)
    }
  }
`

// DOWNLOAD SBOM FROM PUBLIC SITE
export const SignedSbomDownload = gql`
  query SignedSbomDownload($sbomId: Uuid!, $includeVulns: Boolean) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        download(sbomId: $sbomId, includeVulns: $includeVulns)
      }
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
export const ShareLynkProjectGroups = gql`
  query ShareLynkProjectGroups(
    $search: String
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ShareLynkProjectGroupOrderByFields!
    $direction: OrderByDirection!
  ) {
    shareLynkQuery {
      projectGroups(
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
          hasPreviousPage
          startCursor
        }
        nodes {
          id
          name
          enabled
          defaultProject {
            id
          }
          projects {
            id
            name
            description
            updatedAt
            enabled
            sboms {
              id
            }
          }
          description
          enabled
          updatedAt
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
        licensesExp
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
          licensesExp
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
  query GetSignedVulnData(
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

// CPE AUTOCOMPLETE
export const CpeAutoComplete = gql`
  query CpeAutoComplete($input: IdAutoCompletionInput!) {
    idAutoComplete(input: $input) {
      result
    }
  }
`

export const LicenseAutoComplete = gql`
  query LicenseAutoComplete($search: String!) {
    licenseAutoComplete(search: $search) {
      result {
        type
        value
      }
    }
  }
`

// GET CDX RESPONSE
export const GetCdxResponses = gql`
  query GetCdxResponses {
    cdxResponses {
      id
      name
    }
  }
`

// GET SBOM PARTS
export const GetSbomParts = gql`
  query GetSbomParts($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      sbomParts {
        id
        partId
        part {
          id
          lifecycle
          createdAt
          creationAt
          projectVersion
          vulnRunStatus
          project {
            id
            name
            projectGroup {
              id
              name
            }
          }
          stats {
            compCount
            compLicenseCount
            vulnStats
          }
          primaryComponent {
            id
            name
            version
            purl
            cpes
          }
          suppliers {
            id
            name
            contactEmail
            contactName
          }
        }
      }
    }
  }
`

// CHECK EXISTING SBOM PARTS
export const CheckDeepParts = gql`
  query CheckDeepParts($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(sbomId: $sbomId, projectId: $projectId) {
      deepParts {
        id
        project {
          projectGroup {
            name
          }
        }
      }
    }
  }
`

// GET ALL FIRST DEGREE PART VULNS
export const FirstDegreePartVulns = gql`
  query FirstDegreePartVulns($sbomIds: [Uuid!]!, $componentVulnIds: [Uuid!]!) {
    sbomsCompVuln(sbomIds: $sbomIds, componentVulnIds: $componentVulnIds) {
      component {
        id
      }
      componentVulnLogs {
        id
        changedBy
        status
        justification
        note
        updatedAt
      }
      vuln {
        id
      }
    }
  }
`

// GET ALL SHARELYNKS
export const GetSharelynks = gql`
  query GetSharelynks(
    $ids: [Uuid!]
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    shareLynks(
      projectGroupIds: $ids
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      totalCount
      nodes {
        enabled
        id
        signedUrlParams
        updatedAt
        contents {
          ... on ProjectGroup {
            id
            name
            defaultProject {
              id
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`

// GET DATA FOR LICENSE TABLE

export const GetLicensesTable = gql`
  query GetLicensesTable(
    $direction: OrderByDirection!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: [String!]
    $search: String
    $licenseType: [String!]
  ) {
    organization {
      licenses(
        first: $first
        last: $last
        after: $after
        before: $before
        status: $status
        search: $search
        licenseType: $licenseType
        orderBy: { direction: $direction, field: ORGANIZATION_LICENSES_STATE }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        nodes {
          id
          state
          attribution
          attributionKeys
          copyLeft
          sourceDistribution
          modifications
          warranty
          governingLaws
          deprecated
          restrictive
          osiApproved
          fsfLibre
          createdAt
          updatedAt
          content {
            __typename
            ... on License {
              id
              name
              shortId
              text
              comment
              url
            }
            ... on LicenseCustom {
              id
              name
              text
              url
              comment
              spdxId
            }
          }
          __typename
        }
      }
    }
  }
`

// GET DATA FOR SBOM LICENSE TABLE
export const GetSbomLicensesTable = gql`
  query GetSbomLicenseTable(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      componentLicenses(
        first: $first
        last: $last
        after: $after
        before: $before
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        nodes {
          licenseExpression
          licenses {
            __typename
            state
          }
          components {
            name
            version
          }
          derivedState
        }
      }
    }
  }
`

// GET DATA FOR PUBLIC LINCESE TABLE
export const GetShareLicensesTable = gql`
  query GetShareLicensesTable(
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        componentLicenses(
          first: $first
          last: $last
          after: $after
          before: $before
        ) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
          }
          nodes {
            licenseExpression
            components {
              name
            }
          }
        }
      }
    }
  }
`

// GET SBOM DRIFT
export const GetSbomDrift = gql`
  query GetSbomDrift(
    $subjectSbomId: Uuid!
    $projectId: Uuid!
    $targetSbomId: Uuid!
  ) {
    sbom(projectId: $projectId, sbomId: $subjectSbomId) {
      id
      spec
      sbomDrift(targetSbomId: $targetSbomId) {
        subjectComponentId
        subjectComponent {
          name
          version
          purl
          cpes
          licensesExp
        }
        targetComponentId
        targetComponent {
          name
          version
          purl
          cpes
          licensesExp
        }
        diffTags
        diffType
      }
    }
  }
`

// GET PROJECT GROUPS FOR SBOM DRIFT
export const GetProductsForSbomDrift = gql`
  query GetProductsForSbomDrift(
    $enabled: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      projectGroups(
        enabled: $enabled
        first: $first
        last: $last
        after: $after
        before: $before
        orderBy: { field: $field, direction: $direction }
      ) {
        nodes {
          id
          name
          projects {
            id
            name
          }
        }
      }
    }
  }
`

// GET SBOM SUPPORT INFO
export const GetSbomSupportTab = gql`
  query GetSbomSupportTab($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      supports {
        nodes {
          ... on ComponentSupport {
            id
            productName
            productVersion
            idUri
            deprecated
            outdated
            eos
            eol
            createdAt
            updatedAt
          }
          ... on ComponentSupportOverride {
            id
            enabled
            productName
            productVersion
            idUri
            deprecated
            outdated
            eos
            eol
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`

// GET SUPPORT INFO
export const GetSupportTab = gql`
  query GetSupportTab(
    $globalSearch: String
    $search: String
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ComponentSupportOverrideOrderByFields!
    $direction: OrderByDirection!
  ) {
    supports(
      globalSearch: $globalSearch
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
        hasPreviousPage
        startCursor
      }
      nodes {
        ... on ComponentSupport {
          id
          idUri
          productName
          productVersion
          deprecated
          outdated
          eol
          eos
          createdAt
          updatedAt
        }
        ... on ComponentSupportOverride {
          id
          idUri
          productName
          productVersion
          enabled
          deprecated
          outdated
          eol
          eos
          createdAt
          updatedAt
        }
      }
    }
  }
`

// GET POLICIES
export const GetPolicies = gql`
  query GetPolicies(
    $search: String
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    policies(
      search: $search
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      totalCount
      nodes {
        createdAt
        id
        isEnabled
        name
        description
        operator
        resultType
        updatedAt
        excludeInternalComponent
        excludePrimaryComponent
        policyRules {
          id
          operator
          policyId
          subject
          updatedAt
          value
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`

export const GetRequests = gql`
  query GetRequests(
    $search: String
    $after: String
    $before: String
    $first: Int
    $last: Int
    $status: [String!]
    $product: [String!]
    $email: [String!]
    $field: RequestOrderByFields!
    $direction: OrderByDirection!
  ) {
    requests(
      search: $search
      status: $status
      product: $product
      email: $email
      after: $after
      before: $before
      first: $first
      last: $last
      orderBy: { field: $field, direction: $direction }
    ) {
      totalCount
      nodes {
        id
        email
        productName
        productVersion
        requestedAt
        uploadedAt
        status
        blob
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`

export const GetProductNamesForRequest = gql`
  query GetProductNamesForRequest {
    organization {
      projectGroups(enabled: true) {
        nodes {
          id
          name
          projects {
            id
            name
          }
        }
      }
    }
  }
`

// GET POLICY SUBJECTS
export const PolicySubjectOperators = gql`
  query PolicySubjectOperators {
    policySubjectOperatorMapping {
      category
      name
      operators
      subject
    }
  }
`

// GET PROJECT POLICIES
export const GetProjectPolicies = gql`
  query GetProjectPolicies(
    $projectId: Uuid!
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    projectPolicies(
      projectId: $projectId
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      totalCount
      nodes {
        createdAt
        id
        isExcluded
        name
        description
        operator
        organizationId
        resultType
        updatedAt
        policyRules {
          id
          operator
          policyId
          subject
          updatedAt
          value
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`

// GET SBOM POLICIES
export const PolicyResults = gql`
  query PolicyResults(
    $sbomId: Uuid!
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    policyResults(
      sbomId: [$sbomId]
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        policyRuleViolations {
          totalCount
        }
        createdAt
        updatedAt
        result
        resultType
        resultWording
        policy {
          name
          description
          policyRules {
            id
            name
            category
            subject
            operator
            operatorWording
            value
            policyRuleViolations(sbomId: $sbomId) {
              totalCount
            }
          }
        }
      }
    }
  }
`

// GET POLICY RESULT TYPE
export const PolicyResultsType = gql`
  query PolicyResultsType($sbomId: Uuid!, $first: Int) {
    policyResults(sbomId: [$sbomId], first: $first) {
      nodes {
        result
      }
    }
  }
`

// GET POLICY RULE VIOLATIONS
export const PolicyRuleViolations = gql`
  query PolicyRuleViolations(
    $sbomId: Uuid
    $policyRuleId: Uuid
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    policyRuleViolations(
      sbomId: $sbomId
      policyRuleId: $policyRuleId
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        violationType
        component {
          name
          version
          licensesExp
        }
        violation {
          ... on ComponentVuln {
            id
            vuln {
              id
              vulnId
            }
          }
          ... on Sbom {
            project {
              projectGroup {
                name
              }
            }
            primaryComponent {
              name
              version
            }
            suppliers {
              contactEmail
              contactName
              name
              url
            }
            authors {
              email
              name
              phone
            }
            projectVersion
          }
          ... on SbomComponent {
            primary
            version
            name
          }
        }
      }
    }
  }
`

// GET USER NOTIFICATIONS PREFRENCES
export const GetUserNotificationPreferences = gql`
  query GetUserNotificationPreferences($envId: Uuid!) {
    notificationPreferences(envId: $envId)
  }
`

export const GetUserNotificationChannels = gql`
  query GetUserNotificationChannels {
    notificationChannels {
      email
      slack
      teams
    }
  }
`

export const GetUserNotificationConfigs = gql`
  query GetUserNotificationConfigs {
    notificationConfigs {
      slackWebhookUrl
      teamsWebhookUrl
    }
  }
`

export const ComponentVulnLogs = gql`
  query ComponentVulnLogs($vexLogableId: Uuid!) {
    componentVulnLogs(vexLogableId: $vexLogableId) {
      actionStmt
      changedBy
      detail
      fixedIn
      id
      impact
      justification
      note
      response
      status
      updatedAt
    }
  }
`

export const ShareCompVulnLogs = gql`
  query ShareCompVulnLogs($vexLogableId: Uuid!) {
    componentVulnLogs(vexLogableId: $vexLogableId) {
      actionStmt
      changedBy
      detail
      fixedIn
      id
      impact
      justification
      response
      status
      updatedAt
    }
  }
`

export const GetOrgMfc = gql`
  query GetOrgMfc($after: String, $before: String, $first: Int, $last: Int) {
    organizationManufacturers(
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      nodes {
        id
        organizationName
      }
    }
  }
`

export const GetSbomName = gql`
  query GetSbomName($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      projectVersion
      primaryComponent {
        name
        version
      }
      project {
        id
        name
        projectGroup {
          id
          name
        }
      }
    }
  }
`

export const GetSharedSbomData = gql`
  query GetSharedSbomData($sbomId: Uuid!) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        id
        projectVersion
        project {
          id
          name
          projectGroup {
            id
            name
          }
        }
      }
    }
  }
`

export const GetOrgManufacturers = gql`
  query GetOrgManufacturers(
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    organizationManufacturers(
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        url
        organizationName
        updatedAt
        createdAt
        organizationContacts {
          id
          name
          phone
          email
        }
      }
    }
  }
`

export const IntersectingVulns = gql`
  query IntersectingVulns($fromSbomId: Uuid!, $toSbomId: Uuid!) {
    intersectingVulns(fromSbomId: $fromSbomId, toSbomId: $toSbomId) {
      fromVuln {
        id
        vuln {
          vulnId
        }
        vexStatus {
          name
        }
      }
      toVuln {
        id
        component {
          name
          version
        }
        vuln {
          vulnId
          source
          sev
        }
        vexStatus {
          name
        }
      }
    }
  }
`

export const CompareQueryCustomer = gql`
  query GetSharedSbomDrift($subjectSbomId: Uuid!, $targetSbomId: Uuid!) {
    shareLynkQuery {
      diffs: sbom(id: $subjectSbomId) {
        id
        spec
        sbomDrift(targetSbomId: $targetSbomId) {
          subjectComponentId
          subjectComponent {
            name
            version
            purl
            cpes
            licensesExp
          }
          targetComponentId
          targetComponent {
            name
            version
            purl
            cpes
            licensesExp
          }
          diffTags
          diffType
        }
      }
      sbomTwo: sbom(id: $targetSbomId) {
        id
        creationAt
        projectVersion
        project {
          name
          projectGroup {
            name
          }
        }
        licensesExp
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
      sbomOne: sbom(id: $subjectSbomId) {
        id
        creationAt
        projectVersion
        project {
          name
          projectGroup {
            name
          }
        }
        licensesExp
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
  }
`
export const CompareQueryVendor = gql`
  query GetSbomDrift(
    $subjectSbomId: Uuid!
    $projectId: Uuid!
    $targetSbomId: Uuid!
  ) {
    diffs: sbom(projectId: $projectId, sbomId: $subjectSbomId) {
      id
      spec
      sbomDrift(targetSbomId: $targetSbomId) {
        subjectComponentId
        subjectComponent {
          name
          version
          purl
          cpes
          licensesExp
        }
        targetComponentId
        targetComponent {
          name
          version
          purl
          cpes
          licensesExp
        }
        diffTags
        diffType
      }
    }
    sbomTwo: sbom(projectId: $projectId, sbomId: $targetSbomId) {
      id
      creationAt
      projectVersion
      project {
        name
        projectGroup {
          name
        }
      }
      licensesExp
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
    sbomOne: sbom(projectId: $projectId, sbomId: $subjectSbomId) {
      id
      creationAt
      projectVersion
      project {
        name
        projectGroup {
          name
        }
      }
      licensesExp
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

export const getInternalComponents = gql`
  query Organization {
    organization {
      id
      organizationComponents {
        id
        matchStr
        ignoreCase
        organizationId
        updatedAt
        createdAt
        enabled
        createdBy
        lastUpdatedBy
      }
    }
  }
`

export const GetExistingRules = gql`
  query GetExistingRules(
    $id: Uuid!
    $checkIdentifier: [String!]
    $checkComponent: [String!]
    $checkVersion: [String!]
  ) {
    project(id: $id) {
      automationRules(
        first: 1
        checkIdentifier: $checkIdentifier
        checkComponent: $checkComponent
        checkVersion: $checkVersion
      ) {
        nodes {
          id
        }
      }
    }
  }
`

export const GetSelectedUser = gql`
  query GetSelectedUser {
    organization {
      users {
        name
        email
        role {
          name
        }
      }
    }
  }
`

export const GetConnections = gql`
  query GetConnections {
    organization {
      id
      name
      connections {
        nodes {
          id
          enabled
          connection {
            ... on JiraConnection {
              userName
              apiToken
              url
            }
            ... on SlackConnection {
              url
            }
            ... on TeamsConnection {
              url
            }
          }
        }
      }
    }
  }
`

export const VerifyJiraToken = gql`
  query VerifyJiraToken($userName: String!, $apiToken: String!, $url: String!) {
    organization {
      jiraVerify(userName: $userName, apiToken: $apiToken, url: $url) {
        email
        name
        accountId
        accountType
        url
        version
        deploymentType
        serverTitle
      }
    }
  }
`

export const GetJiraProjects = gql`
  query JiraInformation {
    jira {
      projects {
        id
        name
        key
      }
    }
  }
`

export const GetJiraOptions = gql`
  query JiraInformation($pKey: ID!) {
    jira(projectKey: $pKey) {
      users {
        email
        name
        accountId
        accountType
        active
      }
      issueTypes(projectKey: $pKey) {
        id
        name
      }
    }
  }
`

// GET SBOM QUALITY SCORE
export const GetSbomQualityScores = gql`
  query GetSbomQualityScores(
    $sbomIds: [ID!]!
    $reportFormat: ComplianceReportFormat
  ) {
    complianceReports(sbomIds: $sbomIds, reportFormat: $reportFormat) {
      nodes {
        reportFormat
        score
        scoreByCategory {
          category
          score
        }
      }
    }
  }
`

// GET PROJECT VERSION AND ID
export const GetProjectVersionAndId = gql`
  query GetProjectVersionAndId(
    $id: Uuid!
    $search: String
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: SbomOrderByFields!
    $direction: OrderByDirection!
  ) {
    project(id: $id) {
      id
      allSbomVersions: sbomVersions {
        totalCount
      }
      sbomVersions(
        search: $search
        first: $first
        last: $last
        after: $after
        before: $before
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        nodes {
          id
          projectVersion
        }
      }
    }
  }
`
export const GetProjectGroupDetails = gql`
  query GetProjectGroupDetails(
    $search: String
    $enabled: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      id
      projectGroups(
        search: $search
        enabled: $enabled
        first: $first
        last: $last
        after: $after
        before: $before
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
        nodes {
          id
          name
          defaultProject {
            id
          }
          projects {
            id
            name
          }
        }
      }
      allProjectGroups: projectGroups(
        enabled: $enabled
        orderBy: { field: $field, direction: $direction }
      ) {
        totalCount
      }
    }
  }
`

export const GetProjectGroupAndVersionDetails = gql`
  query GetProjectGroupAndVersionDetails(
    $search: String
    $enabled: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      id
      projectGroups(
        search: $search
        enabled: $enabled
        first: $first
        last: $last
        after: $after
        before: $before
        orderBy: { field: $field, direction: $direction }
      ) {
        nodes {
          id
          name
          defaultProject {
            id
            sbomVersions {
              nodes {
                id
                projectVersion
              }
            }
          }
          projects {
            id
            name
            sbomVersions {
              nodes {
                id
                projectVersion
              }
            }
          }
        }
      }
    }
  }
`

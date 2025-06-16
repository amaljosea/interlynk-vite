import { gql } from '@apollo/client'

// GET ORG NAME
export const GetOrganization = gql`
  query GetOrganization {
    organization {
      id
      name
      tier
      updatedAt
      currentUser {
        id
        name
        email
        superAdmin
        isPasswordSet
        profileImage {
          filename
          url
        }
        role {
          id
          name
        }
      }
    }
  }
`

export const GetApiKeys = gql`
  query GetApiKeys {
    organization {
      currentUser {
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
          tokenName
        }
      }
    }
  }
`

export const UserSettings = gql`
  query UserSettings {
    currentUserSettings {
      productDetailsOnboardingCompleted
      sbomDetailsOnboardingCompleted
      licensesOnboardingCompleted
      navOptionOnboardingCompleted
      policiesOnboardingCompleted
      requestsOnboardingCompleted
      supportOnboardingCompleted
      vulnerabilitiesOnboardingCompleted
    }
  }
`

// GET USERS
export const GetUsers = gql`
  query GetUsers(
    $search: String
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    organization {
      users(
        search: $search
        after: $after
        before: $before
        first: $first
        last: $last
      ) {
        nodes {
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
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        totalCount
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
        tier
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
    $labelIds: [Uuid!]
    $first: Int
    $last: Int
    $after: String
    $before: String
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
    $lifestage: [ProductLifecycleStageEnum!]
  ) {
    organization {
      id
      projectGroups(
        search: $search
        enabled: $enabled
        labelIds: $labelIds
        first: $first
        last: $last
        after: $after
        before: $before
        orderBy: { field: $field, direction: $direction }
        sbomProductLifeCycleStage: $lifestage
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
          labels {
            id
            name
            color
          }
          enabled
          sbomsCount
          defaultProject {
            id
          }
          projects {
            id
            name
            sbomsCount
            sboms {
              productLifeCycleStage
              id
            }
          }
          description
          updatedAt
        }
      }
    }
  }
`

export const GetTotalProduct = gql`
  query GetTotalProduct($first: Int) {
    organization {
      projectGroups(first: $first) {
        totalCount
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
    $labelIds: [Uuid!]
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
  ) {
    organization {
      projectGroups(
        search: $search
        enabled: $enabled
        labelIds: $labelIds
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
        enableAutoArchive
        automatedFixesEnabled
        dataRetentionDays
        internalCompMatchingEnabled
        vulnScanningEnabled
        copyVexFromPrevious
        jiraProject
        enableSupportLevel
        enableKeepPartsUpdated
        organizationManufacturer {
          id
          organizationName
        }
      }
    }
  }
`

// GET MANUFACTURER NAME AND CONTACTS FOR A PRODUCT
export const GetProductManufacturer = gql`
  query GetProductManufacturer($id: Uuid!) {
    project(id: $id) {
      projectSetting {
        organizationManufacturer {
          id
          organizationName
          organizationContacts {
            id
            name
            phone
            email
          }
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
      labels {
        id
        name
        color
      }
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
        projectGroup {
          name
        }
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
          sbomsCount
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
    $env: String
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
    $projectGroupLabelIds: [Uuid!]
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
        projectGroupLabelIds: $projectGroupLabelIds
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
          metrics(projectName: $env) {
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
      sev
      vulnInfo {
        id
        kev
        epssScore
        epssPercentile
        cwes
      }
      projectGroups {
        nodes {
          id
          name
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
        fixedVersions
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
    $lifestage: [ProductLifecycleStageEnum!]
  ) {
    project(id: $id) {
      id
      sbomVersions(
        first: $first
        after: $after
        last: $last
        before: $before
        search: $search
        lifestage: $lifestage
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
          spec
          phases
          creationAt
          createdAt
          updatedAt
          lifecycle
          isReprocess
          licensesExp
          projectVersion
          vulnRunStatus
          productLifeCycleStage
          alternatives {
            id
          }
          sbomParts {
            id
          }
          suppliers {
            id
            name
            url
            contactEmail
            contactName
          }
          stats {
            compCount
            compLicenseCount
            vulnStats
          }
          vulnerabilityMetrics {
            affectedCount
            notAffectedCount
            fixedCount
            unspecifiedCount
            inTriageCount
          }
        }
      }
    }
  }
`

// GET SBOM VERSION NAME
export const GetVersions = gql`
  query GetVersions(
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
          projectVersion
        }
      }
    }
  }
`

// GET ARCHIVED VERSIONS
export const GetArchivedVersions = gql`
  query GetArchivedVersions($id: Uuid!) {
    project(id: $id) {
      sbomArchived {
        id
        spec
        createdAt
        lifecycle
        projectVersion
        project {
          projectGroup {
            name
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
    $after: String
  ) {
    project(id: $id) {
      id
      sbomVersions(
        first: $first
        after: $after
        orderBy: { direction: $direction, field: $field }
      ) {
        nodes {
          createdAt
        }
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
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
        id
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
        spec
        createdAt
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
            createdAt
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
          spec
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

export const GetShareProductData = gql`
  query GetShareProductData($sbomId: Uuid!) {
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

// GET PRODUCT INFO
export const GetProductData = gql`
  query GetProductData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      phases
      updatedAt
      healthScore
      vulnRunStatus
      projectVersion
      productLifeCycleStage
      releaseDate
      endOfLifeDate
      endOfSupportDate
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
        phone
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
    $supportLevel: [String!]
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
        supportLevel: $supportLevel
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
          sbomId
          sbom {
            id
            projectVersion
            project {
              id
              projectGroup {
                name
              }
            }
          }
          enrichedContent {
            packageVersion {
              version
              isDeprecated
            }
            latestPackageVersion {
              version
              isOutdated
              isDeprecated
            }
          }
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
          licenseStatus
          licenseNotes
          group
          scope
          healthScore
          healthScoreReason
          scoreBreakdown {
            age
            community
            security
          }
          componentSupportLevel {
            id
            level
            endDate
            notes
            retainManualOverrideFor
            user {
              id
              name
            }
          }
          componentSupportLevelAutomatic {
            level
            notes
          }
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
          vulns {
            totalCount
            nodes {
              vexStatus {
                name
              }
            }
          }
        }
      }
    }
  }
`

export const GetComponentColumnData = gql`
  query GetComponentColumnData(
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
    $supportLevel: [String!]
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
        supportLevel: $supportLevel
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
          sbomId
          sbom {
            id
            projectVersion
            project {
              projectGroup {
                name
              }
            }
          }
          enrichedContent {
            packageVersion {
              version
              isDeprecated
            }
            latestPackageVersion {
              version
            }
          }
          name
          version
          primary
          internal
          purl
          cpes
          licensesExp
          updatedAt
          healthScore
          group
          description
          copyright
          kind
          scope
          suppliers {
            name
            url
            contactName
            contactEmail
          }
          scoreBreakdown {
            age
            community
            security
          }
          vulns {
            totalCount
            nodes {
              vexStatus {
                name
              }
            }
          }
          externalUrls {
            name
            url
          }
        }
      }
    }
  }
`

export const GetComponentExpandedData = gql`
  query GetComponentExpandedData($id: Uuid!, $sbomId: Uuid!) {
    component(id: $id, sbomId: $sbomId) {
      id
      __typename
      name
      kind
      version
      description
      purl
      cpes
      scope
      licensesExp

      suppliers {
        id
        name
        url
        contactEmail
        contactName
      }

      componentSupportLevel {
        level
        endDate
        retainManualOverrideFor
        notes
        user {
          name
        }
      }

      componentSupportLevelAutomatic {
        level
        notes
      }

      enrichedContent {
        packageVersion {
          version
        }
        latestPackageVersion {
          version
        }
      }

      dependsOn {
        toComp {
          id
          name
          version
          updatedAt
        }
      }

      dependencyOf {
        fromComp {
          id
          name
          version
          updatedAt
        }
      }
    }
  }
`

export const GetPrimaryComponentData = gql`
  query GetPrimaryComponentData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      components(sbomId: $sbomId, first: 1, primary: true) {
        nodes {
          id
          sbomId
          name
          version
          description
          copyright
          group
          kind
          licensesExp
          scope
          primary
          internal
          purl
          cpes
          suppliers {
            name
            url
            contactName
            contactEmail
          }
        }
      }
    }
  }
`

export const GetComponentHealthMapData = gql`
  query GetComponentHealthMapData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      components(sbomId: $sbomId, first: $first) {
        nodes {
          name
          version
          purl
          cpes
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
    $orderBy: ComponentOrderByInput
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(sbomId: $sbomId, primary: $primary, orderBy: $orderBy) {
        totalCount
        nodes {
          id
          name
          primary
          internal
          kind
          copyright
          publisher
          description
          group
          scope
        }
      }
    }
  }
`

export const GetSharPrimartComp = gql`
  query GetSharPrimartComp(
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
            name
            kind
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
    $includeParts: Boolean
    $orderBy: ComponentOrderByInput
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
          includeParts: $includeParts
          orderBy: $orderBy
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
            sbomId
            sbom {
              id
              projectVersion
              project {
                projectGroup {
                  name
                }
              }
            }
            name
            version
            primary
            internal
            purl
            cpes
            licensesExp
            updatedAt
            group
            description
            copyright
            kind
            scope
            externalUrls {
              name
              url
            }
          }
        }
      }
    }
  }
`

export const ShareComponentExpandedData = gql`
  query ShareComponentExpandedData($id: Uuid!) {
    shareLynkQuery {
      component(id: $id) {
        id
        __typename
        name
        kind
        version
        description
        purl
        cpes
        scope
        licensesExp

        suppliers {
          id
          name
          url
          contactEmail
          contactName
        }

        dependsOn {
          toComp {
            id
            name
            version
            updatedAt
          }
        }

        dependencyOf {
          fromComp {
            id
            name
            version
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
          dependsOnCount
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
          primary
        }
      }
    }
  }
`

// GET ALL VUNERABILITIES
export const GetAllVulnerabilities = gql`
  query GetAllVulnerabilities(
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
    $orderBy: ComponentVulnOrderByInput
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
        orderBy: $orderBy
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
          sbomId
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
          componentVulnCustomFields {
            id
            componentVulnCustomFieldDefinition {
              displayName
            }
            componentVulnCustomFieldDefinitionId
            value
          }
          externalUrls {
            name
            url
          }
          currentExternalUrls {
            name
            url
          }
          vuln {
            id
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
              cwes
              advisories
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
            purl
            cpes
            sbom {
              id
              createdAt
              projectVersion
              project {
                id
                name
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
            isPart
            isFirstDegreePart
            externalUrls {
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
                advisories
                cwes
                epssScore
                epssPercentile
                kev
              }
            }
            componentVulnLogs {
              id
            }
            component {
              name
              version
              sbom {
                id
                projectVersion
                project {
                  id
                  projectGroup {
                    name
                    id
                  }
                }
              }
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
              id
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
            componentSupportLevel {
              id
              level
              endDate
              notes
              retainManualOverrideFor
              user {
                id
                name
              }
              updatedAt
              createdAt
            }
            suppliers {
              id
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
export const GetProjectAutomations = gql`
  query GetProjectAutomations(
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

// GET PROJECT AUTOMATION NAMES
export const GetAutomationNames = gql`
  query GetAutomationNames(
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
        nodes {
          name
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
    $spec: SbomSpec
    $original: Boolean
    $package: Boolean
    $lite: Boolean
    $excludeParts: Boolean
    $supportLevelOnly: Boolean
    $includeSupportStatus: Boolean
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      download(
        sbomId: $sbomId
        includeVulns: $includeVulns
        spec: $spec
        original: $original
        dontPackageSbom: $package
        lite: $lite
        excludeParts: $excludeParts
        supportLevelOnly: $supportLevelOnly
        includeSupportStatus: $includeSupportStatus
      ) {
        content
        contentType
        filename
      }
    }
  }
`
//CSV SUPPORT LEVELS
export const SupportLevelCSV = gql`
  query SupportLevelCSV(
    $projectId: Uuid!
    $sbomId: Uuid!
    $supportLevelOnly: Boolean
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      download(sbomId: $sbomId, supportLevelOnly: $supportLevelOnly) {
        contentType
        filename
        content
      }
    }
  }
`

// DOWNLOAD SBOM FROM PUBLIC SITE
export const SignedSbomDownload = gql`
  query SignedSbomDownload(
    $sbomId: Uuid!
    $includeVulns: Boolean
    $spec: SbomSpec
    $original: Boolean
    $package: Boolean
    $lite: Boolean
  ) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        download(
          sbomId: $sbomId
          includeVulns: $includeVulns
          spec: $spec
          original: $original
          dontPackageSbom: $package
          lite: $lite
        ) {
          content
          contentType
          filename
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
          sbomsCount
          defaultProject {
            id
          }
          projects {
            id
            name
            sbomsCount
          }
          description
          enabled
          updatedAt
        }
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
        label
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
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: [String!]
    $search: String
    $licenseType: [String!]
    $orderBy: OrganizationLicenseOrderByInput
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
        orderBy: $orderBy
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
  query GetSbomSupportTab(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      supports(first: $first, last: $last, after: $after, before: $before) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        nodes {
          createdAt
          deprecated
          eol
          eos
          id
          idUri
          outdated
          productName
          productVersion
          recordType
          updatedAt
        }
      }
    }
  }
`

export const GetCompSupportData = gql`
  query GetComponentSupportData(
    $sbomId: Uuid
    $projectId: Uuid
    $first: Int
    $last: Int
    $after: String
    $before: String
    $includeParts: Boolean
    $orderBy: ComponentSupportLevelOrderByInput
    $supportLevel: [String!]
    $search: String
  ) {
    componentSupportLevel(
      sbomId: $sbomId
      projectId: $projectId
      first: $first
      last: $last
      after: $after
      before: $before
      includeParts: $includeParts
      orderBy: $orderBy
      supportLevel: $supportLevel
      search: $search
    ) {
      totalCount
      nodes {
        name
        version
        occurrences {
          id
          name
          version
          internal
          updatedAt
          isPart
          sbom {
            id
            project {
              projectGroup {
                name
              }
            }
            projectVersion
          }
          componentSupportLevel {
            componentId
            createdAt
            endDate
            id
            level
            notes
            retainManualOverrideFor
            updatedAt
            userId
            user {
              name
            }
          }
          componentSupportLevelAutomatic {
            level
            notes
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
        notificationEnabled
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
  query GetProductNamesForRequest(
    $field: ProjectGroupOrderByFields!
    $direction: OrderByDirection!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    organization {
      projectGroups(
        first: $first
        last: $last
        after: $after
        before: $before
        enabled: true
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
        notificationEnabled
        excludeInternalComponent
        excludePrimaryComponent
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
        violationsCount
        createdAt
        updatedAt
        result
        resultType
        resultWording
        sbom {
          id
          policyRunStatus
        }
        policy {
          id
          name
          description
          excludeInternalComponent
          excludePrimaryComponent
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

export const GetPolicyRules = gql`
  query GetPolicyRules($id: Uuid!, $sbomId: Uuid!) {
    policy(id: $id) {
      name
      policyRules {
        category
        createdAt
        id
        name
        operator
        operatorWording
        policyId
        subject
        updatedAt
        value
        policyRuleViolations(sbomId: $sbomId) {
          totalCount
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
        isComplete
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
      toVuln {
        id
        vuln {
          vulnId
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

export const GetInternalComponents = gql`
  query GetInternalComponents {
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
        nodes {
          name
          email
          role {
            name
          }
        }
      }
    }
  }
`

export const GetOrgConnections = gql`
  query GetOrgConnections {
    organization {
      id
      name
      connections {
        nodes {
          id
          enabled
          connection {
            ... on BitbucketConnection {
              id
              userName
              apiToken
              createdAt
              updatedAt
              workspace
              checkWebhookAccess
              checkWorkspaceAccess
              checkRepositoryAccess
            }
            ... on JiraConnection {
              userName
              apiToken
              url
            }
            ... on SlackConnection {
              configs {
                address
                notificationType
                frequency
              }
            }
            ... on TeamsConnection {
              configs {
                address
                notificationType
                frequency
              }
            }
            ... on EmailConnection {
              configs {
                address
                notificationType
                frequency
              }
            }
            ... on LinearConnection {
              id
              url
              apiToken
            }
          }
        }
      }
    }
  }
`

export const GetBitbucketConnection = gql`
  query GetBitbucketConnection {
    organization {
      connections {
        nodes {
          connection {
            ... on BitbucketConnection {
              id
            }
          }
        }
      }
    }
  }
`

export const GetPersonalConnections = gql`
  query GetPersonalConnections {
    organizationUser {
      id
      connections {
        nodes {
          id
          connection {
            ... on JiraConnection {
              userName
              apiToken
              url
            }
            ... on SlackConnection {
              configs {
                address
                notificationType
                frequency
              }
            }
            ... on TeamsConnection {
              configs {
                address
                notificationType
                frequency
              }
            }
            ... on EmailConnection {
              configs {
                address
                notificationType
                frequency
              }
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
  query GetJiraProjects {
    jira {
      projects {
        id
        name
        key
      }
    }
  }
`

export const GetJiraProjectFields = gql`
  query GetJiraProjectFields($projectKey: String!, $issueTypeId: String) {
    jira {
      project(projectKey: $projectKey) {
        key
        name
        fields(issueTypeId: $issueTypeId) {
          id
          name
          type
          required
          custom
          allowedValues
        }
      }
    }
  }
`

export const JiraInformation = gql`
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

export const VerifyLinearToken = gql`
  query VerifyLinearToken($apiToken: String!, $url: String!) {
    organization {
      linearVerify(apiToken: $apiToken, url: $url) {
        name
        email
        accountId
        url
        organizationId
        organizationName
      }
    }
  }
`

export const LinearTeams = gql`
  query LinearTeams {
    linear {
      teams {
        id
        name
      }
    }
  }
`

export const LinearTeamData = gql`
  query LinearTeamData($teamId: ID!) {
    linear(teamId: $teamId) {
      projects {
        id
        name
      }
      issueTypes {
        id
        name
        description
        scope
        color
      }
      workflowStates {
        id
        name
        type
      }
      users {
        id
        name
        email
        displayName
        active
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
export const GetProjectVersionLazyDropdownQuery = gql`
  query GetProjectVersionLazyDropdownQuery(
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
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          id
          projectVersion
        }
      }
    }
  }
`
export const GetProjectGroupLazyDropdownQuery = gql`
  query GetProjectGroupLazyDropdownQuery(
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
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
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
export const GetProjectName = gql`
  query GetProjectGroup($id: Uuid!) {
    projectGroup(id: $id) {
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
`

export const GetVersionName = gql`
  query GetSbomName($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      projectVersion
    }
  }
`

// GET INVITATION INFO
export const OrgUserInvitationInfo = gql`
  query OrgUserInvitationInfo($token: String!, $nonce: String!) {
    organizationUserInvitationInfo(
      invitationToken: $token
      invitationNonce: $nonce
    ) {
      organizationName
    }
  }
`

// LABEL

export const GetLabels = gql`
  query GetLabels($first: Int, $last: Int, $after: String, $before: String) {
    labels(first: $first, last: $last, after: $after, before: $before) {
      totalCount
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      nodes {
        color
        createdAt
        id
        name
        updatedAt
      }
    }
  }
`

export const GetEnrichedData = gql`
  query GetEnrichedData($id: Uuid!, $sbomId: Uuid!) {
    component(id: $id, sbomId: $sbomId) {
      name
      version
      healthScore
      enrichedContent {
        package {
          createdAt
          description
          ecosystem
          id
          isDeprecated
          name
          purl
          updatedAt
          website
        }
        packageVersion {
          copyright
          createdAt
          id
          isArchived
          isDeprecated
          isLatest
          isOutdated
          isPreRelease
          issueTrackerUrl
          license
          maintainers
          packageId
          publishedAt
          purl
          repositoryUrl
          updatedAt
          version
          website
        }
        latestPackageVersion {
          version
        }
        repository {
          contributorCount
          createdAt
          description
          ecosystem
          forksCount
          id
          isArchived
          lastCommitDate
          lastMergedPrDate
          lastReleaseDate
          lastRepoUpdateDate
          license
          name
          owner
          scorecardScore
          starsCount
          updatedAt
          url
        }
      }
    }
  }
`

export const GetCustomFields = gql`
  query GetCustomFields {
    componentVulnCustomFieldDefinitions {
      totalCount
      nodes {
        createdAt
        displayName
        fieldType
        id
        internalName
        maxValue
        minValue
        organizationId
        updatedAt
      }
    }
  }
`

export const ActiveCompliances = gql`
  query ActiveCompliances {
    organization {
      activeCompliances {
        id
        isEnabled
        scoreEnabled
        complianceType
      }
    }
  }
`

export const CveLookup = gql`
  query CveLookup($vulnId: String!) {
    cveLookup(vulnId: $vulnId) {
      vulnId
      description
      lastModified
      reportedAt
      published
      cvssScore
      cvssVector
      severity
      advisories
      cwes
    }
  }
`

export const GetComponentVulns = gql`
  query GetComponentVulns(
    $id: Uuid!
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    component(id: $id, sbomId: $sbomId) {
      vulns(first: $first, last: $last, after: $after, before: $before) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
        nodes {
          vexStatus {
            name
          }
          vuln {
            id
            sev
            source
            vulnId
          }
        }
      }
    }
  }
`

export const GetComponentSupportData = gql`
  query GetComponentExportData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $after: String
    $includeParts: Boolean
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      components(
        sbomId: $sbomId
        first: $first
        after: $after
        includeParts: $includeParts
      ) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          name
          version
          supportLevel
          endOfSupport
        }
      }
    }
  }
`

export const GetCustomVuln = gql`
  query GetCustomVuln($vulnIdentifier: Uuid!) {
    customVuln(vulnIdentifier: $vulnIdentifier) {
      componentId
      cpe
      createdAt
      desc
      id
      lastModifiedAt
      organizationId
      publishedAt
      purl
      reportedAt
      sev
      updatedAt
      vulnIdentifier
      component {
        id
      }
    }
  }
`

export const GetCustomVulns = gql`
  query GetCustomVulns(
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    organization {
      customVulns(after: $after, before: $before, first: $first, last: $last) {
        totalCount
        nodes {
          cpe
          createdAt
          desc
          id
          lastModifiedAt
          organizationId
          publishedAt
          purl
          reportedAt
          sev
          updatedAt
          vulnIdentifier
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

export const GetProjectMetrics = gql`
  query GetProjectMetrics(
    $projectIds: [Uuid!]
    $projectGroupIds: [Uuid!]
    $startDate: ISO8601Date
    $endDate: ISO8601Date
  ) {
    dailyMetrics {
      projectMetrics(
        projectIds: $projectIds
        projectGroupIds: $projectGroupIds
        startDate: $startDate
        endDate: $endDate
      ) {
        nodes {
          createdAt
          date
          defectDensity
          id
        }
      }
    }
  }
`

export const GetProjectVulnMetrics = gql`
  query GetProjectVulnMetrics(
    $projectIds: [Uuid!]
    $projectGroupIds: [Uuid!]
    $startDate: ISO8601Date
    $endDate: ISO8601Date
    $vulnIds: [Uuid!]
    $first: Int = 10000 # Request a high number of entries
  ) {
    dailyMetrics {
      projectVulnMetrics(
        projectIds: $projectIds
        projectGroupIds: $projectGroupIds
        startDate: $startDate
        endDate: $endDate
        vulnIds: $vulnIds
        first: $first # Fetch as many items as possible
      ) {
        totalCount
        nodes {
          createdAt
          date
          id
          organizationId
          projectId
          statusAgeAffected
          statusAgeFixed
          statusAgeInTriage
          statusAgeNotAffected
          statusAgeResolved
          statusAgeUnspecified
          updatedAt
          vulnId
          project {
            id
          }
          organization {
            id
          }
          vuln {
            id
            vulnId
          }
        }
      }
    }
  }
`

export const GetDailyMetrics = gql`
  query GetDailyMetrics(
    $first: Int
    $projectNames: [String!]
    $projectGroupIds: [Uuid!]
    $sbomIds: [Uuid!]
    $startDate: ISO8601Date
    $endDate: ISO8601Date
    $level: OrganizationMetricLevelEnum
  ) {
    dailyMetrics {
      sbomMetrics(
        first: $first
        level: $level
        projectNames: $projectNames
        projectGroupIds: $projectGroupIds
        sbomIds: $sbomIds
        startDate: $startDate
        endDate: $endDate
      ) {
        nodes {
          componentsCount
          date
          licensesCount
          policiesCount
          policyResultDetectedCount
          policyResultErrorCount
          policyResultNotDetectedCount
          policyResultPassedCount
          policyRuleViolationFailCount
          policyRuleViolationInformCount
          policyRuleViolationPassCount
          policyRuleViolationWarnCount
          policyViolationsCount
          vulnerabilityAffectedCount
          vulnerabilityCount
          vulnerabilityCriticalCount
          vulnerabilityFixedCount
          vulnerabilityHighCount
          vulnerabilityInTriageCount
          vulnerabilityLowCount
          vulnerabilityMediumCount
          vulnerabilityNotAffectedCount
          vulnerabilityUnknownSevCount
          vulnerabilityUnspecifiedCount
          averageVulnerabilityDuration
          aggregator
          policyResultSkippedCount
        }
      }
    }
  }
`

export const GetScoreSetting = gql`
  query GetScoreSetting {
    organization {
      scoreSetting {
        id
        ageWeight
        updatedAt
        createdAt
        securityWeight
        communityWeight
        contributorThresholdMax
        contributorThresholdMin
        componentAbandonedThreshold
        pkgAgeThreshold
        repoAgeThreshold
        organization {
          id
        }
      }
    }
  }
`

export const GetPackageData = gql`
  query GetPackageData($name: String!, $version: String!, $ecosystem: String!) {
    packageLookup(name: $name, version: $version, ecosystem: $ecosystem) {
      package {
        createdAt
        description
        ecosystem
        id
        isDeprecated
        name
        purl
        updatedAt
        website
      }
      packageVersion {
        copyright
        createdAt
        id
        isArchived
        isDeprecated
        isLatest
        isOutdated
        isPreRelease
        issueTrackerUrl
        license
        maintainers
        packageId
        publishedAt
        purl
        repositoryUrl
        updatedAt
        version
        website
      }
      latestPackageVersion {
        copyright
        createdAt
        id
        isArchived
        isDeprecated
        isLatest
        isOutdated
        isPreRelease
        issueTrackerUrl
        license
        maintainers
        packageId
        publishedAt
        purl
        repositoryUrl
        updatedAt
        version
        website
      }
    }
  }
`

export const verfifyCustomVuln = gql`
  query verfifyCustomVuln($vulnIdentifier: String!) {
    customVuln(vulnIdentifier: $vulnIdentifier) {
      id
      vulnIdentifier
      desc
      sev
      reportedAt
      publishedAt
      lastModifiedAt
      purl
      cpe
      customVulnSboms {
        id
        sbomId
        componentId
      }
      createdAt
      updatedAt
    }
  }
`

// GET ALL PRODUCTS
export const getAllProducts = gql`
  query getAllProducts {
    organization {
      projectGroups {
        totalCount
      }
    }
  }
`

// GET PRODUCTS BY STAGES
export const getProductsByStage = gql`
  query getProductsByStage {
    organization {
      none: projectGroups(sbomProductLifeCycleStage: none) {
        totalCount
      }
      design: projectGroups(sbomProductLifeCycleStage: design) {
        totalCount
      }
      development: projectGroups(sbomProductLifeCycleStage: development) {
        totalCount
      }
      maintenance: projectGroups(sbomProductLifeCycleStage: maintenance) {
        totalCount
      }
      released: projectGroups(sbomProductLifeCycleStage: released) {
        totalCount
      }
      endOfSupport: projectGroups(sbomProductLifeCycleStage: end_of_support) {
        totalCount
      }
      endOfLife: projectGroups(sbomProductLifeCycleStage: end_of_life) {
        totalCount
      }
    }
  }
`

// GET VERSION LIFESTAGES
export const getVersionLifestage = gql`
  query getVersionLifestage($env: String) {
    organizationMetric(envName: $env) {
      versionLifecycleStage
    }
  }
`

// GET ALL VULNERABILITIES BY SEVERITY
export const getVulnsBySeverity = gql`
  query vulnsBySeverity(
    $envName: String!
    $labelIds: [Uuid!]
    $kev: Boolean
    $status: [String!]
  ) {
    organization {
      total: vulnCounts(
        projectName: $envName
        projectGroupLabelIds: $labelIds
        kev: $kev
        status: $status
      )
      critical: vulnCounts(
        severity: ["Critical"]
        projectName: $envName
        status: $status
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      high: vulnCounts(
        severity: ["High"]
        projectName: $envName
        status: $status
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      medium: vulnCounts(
        severity: ["Medium"]
        projectName: $envName
        status: $status
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      low: vulnCounts(
        severity: ["Low"]
        projectName: $envName
        status: $status
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      unknown: vulnCounts(
        severity: ["Unknown"]
        projectName: $envName
        status: $status
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
    }
  }
`

// GET ALL VULNERABILITIES BY STATUS
export const getVulnsByStatus = gql`
  query vulnsByStatus(
    $severity: [String!]
    $envName: String!
    $labelIds: [Uuid!]
    $kev: Boolean
  ) {
    organization {
      total: vulnCounts(
        severity: $severity
        projectName: $envName
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      unspecified: vulnCounts(
        severity: $severity
        projectName: $envName
        status: ["Unspecified"]
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      inTriage: vulnCounts(
        severity: $severity
        projectName: $envName
        status: ["In Triage"]
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      affected: vulnCounts(
        severity: $severity
        projectName: $envName
        status: ["Affected"]
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      fixed: vulnCounts(
        severity: $severity
        projectName: $envName
        status: ["Fixed"]
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
      notAffected: vulnCounts(
        severity: $severity
        projectName: $envName
        status: ["Not Affected"]
        projectGroupLabelIds: $labelIds
        kev: $kev
      )
    }
  }
`

// GET ALL POLICIES RULES
export const getAllPolicies = gql`
  query GetAllPolicies {
    total: policies {
      totalCount
    }
    informPolicies: policies(resultType: ["inform"]) {
      totalCount
    }
    warnPolicies: policies(resultType: ["warn"]) {
      totalCount
    }
    failPolicies: policies(resultType: ["fail"]) {
      totalCount
    }
  }
`

// GET ALL POLICY RESULTS
export const getPolicyViolations = gql`
  query getPolicyViolations($resultType: [String!], $envNames: [String!]) {
    policyRuleViolations(
      resultTypes: $resultType
      environmentNames: $envNames
    ) {
      totalCount
    }
  }
`

// GET PRODUCT COUNTS BY LABELS
export const getProductsByLabels = gql`
  query getProductsByLabels {
    organization {
      projectGroups {
        totalCount
        nodes {
          labels {
            id
            name
            color
          }
        }
      }
    }
  }
`

export const GetPolicyResults = gql`
  query GetPolicyResults(
    $policyId: [Uuid!]
    $result: [String!]
    $projectGroupIds: [Uuid!]
    $projectVersion: [String!]
    $projectName: [String!]
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    policyResults(
      policyId: $policyId
      after: $after
      before: $before
      first: $first
      last: $last
      result: $result
      projectGroupIds: $projectGroupIds
      projectVersion: $projectVersion
      projectName: $projectName
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
        policyId
        updatedAt
        resultWording
        violationsCount
        policy {
          id
          name
        }
        sbom {
          id
          projectVersion
          project {
            name
            projectGroup {
              name
            }
          }
        }
      }
    }
  }
`

export const GetPolicy = gql`
  query Policy($id: Uuid!) {
    policy(id: $id) {
      createdAt
      description
      excludeInternalComponent
      excludePrimaryComponent
      id
      isEnabled
      name
      operator
      organizationId
      resultType
      updatedAt
    }
  }
`

export const GetComponentSupportLevels = gql`
  query GetComponentSupportLevels($id: Uuid!, $sbomId: Uuid!) {
    component(id: $id, sbomId: $sbomId) {
      componentSupportLevel {
        id
        level
        endDate
        notes
        retainManualOverrideFor
        user {
          id
          name
        }
        updatedAt
        createdAt
      }
      componentSupportLevelAutomatic {
        level
        notes
      }
    }
  }
`

export const GetLicenseStatusHistory = gql`
  query GetLicenseStatusHistory($compId: Uuid!) {
    componentLicenseStatusHistories(componentId: $compId) {
      id
      changedBy
      values
      createdAt
    }
  }
`

export const GetGlobalVulnsTotalCount = gql`
  query GetGlobalVulnsTotalCount(
    $search: String
    $severity: [String!]
    $projectIds: [Uuid!]
    $projectGroupIds: [Uuid!]
    $status: [String!]
    $kev: Boolean
    $epss: RangeInput
    $field: VulnOrderByFields!
    $direction: OrderByDirection!
    $projectGroupLabelIds: [Uuid!]
  ) {
    organization {
      default: vulns(
        projectNames: ["default"]
        search: $search
        projectGroupIds: $projectGroupIds
        status: $status
        severity: $severity
        kev: $kev
        epss: $epss
        projectGroupLabelIds: $projectGroupLabelIds
        orderBy: { field: $field, direction: $direction }
        projectIds: $projectIds
      ) {
        totalCount
      }
      development: vulns(
        projectNames: ["development"]
        search: $search
        projectGroupIds: $projectGroupIds
        status: $status
        severity: $severity
        kev: $kev
        epss: $epss
        projectGroupLabelIds: $projectGroupLabelIds
        orderBy: { field: $field, direction: $direction }
        projectIds: $projectIds
      ) {
        totalCount
      }
      production: vulns(
        projectNames: ["production"]
        search: $search
        projectGroupIds: $projectGroupIds
        status: $status
        severity: $severity
        kev: $kev
        epss: $epss
        projectGroupLabelIds: $projectGroupLabelIds
        orderBy: { field: $field, direction: $direction }
        projectIds: $projectIds
      ) {
        totalCount
      }
    }
  }
`

export const GetActivities = gql`
  query GetActivities($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      sbomActivities {
        id
        sbom {
          id
        }
        runId
        runType
        invocation
        user {
          id
          name
        }
        startTime
        endTime
        sbomActivityDetails {
          subjectType
          subjectId
          subject {
            ... on Sbom {
              id
            }
            ... on SbomComponent {
              id
              name
              version
              purl
              cpes
            }
          }
          action
          result
        }
      }
    }
  }
`

export const BitbucketWorkspace = gql`
  query BitbucketWorkspace($first: Int) {
    bitbucketWorkspaces(first: $first) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          uuid
          name
          slug
        }
      }
    }
  }
`

export const BitbucketRepositories = gql`
  query BitbucketRepositories(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $search: String
  ) {
    bitbucketApiRepositories(
      first: $first
      after: $after
      before: $before
      last: $last
      search: $search
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        fullName
        isImported
        mainbranch
        name
        slug
        uuid
        workspace
        projectName
      }
      totalCount
    }
  }
`
export const ProductProgressMetrics = gql`
  query ProductProgressMetrics($projectId: Uuid!) {
    project(id: $projectId) {
      id
      projectGroup {
        name
      }
      sbomVersions(
        first: 25
        orderBy: { direction: DESC, field: SBOMS_CREATED_AT }
      ) {
        totalCount
        nodes {
          projectVersion
          vulnRunStatus
          vulnerabilityMetrics {
            affectedCount
            fixedCount
            inTriageCount
            notAffectedCount
            unspecifiedCount
          }
          supportLevelMetrics {
            abandonedCount
            activelyMaintainedCount
            noLongerMaintainedCount
            unspecifiedCount
          }
        }
      }
    }
  }
`

export const GetJiraConnections = gql`
  query GetJiraConnections {
    organization {
      connections {
        nodes {
          enabled
          connection {
            ... on JiraConnection {
              userName
              apiToken
              url
            }
          }
        }
      }
    }
  }
`

export const PackageVersionsTable = gql`
  query PackageVersions(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $search: String
    $orderBy: PackageVersionOrderByInput
  ) {
    packageVersions(
      packageName: $search
      orderBy: $orderBy
      first: $first
      last: $last
      after: $after
      before: $before
    ) {
      totalCount
      nodes {
        id
        updatedAt
        version
        licenseExp
        copyright
        notice
        package {
          name
          ecosystem
        }
        organizationPackageVersion {
          id
          updatedAt
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
export const GetComponentDataForExport = gql`
  query GetComponentDataForExport(
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
    $supportLevel: [String!]
    $kind: [String!]
    $internal: Boolean
    $primary: Boolean
    $direct: Boolean
    $includeParts: Boolean
    $orderBy: ComponentOrderByInput
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
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
        supportLevel: $supportLevel
        includeParts: $includeParts
      ) {
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          name
          version
          purl
          licensesExp
          updatedAt
          description
          group
          kind
          internal
          cpes
          scope
          primary
          externalUrls {
            name
            url
          }
          suppliers {
            name
            url
            contactName
            contactEmail
          }
          componentSupportLevel {
            level
            endDate
            notes
            retainManualOverrideFor
            user {
              name
            }
          }
          componentSupportLevelAutomatic {
            level
            notes
          }
        }
      }
    }
  }
`
export const GetComponentDataForPdf = gql`
  query GetComponentDataForPdf(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $after: String
    $includeParts: Boolean
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      components(
        sbomId: $sbomId
        first: $first
        after: $after
        includeParts: $includeParts
      ) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          name
          version
          kind
          purl
          cpes
          uniqueId
          licensesExp
          suppliers {
            name
          }
          sbom {
            project {
              projectGroup {
                name
              }
            }
          }
        }
      }
    }
  }
`

export const GetVulnDataForCSV = gql`
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
    $orderBy: ComponentVulnOrderByInput
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
        orderBy: $orderBy
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
          isPart
          lastAffectedVersions
          externalUrls {
            name
            url
          }
          currentExternalUrls {
            name
            url
          }
          componentVulnCustomFields {
            componentVulnCustomFieldDefinition {
              displayName
            }
            value
          }
          componentVulnLogs {
            justification
            actionStmt
            impact
            response
            fixedIn
            note
          }
          vuln {
            vulnId
            desc
            sev
            source
            cvssScore
            publishedAt
            lastModifiedAt
            cvssVector
            nvdAliasId
            vulnInfo {
              epssScores
              epssPercentile
              kev
              advisories
              cwes
            }
          }
          component {
            name
            version
            sbom {
              project {
                projectGroup {
                  name
                }
              }
            }
          }
          vexStatus {
            name
          }
        }
      }
    }
  }
`

export const GetGlobalVulnCSVData = gql`
  query GetGlobalVulnExportData(
    $first: Int
    $last: Int
    $env: String
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
    $projectGroupLabelIds: [Uuid!]
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
        projectGroupLabelIds: $projectGroupLabelIds
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
          vulnId
          sev
          source
          cvssScore
          publishedAt
          lastModifiedAt
          vulnInfo {
            epssScores
          }
          metrics(projectName: $env) {
            affectedCount
            fixedCount
            inTriageCount
            notAffectedCount
            unspecifiedCount
          }
        }
      }
    }
  }
`

export const GetVulnProductDetails = gql`
  query GetVulnProductDetails(
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
    $orderBy: ComponentVulnOrderByInput
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
        orderBy: $orderBy
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
          sbomId
          vexJustificationId
          isPart
          isComplete
          fixedVersions
          lastAffectedVersions
          note
          detail
          actionStmt
          fixedIn
          impact
          externalUrls {
            name
            url
          }
          vuln {
            id
            vulnId
            source
            updatedAt
            cvssScore
            cvssVector
            nvdAliasId
            desc
            sev
            publishedAt
            lastModifiedAt
            vulnInfo {
              epssPercentile
              kev
              cwes
              advisories
            }
          }
          component {
            name
            version
            sbom {
              project {
                projectGroup {
                  id
                  name
                }
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
export const GetGlobalVulnerabilityList = gql`
  query GetGlobalVulns(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $search: String
    $severity: [String!]
    $status: [String!]
    $kev: Boolean
    $epss: RangeInput
    $field: VulnOrderByFields!
    $direction: OrderByDirection!
    $projectNames: [String!]
    $projectIds: [Uuid!]
    $projectGroupIds: [Uuid!]
    $projectGroupLabelIds: [Uuid!]
    $env: String
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
        projectGroupLabelIds: $projectGroupLabelIds
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
          vulnId
          id
          source
          lastModifiedAt
          publishedAt
          sev
          cvssScore
          nvdAliasId
          metrics(projectName: $env) {
            unspecifiedCount
            inTriageCount
            affectedCount
            fixedCount
            notAffectedCount
          }
          vulnInfo {
            kev
            epssScores
            epssScore
          }
        }
      }
    }
  }
`
export const GetVulnDataForPdf = gql`
  query GetVulnData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $after: String
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      vulns(sbomId: $sbomId, first: $first, after: $after) {
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
          note
          actionStmt
          componentVulnCustomFields {
            componentVulnCustomFieldDefinition {
              displayName
            }
            value
          }
          vuln {
            vulnId
            desc
            source
            publishedAt
            vulnInfo {
              epssPercentile
              epssScores
              kev
            }
          }
          component {
            name
            version
            sbom {
              id
              project {
                id
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
            name
          }
          vexJustification {
            name
          }
        }
      }
    }
  }
`

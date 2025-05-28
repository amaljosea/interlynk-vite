import { gql } from '@apollo/client'

// ORGANIZATION UPDATE
export const orgUpdate = gql`
  mutation orgUpdate($name: String, $email: String, $url: String) {
    organizationUpdate(input: { name: $name, email: $email, url: $url }) {
      errors
    }
  }
`

// CREATE ORGANIZATIOPN
export const RegisterOrganization = gql`
  mutation RegisterOrganization(
    $name: String!
    $url: String
    $email: String
    $awsRegistrationToken: String
  ) {
    organizationCreate(
      input: {
        name: $name
        url: $url
        email: $email
        awsRegistrationToken: $awsRegistrationToken
      }
    ) {
      organization {
        id
        name
        url
      }
      errors
    }
  }
`

// INVITE USERS
export const InviteUser = gql`
  mutation InviteUser($email: String!, $roleId: Uuid) {
    organizationUserInvite(
      input: { email: $email, organizationRoleId: $roleId }
    ) {
      user {
        id
        email
      }
      errors
    }
  }
`

// UPDATE ORANIZATION ROLE PERMISSIONS
export const UpdateOrganizationRole = gql`
  mutation UpdateOrganizationRole(
    $permissions: [SetPermissionInput!]
    $organizationRoleId: Uuid!
  ) {
    organizationRoleUpdate(
      input: {
        permissions: $permissions
        organizationRoleId: $organizationRoleId
      }
    ) {
      organizationRole {
        id
        name
        permissions
        permissionsMap {
          category
          description
          key
          name
          supersededBy
          value
        }
      }
      errors
    }
  }
`

// UPDATE ORGANIZATION USER ROLE
export const UpdateOrganizationUserRole = gql`
  mutation UpdateOrganizationUserRole(
    $userId: Uuid!
    $organizationRoleId: Uuid
  ) {
    organizationUserUpdate(
      input: { userId: $userId, organizationRoleId: $organizationRoleId }
    ) {
      user {
        role {
          id
          name
        }
      }
      errors
    }
  }
`

// ACCEPT ORG INVITATION
export const AcceptOrgInvitation = gql`
  mutation acceptInvitationById($organizationId: Uuid!) {
    organizationUserInvitationAcceptById(
      input: { organizationId: $organizationId }
    ) {
      organization {
        name
        invitationStatus
      }
      errors
    }
  }
`

// DECLINE ORG INVITATION
export const DeclineOrgInvitation = gql`
  mutation DeclineOrgInvitation($organizationId: Uuid!) {
    organizationUserInvitationDeclineById(
      input: { organizationId: $organizationId }
    ) {
      organization {
        name
        invitationStatus
      }
      errors
    }
  }
`

// USER EMAIL CONFIRMATION
export const UserEmailConfirmation = gql`
  mutation UserEmailConfirmation($token: String!) {
    userEmailConfirmation(input: { confirmationToken: $token }) {
      user {
        name
        email
      }
      errors
    }
  }
`

// ACCEPT INVITATION
export const AcceptInvitation = gql`
  mutation AcceptInvitation($token: String!, $nonce: String!) {
    organizationUserInvitationAccept(
      input: { invitationToken: $token, nonce: $nonce }
    ) {
      user {
        email
        name
      }
      userType
      errors
    }
  }
`

// DECLINE INVITATION
export const DeclineInvitation = gql`
  mutation DeclineInvitation($nonce: String!, $token: String!) {
    organizationUserInvitationDecline(
      input: { nonce: $nonce, invitationToken: $token }
    ) {
      errors
      user {
        email
      }
    }
  }
`

// CREATE INTERNAL COMPONENT
export const createOrgComp = gql`
  mutation createOrgComp(
    $matchStr: String!
    $ignoreCase: Boolean!
    $enabled: Boolean!
  ) {
    organizationComponentCreate(
      input: { matchStr: $matchStr, ignoreCase: $ignoreCase, enabled: $enabled }
    ) {
      organizationComponent {
        matchStr
        updatedAt
        id
        enabled
      }
      errors
    }
  }
`

// UPDATE INTERNAL COMPONENT
export const updateOrgComp = gql`
  mutation updateOrgComp(
    $id: Uuid!
    $matchStr: String!
    $ignoreCase: Boolean!
    $enabled: Boolean!
  ) {
    organizationComponentUpdate(
      input: {
        id: $id
        matchStr: $matchStr
        ignoreCase: $ignoreCase
        enabled: $enabled
      }
    ) {
      organizationComponent {
        matchStr
        updatedAt
        id
        enabled
      }
      errors
    }
  }
`

// DELETE INTERNAL COMPONENT
export const deleteOrgComp = gql`
  mutation deleteOrgComp($untag: Boolean, $id: ID!) {
    organizationComponentDelete(input: { untag: $untag, id: $id }) {
      organizationComponent {
        createdAt
        createdBy
        enabled
        ignoreCase
        lastUpdatedBy
        organizationId
        matchStr
        updatedAt
        id
      }
      errors
    }
  }
`

// ORGANIZATION RULE UPDATE
export const orgRuleUpdate = gql`
  mutation orgRuleUpdate(
    $action: String
    $enabled: Boolean
    $id: ID!
    $severity: String
  ) {
    organizationRuleUpdate(
      input: {
        action: $action
        enabled: $enabled
        id: $id
        severity: $severity
      }
    ) {
      errors
    }
  }
`

// DELETE USER
export const deleteOrgUser = gql`
  mutation deleteOrgUser($userId: Uuid) {
    organizationUserRemove(input: { userId: $userId }) {
      user {
        name
        email
      }
      errors
    }
  }
`

// UPDATE ORG USER
export const updateOrgUser = gql`
  mutation updateOrgUser($id: ID!, $name: String!) {
    userUpdate(input: { id: $id, name: $name }) {
      errors
      user {
        id
        name
      }
    }
  }
`

// CREATE PROJECT GROUP
export const CreateProjectGroup = gql`
  mutation CreateProjectGroup(
    $name: String!
    $desc: String
    $enabled: Boolean
    $labelIds: [Uuid!]
  ) {
    projectGroupCreate(
      input: {
        name: $name
        description: $desc
        enabled: $enabled
        labelIds: $labelIds
      }
    ) {
      projectGroup {
        id
        name
        description
        enabled
        projects {
          id
          name
        }
      }
      errors
    }
  }
`

// UPDATE PROJECT GROUP
export const UpdateProjectGroup = gql`
  mutation UpdateProjectGroup(
    $id: Uuid!
    $name: String
    $desc: String
    $enabled: Boolean
    $labelIds: [Uuid!]
  ) {
    projectGroupUpdate(
      input: {
        id: $id
        name: $name
        description: $desc
        enabled: $enabled
        labelIds: $labelIds
      }
    ) {
      projectGroup {
        id
        name
        labels {
          id
          name
        }
      }
      errors
    }
  }
`

// DELETE PROJECT GROUP
export const DeleteProjectGroup = gql`
  mutation DeleteProjectGroup($id: Uuid!) {
    projectGroupDelete(input: { id: $id }) {
      errors
    }
  }
`

// PROJECT SETTINGS UPDATE
export const ProjectSettingUpdate = gql`
  mutation ProjectSettingUpdate(
    $id: Uuid!
    $checks: Boolean
    $intcomp: Boolean
    $days: Float
    $autofix: Boolean
    $vulnscan: Boolean
    $copyVexFromPrevious: Boolean
    $mfcId: Uuid
    $jiraProject: String
    $jiraIssueType: String
    $jiraAssignee: String
    $jiraReporter: String
    $enableSupportLevel: Boolean
    $enableAutoArchive: Boolean
  ) {
    projectSettingUpdate(
      input: {
        id: $id
        checksEnabled: $checks
        internalCompMatchingEnabled: $intcomp
        dataRetentionDays: $days
        automatedFixesEnabled: $autofix
        vulnScanningEnabled: $vulnscan
        copyVexFromPrevious: $copyVexFromPrevious
        organizationManufacturerId: $mfcId
        jiraProject: $jiraProject
        jiraIssueType: $jiraIssueType
        jiraAssignee: $jiraAssignee
        jiraReporter: $jiraReporter
        enableSupportLevel: $enableSupportLevel
        enableAutoArchive: $enableAutoArchive
      }
    ) {
      projectSetting {
        id
        jiraProject
        jiraIssueType
        jiraAssignee
        jiraReporter
        checksEnabled
        automatedFixesEnabled
        dataRetentionDays
        internalCompMatchingEnabled
        vulnScanningEnabled
        jiraProject
      }
      errors
    }
  }
`

export const OrgSettingCreate = gql`
  mutation OrgSettingCreate($settingId: Uuid!, $value: Boolean) {
    organizationSettingCreate(input: { settingId: $settingId, value: $value }) {
      organizationSetting {
        id
        value
        setting {
          name
        }
      }
    }
  }
`

export const OrgSettingUpdate = gql`
  mutation OrgSettingUpdate($id: ID!, $value: Boolean!) {
    organizationSettingUpdate(input: { id: $id, value: $value }) {
      organizationSetting {
        id
        setting {
          name
        }
      }
    }
  }
`

export const CreateProject = gql`
  mutation CreateProject($name: String!, $desc: String) {
    projectCreate(input: { name: $name, description: $desc }) {
      project {
        id
        name
        description
      }
      errors
    }
  }
`

export const UpdateProject = gql`
  mutation UpdateProject(
    $id: Uuid!
    $name: String
    $desc: String
    $enabled: Boolean
  ) {
    projectUpdate(
      input: { id: $id, name: $name, description: $desc, enabled: $enabled }
    ) {
      errors
    }
  }
`

export const DeleteProject = gql`
  mutation DeleteProject($id: Uuid!) {
    projectDelete(input: { id: $id }) {
      errors
    }
  }
`

export const UploadSbom = gql`
  mutation UploadSbom($doc: Upload!, $projectId: ID!) {
    sbomUpload(input: { doc: $doc, projectId: $projectId }) {
      errors
    }
  }
`
// CREATE PRODUCT COMPONENT
export const CreateComponent = gql`
  mutation CreateComponent(
    $sbomId: Uuid!
    $kind: String!
    $name: String!
    $description: String
    $copyright: String
    $version: String
    $group: String
    $licenses: LicenseInput
    $cpes: [String!]
    $purl: String
    $scope: String
    $primary: Boolean
    $internal: Boolean
    $supportLevel: ComponentSupportLevelEnum
    $endOfSupport: DateOrEmptyString
  ) {
    componentCreate(
      input: {
        sbomId: $sbomId
        kind: $kind
        name: $name
        copyright: $copyright
        description: $description
        version: $version
        group: $group
        licenses: $licenses
        cpes: $cpes
        purl: $purl
        scope: $scope
        primary: $primary
        supportLevel: $supportLevel
        endOfSupport: $endOfSupport
        internal: $internal
      }
    ) {
      component {
        id
        name
      }
      errors
    }
  }
`
// UPDATE PRODUCT COMPONENT
export const UpdateComponent = gql`
  mutation UpdateComponent(
    $id: Uuid!
    $sbomId: Uuid!
    $kind: String
    $name: String
    $description: String
    $copyright: String
    $version: String
    $group: String
    $licenses: LicenseInput
    $cpes: [String!]
    $purl: String
    $primary: Boolean
    $internal: Boolean
    $uniqueId: Boolean
    $scope: String
    $supportLevel: ComponentSupportLevelEnum
    $endOfSupport: DateOrEmptyString
    $notice: String
  ) {
    componentUpdate(
      input: {
        id: $id
        sbomId: $sbomId
        kind: $kind
        name: $name
        copyright: $copyright
        description: $description
        version: $version
        group: $group
        licenses: $licenses
        cpes: $cpes
        purl: $purl
        scope: $scope
        primary: $primary
        internal: $internal
        supportLevel: $supportLevel
        endOfSupport: $endOfSupport
        generateUniqueId: $uniqueId
        notice: $notice
      }
    ) {
      component {
        id
        name
        notice
        copyright
        version
        primary
        purl
        cpes
      }
      errors
    }
  }
`

// UPDATE PRODUCT COMPONENT LINKS
export const UpdateCompLinks = gql`
  mutation UpdateCompLinks(
    $id: Uuid!
    $sbomId: Uuid!
    $urls: [ExternalUrlInput!]
  ) {
    componentUpdate(input: { id: $id, sbomId: $sbomId, externalUrls: $urls }) {
      component {
        id
        externalUrls {
          name
          url
        }
      }
      errors
    }
  }
`

// DELETE PRODUCT COMPONENT
export const DeleteComponent = gql`
  mutation DeleteComponent($id: Uuid!, $sbomId: Uuid!) {
    componentDelete(input: { id: $id, sbomId: $sbomId }) {
      errors
    }
  }
`

// CREATE SBOM TOOL
export const toolCreate = gql`
  mutation toolCreate(
    $sbomId: Uuid!
    $name: String!
    $version: String
    $vendor: String
  ) {
    toolCreate(
      input: {
        sbomId: $sbomId
        name: $name
        version: $version
        vendor: $vendor
      }
    ) {
      tool {
        id
        name
        version
        vendor
        updatedAt
      }
      errors
    }
  }
`

// DELETE SBOM TOOL
export const toolDelete = gql`
  mutation DeletTools($toolID: Uuid!, $sbomID: Uuid!) {
    toolDelete(input: { toolId: $toolID, sbomId: $sbomID }) {
      tool {
        id
        name
        version
        vendor
        updatedAt
      }
      errors
    }
  }
`

export const authorCreate = gql`
  mutation authorCreate(
    $name: String!
    $email: String
    $phone: String
    $sbomId: Uuid!
  ) {
    authorCreate(
      input: { name: $name, email: $email, sbomId: $sbomId, phone: $phone }
    ) {
      author {
        id
        name
        email
        updatedAt
      }
      errors
    }
  }
`

export const authorDelete = gql`
  mutation authorDelete($authorId: Uuid!, $sbomId: Uuid!) {
    authorDelete(input: { authorId: $authorId, sbomId: $sbomId }) {
      author {
        id
        name
        email
        updatedAt
      }
      errors
    }
  }
`
// SBOM SUPPLIER CREATE
export const supplierCreate = gql`
  mutation supplierCreate(
    $sbomId: Uuid!
    $name: String!
    $url: String
    $contactName: String
    $contactEmail: String
  ) {
    sbomSupplierCreate(
      input: {
        sbomId: $sbomId
        name: $name
        url: $url
        contactName: $contactName
        contactEmail: $contactEmail
      }
    ) {
      sbomSupplier {
        id
        name
        contactEmail
        contactName
        updatedAt
      }
      errors
    }
  }
`

// SBOM SUPPLIER UPDATE
export const supplierUpdate = gql`
  mutation supplierUpdate(
    $id: ID!
    $name: String!
    $url: String
    $contactName: String
    $contactEmail: String
  ) {
    sbomSupplierUpdate(
      input: {
        id: $id
        name: $name
        url: $url
        contactName: $contactName
        contactEmail: $contactEmail
      }
    ) {
      sbomSupplier {
        id
        name
        contactEmail
        contactName
      }
      errors
    }
  }
`

// SBOM SUPPLIER UPDATE
export const supplierDelete = gql`
  mutation supplierDelete($id: ID!) {
    sbomSupplierDelete(input: { id: $id }) {
      sbomSupplier {
        id
        name
        contactEmail
        contactName
      }
      errors
    }
  }
`

// COMPONENT SUPPLIER CREARTE
export const addComSupplier = gql`
  mutation addCompSupplier(
    $componentId: Uuid!
    $name: String!
    $url: String
    $contactName: String
    $contactEmail: String
  ) {
    compSupplierCreate(
      input: {
        componentId: $componentId
        name: $name
        url: $url
        contactName: $contactName
        contactEmail: $contactEmail
      }
    ) {
      compSupplier {
        id
        name
        url
        contactEmail
        contactName
      }
      errors
    }
  }
`

// COMPONENT SUPPLIER UPDATE
export const updateComSupplier = gql`
  mutation updateComSupplier(
    $id: Uuid!
    $name: String!
    $url: String
    $contactName: String
    $contactEmail: String
  ) {
    compSupplierUpdate(
      input: {
        id: $id
        name: $name
        url: $url
        contactName: $contactName
        contactEmail: $contactEmail
      }
    ) {
      compSupplier {
        id
        name
        url
        contactEmail
        contactName
      }
      errors
    }
  }
`

// COMPONENT SUPPLIER DELETE
export const deleteComSupplier = gql`
  mutation deleteCompSupplier($id: Uuid!) {
    compSupplierDelete(input: { id: $id }) {
      compSupplier {
        id
        name
        url
        contactEmail
        contactName
      }
      errors
    }
  }
`

export const sbomCreate = gql`
  mutation sbomCreate(
    $projectId: Uuid!
    $spec: String!
    $specVersion: String
    $format: String
    $phases: [PhaseInput!]
    $licenses: LicenseInput
  ) {
    sbomCreate(
      input: {
        projectId: $projectId
        spec: $spec
        phases: $phases
        specVersion: $specVersion
        format: $format
        licenses: $licenses
      }
    ) {
      errors
      sbom {
        id
        creationAt
        lifecycle
        phases
        spec
        specVersion
        updatedAt
      }
    }
  }
`

export const sbomUpdate = gql`
  mutation sbomUpdate(
    $id: Uuid!
    $spec: String!
    $specVersion: String
    $format: String
    $licenses: LicenseInput
    $archived: Boolean
    $promoteToDirect: Boolean
    $generateUniqueId: Boolean
    $moveTo: Uuid
    $stage: String
    $releaseDate: ISO8601Date
    $endOfLifeDate: ISO8601Date
    $endOfSupportDate: ISO8601Date
  ) {
    sbomUpdate(
      input: {
        id: $id
        spec: $spec
        specVersion: $specVersion
        format: $format
        licenses: $licenses
        archived: $archived
        productLifeCycleStage: $stage
        promoteToDirect: $promoteToDirect
        generateUniqueId: $generateUniqueId
        moveTo: $moveTo
        releaseDate: $releaseDate
        endOfLifeDate: $endOfLifeDate
        endOfSupportDate: $endOfSupportDate
      }
    ) {
      errors
      sbom {
        id
      }
    }
  }
`

export const sbomDelete = gql`
  mutation sbomDelete($id: Uuid!) {
    sbomDelete(input: { id: $id }) {
      errors
      sbom {
        id
        updatedAt
      }
    }
  }
`

export const signSbom = gql`
  mutation signSbom(
    $sbomID: Uuid!
    $sig: String!
    $sigType: String!
    $pubKey: String!
  ) {
    sbomSign(
      input: {
        sbomId: $sbomID
        signature: $sig
        signatureType: $sigType
        publicKey: $pubKey
      }
    ) {
      sbom {
        id
        lifecycle
      }
      errors
    }
  }
`

// HEALTH RECHECK
export const recheckHealth = gql`
  mutation recheckHealth($sbomId: ID!, $checkId: String, $compId: ID) {
    checkRerun(
      input: {
        sbomId: $sbomId
        friendlyCheckId: $checkId
        componentId: $compId
      }
    ) {
      errors
    }
  }
`

// CHECK RESULT UPDATE
export const checkResultUpdate = gql`
  mutation checkResultUpdate($id: ID!, $status: String!) {
    checkResultUpdate(input: { id: $id, status: $status }) {
      errors
      checkResult {
        id
        status
        componentId
      }
    }
  }
`

// Mutation to create a api-token for CI/CD
export const createApiToken = gql`
  mutation createApiToken($expiresAt: ISO8601DateTime, $tokenName: String) {
    apiTokenCreate(input: { expiresAt: $expiresAt, tokenName: $tokenName }) {
      apiKey {
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
      errors
    }
  }
`

// Delete Token
export const deleteApiToken = gql`
  mutation deleteApiToken($token: String, $apiKeyId: Uuid) {
    apiTokenDelete(input: { token: $token, apiKeyId: $apiKeyId }) {
      errors
    }
  }
`

// Update Token
export const updateApiToken = gql`
  mutation updateApiToken(
    $id: Uuid!
    $expires: ISO8601DateTime
    $revoked: ISO8601DateTime
    $tokenName: String
  ) {
    apiTokenUpdate(
      input: {
        apiKeyId: $id
        expiresAt: $expires
        revokedAt: $revoked
        tokenName: $tokenName
      }
    ) {
      apiKey {
        id
        rawToken
        tokenMask
        revoked
        expired
        createdAt
        updatedAt
        revokedAt
        expiresAt
      }
      errors
    }
  }
`

// UPDATE PRODUCT COMPONENT VULN VEX
export const updateCompVulnVex = gql`
  mutation updateCompVulnVex(
    $compVulnId: Uuid!
    $vexStatusId: Uuid
    $sbomId: Uuid!
    $propagateVex: Boolean
    $vexJustificationId: Uuid
    $cdxResponseId: Uuid
    $note: String
    $impact: String
    $detail: String
    $action: String
    $fixedIn: String
    $componentVulnCustomFieldAttributes: [ComponentVulnCustomFieldAttributesInput!]
  ) {
    componentVexUpdate(
      input: {
        componentVulnId: $compVulnId
        vexStatusId: $vexStatusId
        currentSbomId: $sbomId
        propagateVex: $propagateVex
        vexJustificationId: $vexJustificationId
        cdxResponseId: $cdxResponseId
        note: $note
        impact: $impact
        detail: $detail
        action: $action
        fixedIn: $fixedIn
        componentVulnCustomFieldAttributes: $componentVulnCustomFieldAttributes
      }
    ) {
      componentVuln {
        id
        vexJustification {
          id
          name
        }
        vexStatus {
          id
          name
        }
        cdxResponse {
          id
          name
        }
        note
        impact
        detail
        actionStmt
        fixedIn
      }
      errors
    }
  }
`

// UPDATE MULTIPLE VULN STATUS
export const updateBulkCompVex = gql`
  mutation updateBulkCompVex(
    $comVulnIds: [Uuid!]!
    $vexStatusId: Uuid!
    $sbomId: Uuid
    $propagateVex: Boolean
    $vexJustificationId: Uuid
    $cdxResponseId: Uuid
    $note: String
    $impact: String
    $detail: String
    $action: String
    $fixedIn: String
    $componentVulnCustomFieldAttributes: [ComponentVulnCustomFieldAttributesInput!]
  ) {
    componentVexBulkUpdate(
      input: {
        componentVulnIds: $comVulnIds
        vexStatusId: $vexStatusId
        currentSbomId: $sbomId
        propagateVex: $propagateVex
        vexJustificationId: $vexJustificationId
        cdxResponseId: $cdxResponseId
        note: $note
        impact: $impact
        detail: $detail
        action: $action
        fixedIn: $fixedIn
        componentVulnCustomFieldAttributes: $componentVulnCustomFieldAttributes
      }
    ) {
      clientMutationId
      errors
      componentVulns {
        id
        vulnId
      }
    }
  }
`

// CREATE COMPONENT RELATION
export const CreateCompRelation = gql`
  mutation CreateCompRelation($from: Uuid!, $to: Uuid!, $relType: String!) {
    componentRelationCreate(
      input: { fromCompId: $from, toCompId: $to, relationType: $relType }
    ) {
      compRelation {
        id
        fromComp {
          id
          name
          version
        }
        toComp {
          id
          name
          version
        }
        relType
        updatedAt
      }
      errors
    }
  }
`

// DELETE COMPONENT RELATION
export const DeleteCompRelation = gql`
  mutation DeleteCompRelation($relId: Uuid!) {
    componentRelationDelete(input: { compRelationId: $relId }) {
      compRelation {
        id
      }
      errors
    }
  }
`

// PROJECT AUT0MATION RULE CREATE
export const AutomationRuleCreate = gql`
  mutation AutomationRuleCreate(
    $name: String
    $active: Boolean
    $projectId: Uuid!
    $description: String
    $checkVersion: String
    $checkComponent: String
    $checkIdentifier: String
    $automationActionsAttributes: [AutomationActionAttributesInput!]
    $automationConditionsAttributes: [AutomationConditionAttributesInput!]
  ) {
    automationRuleCreate(
      input: {
        name: $name
        active: $active
        projectId: $projectId
        description: $description
        checkVersion: $checkVersion
        checkComponent: $checkComponent
        checkIdentifier: $checkIdentifier
        automationConditionsAttributes: $automationConditionsAttributes
        automationActionsAttributes: $automationActionsAttributes
      }
    ) {
      errors
      automationRule {
        id
      }
    }
  }
`

// PROJECT AUT0MATION RULE UPDATE
export const AutomationRuleUpdate = gql`
  mutation AutomationRuleUpdate(
    $id: Uuid!
    $active: Boolean
    $name: String
    $description: String
    $priority: Int
    $automationActionsAttributes: [AutomationActionAttributesInput!]
    $automationConditionsAttributes: [AutomationConditionAttributesInput!]
  ) {
    automationRuleUpdate(
      input: {
        id: $id
        active: $active
        name: $name
        priority: $priority
        description: $description
        automationConditionsAttributes: $automationConditionsAttributes
        automationActionsAttributes: $automationActionsAttributes
      }
    ) {
      automationRule {
        id
      }
      errors
    }
  }
`

// PROJECT AUT0MATION RULE DELETE
export const AutomationRuleDelete = gql`
  mutation AutomationRuleDelete($id: Uuid!) {
    automationRuleDelete(input: { id: $id }) {
      errors
      automationRule {
        id
      }
    }
  }
`

// CREATE SBOM PARTS
export const SbomPartCreate = gql`
  mutation SbomPartCreate($parentSbomId: Uuid!, $partSbomId: Uuid!) {
    sbomPartCreate(
      input: { parentSbomId: $parentSbomId, partSbomId: $partSbomId }
    ) {
      sbomPart {
        id
        sbomId
        partId
        createdAt
        updatedAt
      }
      errors
    }
  }
`

// REMOVE SBOM PARTS
export const SbomPartDelete = gql`
  mutation SbomPartDelete($id: Uuid!) {
    sbomPartDelete(input: { id: $id }) {
      sbomPart {
        id
      }
      errors
    }
  }
`

// UPLOAD PROFILE IMAGE
export const UploadProfileImage = gql`
  mutation UploadProfileImage($userId: ID!, $profileImage: Upload!) {
    userUploadProfileImage(
      input: { userId: $userId, profileImage: $profileImage }
    ) {
      user {
        id
        profileImage {
          url
          filename
          contentType
          byteSize
          checksum
        }
      }
      errors
    }
  }
`

// REGISTER USER
export const RegisterUser = gql`
  mutation RegisterUser(
    $name: String
    $email: String!
    $password: String!
    $passwordConfirmation: String!
    $awsRegistrationToken: String
  ) {
    userRegistration(
      input: {
        name: $name
        email: $email
        password: $password
        passwordConfirmation: $passwordConfirmation
        awsRegistrationToken: $awsRegistrationToken
      }
    ) {
      user {
        name
        email
      }
      errors
      confirmationNeeded
    }
  }
`

// SWITCH ORGANIZATION
export const SwitchOrganization = gql`
  mutation SwitchOrganization($orgId: Uuid!) {
    organizationSwitch(input: { organizationId: $orgId }) {
      token
      errors
    }
  }
`

export const QuitOrganization = gql`
  mutation QuitOrganization($id: Uuid!) {
    organizationUserLeave(input: { organizationId: $id }) {
      organization {
        id
      }
      errors
    }
  }
`

// CREATE ENV
export const EnvCreate = gql`
  mutation EnvCreate(
    $groupId: Uuid!
    $name: String!
    $desc: String
    $enabled: Boolean
  ) {
    projectCreate(
      input: {
        projectGroupId: $groupId
        name: $name
        description: $desc
        enabled: $enabled
      }
    ) {
      errors
      project {
        description
        enabled
        id
        name
        projectGroupId
        updatedAt
      }
    }
  }
`

// CREATE ENV
export const EnvDelete = gql`
  mutation EnvDelete($id: Uuid!) {
    projectDelete(input: { id: $id }) {
      errors
      project {
        id
        name
      }
    }
  }
`

// MUNUAL VULN SCAN
export const ManualVulnScan = gql`
  mutation ManualVulnScan($id: Uuid!) {
    sbomVulnScan(input: { sbomId: $id }) {
      sbom {
        id
      }
      errors
    }
  }
`

// RESEND CONFIRMATION EMAIL
export const UserResendConfirmationEmail = gql`
  mutation UserResendConfirmationEmail($email: String!) {
    userResendConfirmationEmail(input: { email: $email }) {
      errors
      success
    }
  }
`

// CREATE SHARELYNK
export const CreateShareLynk = gql`
  mutation CreateShareLynk(
    $id: [Uuid!]!
    $enabled: Boolean
    $expiresAt: ISO8601DateTime
  ) {
    shareLynkCreate(
      input: { enabled: $enabled, expiresAt: $expiresAt, projectGroupIds: $id }
    ) {
      errors
    }
  }
`

// UPDATE SHARELYNK
export const UpdateShareLynk = gql`
  mutation UpdateShareLynk(
    $linkId: Uuid!
    $id: [Uuid!]!
    $enabled: Boolean
    $expiresAt: ISO8601DateTime
  ) {
    shareLynkUpdate(
      input: {
        shareLynkId: $linkId
        enabled: $enabled
        expiresAt: $expiresAt
        projectGroupIds: $id
      }
    ) {
      errors
    }
  }
`

// DELETE SHARELYNK
export const DeleteSharelynk = gql`
  mutation DeleteSharelynk($id: Uuid!) {
    shareLynkDelete(input: { id: $id }) {
      errors
    }
  }
`

export const CreateLicense = gql`
  mutation CreateLicense(
    $name: String!
    $state: LicensesState!
    $attribution: LicensesObligationStatus
    $copyLeft: LicensesObligationCopyLeft
    $requiresSourceCode: LicensesObligationStatus
    $permitsModifications: LicensesObligationStatus
    $text: String
    $url: String
    $comment: String
    $attributionKeys: [String!]
    $warranty: String
    $governingLaws: String
    $deprecated: Boolean
    $restrictive: Boolean
    $fsfLibre: Boolean
    $osiApproved: Boolean
  ) {
    organizationLicenseCreate(
      input: {
        name: $name
        state: $state
        attribution: $attribution
        copyLeft: $copyLeft
        sourceDistribution: $requiresSourceCode
        modifications: $permitsModifications
        text: $text
        url: $url
        comment: $comment
        attributionKeys: $attributionKeys
        warranty: $warranty
        governingLaws: $governingLaws
        deprecated: $deprecated
        restrictive: $restrictive
        fsfLibre: $fsfLibre
        osiApproved: $osiApproved
      }
    ) {
      errors
    }
  }
`

export const UpdateLicense = gql`
  mutation LicenseUpdate(
    $id: ID!
    $state: LicensesState!
    $attribution: LicensesObligationStatus
    $attributionKeys: [String!]
    $copyLeft: LicensesObligationCopyLeft
    $requiresSourceCode: LicensesObligationStatus
    $permitsModifications: LicensesObligationStatus
    $warranty: String
    $governingLaws: String
    $deprecated: Boolean
    $restrictive: Boolean
    $fsfLibre: Boolean
    $osiApproved: Boolean
  ) {
    organizationLicenseUpdate(
      input: {
        id: $id
        state: $state
        attribution: $attribution
        copyLeft: $copyLeft
        sourceDistribution: $requiresSourceCode
        modifications: $permitsModifications
        attributionKeys: $attributionKeys
        warranty: $warranty
        governingLaws: $governingLaws
        deprecated: $deprecated
        restrictive: $restrictive
        fsfLibre: $fsfLibre
        osiApproved: $osiApproved
      }
    ) {
      errors
    }
  }
`

export const UpdateUserPassword = gql`
  mutation UpdateUserPassword(
    $currentPassword: String!
    $newPassword: String!
    $newPasswordConfirmation: String!
  ) {
    userUpdatePassword(
      input: {
        currentPassword: $currentPassword
        newPassword: $newPassword
        newPasswordConfirmation: $newPasswordConfirmation
      }
    ) {
      errors
      updatedToken
    }
  }
`

export const CreateCompSupportOverride = gql`
  mutation CreateCompSupportOverride(
    $idUri: String!
    $name: String!
    $version: String
    $eol: ISO8601Date
    $eos: ISO8601Date
    $outdated: Boolean
    $deprecated: Boolean
    $enabled: Boolean
  ) {
    componentSupportOverrideCreate(
      input: {
        idUri: $idUri
        productName: $name
        productVersion: $version
        eol: $eol
        eos: $eos
        deprecated: $deprecated
        outdated: $outdated
        enabled: $enabled
      }
    ) {
      componentSupportOverride {
        id
        idUri
        productName
        productVersion
        eol
        eos
        enabled
        deprecated
        outdated
        updatedAt
        createdAt
      }
      errors
    }
  }
`

export const UpdateCompSupportOverride = gql`
  mutation UpdateCompSupportOverride(
    $id: Uuid!
    $idUri: String
    $name: String
    $version: String
    $eol: DateOrEmptyString
    $eos: DateOrEmptyString
    $outdated: Boolean
    $deprecated: Boolean
    $enabled: Boolean
  ) {
    componentSupportOverrideUpdate(
      input: {
        id: $id
        idUri: $idUri
        productName: $name
        productVersion: $version
        eol: $eol
        eos: $eos
        deprecated: $deprecated
        outdated: $outdated
        enabled: $enabled
      }
    ) {
      componentSupportOverride {
        id
        enabled
        idUri
        productName
        productVersion
        eol
        eos
        deprecated
        outdated
        updatedAt
        createdAt
      }
      errors
    }
  }
`

export const DeleteCompSupportOverride = gql`
  mutation DeleteCompSupportOverride($id: Uuid!) {
    componentSupportOverrideDelete(input: { id: $id }) {
      componentSupportOverride {
        id
        enabled
        idUri
        productName
        productVersion
        eol
        eos
        deprecated
        outdated
        updatedAt
        createdAt
      }
      errors
    }
  }
`

// CREATE POLICY
export const PolicyCreate = gql`
  mutation PolicyCreate(
    $name: String!
    $desc: String
    $isEnabled: Boolean
    $operator: PolicyOperatorEnum!
    $resultType: PolicyResultTypeEnum!
    $excludeInternalComponent: Boolean
    $excludePrimaryComponent: Boolean
    $policyRulesAttributes: [PolicyPolicyRuleInput!]
  ) {
    policyCreate(
      input: {
        name: $name
        description: $desc
        isEnabled: $isEnabled
        operator: $operator
        resultType: $resultType
        excludeInternalComponent: $excludeInternalComponent
        excludePrimaryComponent: $excludePrimaryComponent
        policyRulesAttributes: $policyRulesAttributes
      }
    ) {
      policy {
        id
        name
        isEnabled
        operator
        resultType
        policyRules {
          id
          operator
          subject
          value
        }
      }
      errors
    }
  }
`

export const RequestCreate = gql`
  mutation RequestCreate(
    $email: String!
    $productName: String
    $productVersion: String
    $notes: String
  ) {
    requestCreate(
      input: {
        email: $email
        productName: $productName
        productVersion: $productVersion
        notes: $notes
      }
    ) {
      request {
        id
        email
        productName
        productVersion
        requestedAt
        status
      }
      errors
    }
  }
`

export const RequestResend = gql`
  mutation RequestResend($id: Uuid!) {
    requestResend(input: { id: $id }) {
      request {
        id
        email
        productName
        productVersion
        requestedAt
        status
      }
      errors
    }
  }
`

export const RequestCancel = gql`
  mutation RequestCancel($id: Uuid!) {
    requestCancel(input: { id: $id }) {
      request {
        id
        email
        productName
        productVersion
        requestedAt
        status
      }
      errors
    }
  }
`

export const RequestAccept = gql`
  mutation RequestAccept($id: Uuid!, $projectId: Uuid!) {
    requestAccept(input: { id: $id, projectId: $projectId }) {
      request {
        id
        email
        productName
        productVersion
        requestedAt
        status
      }
      errors
    }
  }
`

export const RequestDecline = gql`
  mutation RequestDecline($id: Uuid!, $token: String!) {
    requestDecline(input: { id: $id, token: $token }) {
      request {
        id
        email
        productName
        productVersion
        requestedAt
        status
      }
      errors
    }
  }
`

export const RequestUploadSbom = gql`
  mutation RequestUploadSbom($id: Uuid!, $token: String!, $file: Upload!) {
    requestUploadSbom(input: { id: $id, token: $token, file: $file }) {
      request {
        id
        email
        productName
        productVersion
        requestedAt
        status
      }
      errors
    }
  }
`

export const RequestValidate = gql`
  mutation RequestValidate($id: Uuid!, $token: String!) {
    requestValidate(input: { id: $id, token: $token }) {
      errors
      request {
        id
        email
        productName
        productVersion
        requestedAt
        status
        organization {
          name
        }
        requester {
          name
        }
      }
    }
  }
`

// UPDATE POLICY
export const PolicyUpdate = gql`
  mutation PolicyUpdate(
    $id: Uuid!
    $name: String
    $desc: String
    $isEnabled: Boolean
    $operator: PolicyOperatorEnum
    $resultType: PolicyResultTypeEnum
    $excludeInternalComponent: Boolean
    $excludePrimaryComponent: Boolean
    $policyRulesAttributes: [PolicyPolicyRuleInput!]
  ) {
    policyUpdate(
      input: {
        id: $id
        name: $name
        description: $desc
        isEnabled: $isEnabled
        operator: $operator
        resultType: $resultType
        excludeInternalComponent: $excludeInternalComponent
        excludePrimaryComponent: $excludePrimaryComponent
        policyRulesAttributes: $policyRulesAttributes
      }
    ) {
      policy {
        id
        name
        isEnabled
        operator
        resultType
        policyRules {
          id
          subject
          value
          operator
        }
      }
      errors
    }
  }
`

// DELETE POLICY
export const PolicyDelete = gql`
  mutation PolicyDelete($id: Uuid!) {
    policyDelete(input: { id: $id }) {
      errors
      policy {
        createdAt
        id
        isEnabled
        name
        operator
        organizationId
        resultType
        updatedAt
      }
    }
  }
`

// CREATE POLICY RULE
export const CreatePolicyRule = gql`
  mutation CreatePolicyRule(
    $policyId: Uuid!
    $operator: PolicyRuleOperatorEnum!
    $value: String
    $subject: PolicyRuleSubjectEnum!
  ) {
    policyRuleCreate(
      input: {
        policyId: $policyId
        operator: $operator
        value: $value
        subject: $subject
      }
    ) {
      policyRule {
        createdAt
        id
        operator
        policyId
        subject
        updatedAt
        value
      }
      errors
    }
  }
`

// UPDATE POLICY RULE
export const UpdatePolicyRule = gql`
  mutation UpdatePolicyRule(
    $id: Uuid!
    $policyId: Uuid!
    $operator: PolicyRuleOperatorEnum
    $subject: PolicyRuleSubjectEnum
    $value: String
  ) {
    policyRuleUpdate(
      input: {
        id: $id
        policyId: $policyId
        operator: $operator
        value: $value
        subject: $subject
      }
    ) {
      errors
      policyRule {
        createdAt
        id
        operator
        policyId
        subject
        updatedAt
        value
      }
    }
  }
`

// DELETE POLICY RULE
export const DeletePolicyRule = gql`
  mutation DeletePolicyRule($id: Uuid!) {
    policyRuleDelete(input: { id: $id }) {
      policyRule {
        createdAt
        id
        operator
        policyId
        subject
        updatedAt
        value
      }
      errors
    }
  }
`

// CREATE POLICY EXCLUSION
export const PolicyExclusionCreate = gql`
  mutation PolicyExclusionCreate($policyId: Uuid!, $projectId: Uuid!) {
    policyExclusionCreate(
      input: { policyId: $policyId, projectId: $projectId }
    ) {
      errors
      policyExclusion {
        createdAt
        id
        policyId
        projectId
        updatedAt
      }
    }
  }
`

// DELETE POLICY EXCLUSION
export const DeletePolicyExclusion = gql`
  mutation DeletePolicyExclusion($policyId: Uuid!, $projectId: Uuid!) {
    policyExclusionDelete(
      input: { policyId: $policyId, projectId: $projectId }
    ) {
      errors
      policyExclusion {
        createdAt
        id
        policyId
        projectId
        updatedAt
      }
    }
  }
`

// UPDATE NOTIFICATION PREFERENCE

export const UpdateNotificationPreference = gql`
  mutation NotificationPreferenceUpdate(
    $notificationPreferences: [NotificationPreferenceArguments!]!
    $envId: Uuid
  ) {
    notificationPreferenceUpdate(
      input: {
        notificationPreferences: $notificationPreferences
        envId: $envId
      }
    ) {
      currentNotificationPreference {
        id
      }
    }
  }
`

// SBOM POLICY SCAN
export const SbomPolicyScan = gql`
  mutation SbomPolicyScan($sbomId: Uuid!) {
    sbomPolicyScan(input: { sbomId: $sbomId }) {
      errors
    }
  }
`

export const UpdateNotificationChannel = gql`
  mutation NotificationChannelUpdate(
    $notificationChannels: NotificationChannelInput!
  ) {
    notificationChannelUpdate(
      input: { notificationChannels: $notificationChannels }
    ) {
      success
    }
  }
`

export const UpdateNotificationConfig = gql`
  mutation NotificationConfigUpdate(
    $notificationConfigs: NotificationConfigInput!
  ) {
    notificationConfigUpdate(
      input: { notificationConfigs: $notificationConfigs }
    ) {
      success
    }
  }
`

export const OrganizationManufacturerCreate = gql`
  mutation OrganizationManufacturerCreate(
    $orgName: String!
    $url: String
    $contacts: [OrganizationContactInput!]
  ) {
    organizationManufacturerCreate(
      input: {
        organizationName: $orgName
        url: $url
        organizationContactsAttributes: $contacts
      }
    ) {
      errors
      organizationManufacturer {
        id
      }
    }
  }
`

export const OrganizationManufacturerUpdate = gql`
  mutation OrganizationManufacturerUpdate(
    $id: Uuid!
    $orgName: String!
    $url: String
    $contacts: [OrganizationContactInput!]
  ) {
    organizationManufacturerUpdate(
      input: {
        id: $id
        organizationName: $orgName
        url: $url
        organizationContactsAttributes: $contacts
      }
    ) {
      errors
      organizationManufacturer {
        id
      }
    }
  }
`

export const OrganizationManufacturerDelete = gql`
  mutation OrganizationManufacturerDelete($id: Uuid!) {
    organizationManufacturerDelete(input: { id: $id }) {
      errors
    }
  }
`

export const ComponentVulnUpdate = gql`
  mutation ComponentVulnUpdate(
    $componentVulnId: Uuid!
    $externalUrls: [ExternalUrlInput!]
  ) {
    componentVulnUpdate(
      input: { componentVulnId: $componentVulnId, externalUrls: $externalUrls }
    ) {
      errors
      componentVuln {
        id
      }
    }
  }
`

export const DispositionByParentUpdate = gql`
  mutation DispositionByParentUpdate(
    $componentVulnId: Uuid!
    $externalUrls: [ExternalUrlInput!]
    $sbomId: Uuid!
  ) {
    dispositionByParentUpdate(
      input: {
        currentSbomId: $sbomId
        componentVulnId: $componentVulnId
        externalUrls: $externalUrls
      }
    ) {
      errors
      dispositionByParent {
        externalUrls {
          name
          url
        }
      }
    }
  }
`

export const ComponentVulnVexImport = gql`
  mutation ComponentVulnVexImport(
    $vulnsToImport: [ComponentVulnImportInput!]!
    $toSbomId: ID!
    $fromSbomId: ID!
  ) {
    componentVulnVexImport(
      input: {
        vulnsToImport: $vulnsToImport
        toSbomId: $toSbomId
        fromSbomId: $fromSbomId
      }
    ) {
      errors
      componentVulns {
        id
        vuln {
          vulnId
        }
      }
    }
  }
`

export const CreateJiraConnection = gql`
  mutation CreateJiraConnection(
    $userName: String!
    $apiToken: String!
    $url: String!
  ) {
    jiraConnectionCreate(
      input: { userName: $userName, apiToken: $apiToken, url: $url }
    ) {
      organizationConnection {
        id
        enabled
        connection {
          ... on JiraConnection {
            userName
            apiToken
            url
          }
        }
      }
      errors
    }
  }
`

export const UpdateJiraConnection = gql`
  mutation UpdateJiraConnection(
    $id: ID!
    $userName: String
    $apiToken: String
    $url: String
    $enabled: Boolean
  ) {
    jiraConnectionUpdate(
      input: {
        userName: $userName
        apiToken: $apiToken
        url: $url
        organizationConnectionId: $id
        enabled: $enabled
      }
    ) {
      organizationConnection {
        id
        enabled
        connection {
          ... on JiraConnection {
            userName
            apiToken
            url
          }
        }
      }
      errors
    }
  }
`

export const DeleteJiraConnection = gql`
  mutation DeleteJiraConnection($organizationConnectionId: ID!) {
    jiraConnectionDelete(
      input: { organizationConnectionId: $organizationConnectionId }
    ) {
      errors
      organizationConnection {
        id
      }
    }
  }
`

export const CreateJiraIssue = gql`
  mutation CreateJiraIssue(
    $componentVulnId: ID!
    $projectKey: String!
    $summary: String!
    $description: String!
    $issueTypeId: String!
    $reporter: String!
    $assignee: String
    $labels: [String!]
    $priority: String
    $components: [JSON!]
  ) {
    jiraIssueCreate(
      input: {
        componentVulnId: $componentVulnId
        projectKey: $projectKey
        summary: $summary
        description: $description
        issueTypeId: $issueTypeId
        reporter: $reporter
        assignee: $assignee
        components: $components
        labels: $labels
        priority: $priority
      }
    ) {
      jiraIssueUrl
      errors
    }
  }
`

export const SbomJiraTicketSync = gql`
  mutation SbomJiraTicketSync($sbomId: Uuid!) {
    sbomJiraTicketSync(input: { sbomId: $sbomId }) {
      errors
      success
    }
  }
`

export const CreateBulkJiraIssue = gql`
  mutation CreateBulkJiraIssue(
    $vulnIds: [ID!]!
    $projectKey: String!
    $issueTypeId: String!
    $reporter: String
    $assignee: String
  ) {
    jiraIssueBulkCreate(
      input: {
        componentVulnIds: $vulnIds
        projectKey: $projectKey
        issueTypeId: $issueTypeId
        reporter: $reporter
        assignee: $assignee
      }
    ) {
      results {
        componentVulnId
        errors
        jiraIssueUrl
      }
    }
  }
`

export const CreateSlackConnection = gql`
  mutation CreateSlackConnection(
    $configs: [ConnectionConfigInput!]!
    $org: Boolean!
  ) {
    slackConnectionCreate(input: { configs: $configs, org: $org }) {
      errors
    }
  }
`

export const UpdateSlackConnection = gql`
  mutation UpdateSlackConnection(
    $id: ID!
    $configs: [ConnectionConfigInput!]!
    $org: Boolean!
  ) {
    slackConnectionUpdate(
      input: { configs: $configs, org: $org, hostId: $id }
    ) {
      errors
    }
  }
`

export const DeleteSlackConnection = gql`
  mutation DeleteSlackConnection($id: ID!, $org: Boolean!) {
    slackConnectionDelete(input: { hostId: $id, org: $org }) {
      errors
    }
  }
`

export const CreateTeamsConnection = gql`
  mutation CreateTeamsConnection(
    $configs: [ConnectionConfigInput!]!
    $org: Boolean!
  ) {
    teamsConnectionCreate(input: { configs: $configs, org: $org }) {
      errors
    }
  }
`

export const UpdateTeamsConnection = gql`
  mutation UpdateTeamsConnection(
    $id: ID!
    $configs: [ConnectionConfigInput!]!
    $org: Boolean!
  ) {
    teamsConnectionUpdate(
      input: { configs: $configs, org: $org, hostId: $id }
    ) {
      errors
    }
  }
`

export const DeleteTeamsConnection = gql`
  mutation DeleteTeamsConnection($id: ID!, $org: Boolean!) {
    teamsConnectionDelete(input: { hostId: $id, org: $org }) {
      errors
    }
  }
`

export const CreateEmailConnection = gql`
  mutation CreateEmailConnection(
    $configs: [ConnectionConfigInput!]!
    $org: Boolean!
  ) {
    emailConnectionCreate(input: { configs: $configs, org: $org }) {
      errors
    }
  }
`

export const UpdateEmailConnection = gql`
  mutation UpdateEmailConnection(
    $id: ID!
    $configs: [ConnectionConfigInput!]!
    $org: Boolean!
  ) {
    emailConnectionUpdate(
      input: { configs: $configs, org: $org, hostId: $id }
    ) {
      errors
    }
  }
`

export const DeleteEmailConnection = gql`
  mutation DeleteEmailConnection($id: ID!, $org: Boolean!) {
    emailConnectionDelete(input: { hostId: $id, org: $org }) {
      errors
    }
  }
`

// ORGANIZATION ROLE CREATE
export const OrgRoleCreate = gql`
  mutation OrgRoleCreate($permissions: [String!]!, $name: String!) {
    organizationRoleCreate(input: { permissions: $permissions, name: $name }) {
      errors
      organizationRole {
        createdAt
        id
        isAdmin
        isSystem
        name
        permissions
        updatedAt
      }
    }
  }
`

// UPDATE USER TOUR SETTINGS
export const CurrentUserFlagSet = gql`
  mutation CurrentUserFlagSet($flags: [CurrentUserSupportedFlagsEnum!]!) {
    currentUserFlagSet(input: { flags: $flags }) {
      errors
      currentUserSetting {
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
  }
`

// DELETE ROLE
export const OrganizationRoleDelete = gql`
  mutation OrganizationRoleDelete($id: Uuid!) {
    organizationRoleDelete(input: { id: $id }) {
      organizationRole {
        id
      }
      errors
    }
  }
`

// BULK ROLE UPDATE
export const OrganizationRoleBulkApply = gql`
  mutation OrganizationRoleBulkApply(
    $userIds: [Uuid!]!
    $organizationRoleId: Uuid!
  ) {
    organizationRoleBulkApply(
      input: { organizationRoleId: $organizationRoleId, userIds: $userIds }
    ) {
      errors
      organizationRole {
        id
        name
      }
    }
  }
`

// LABEL

export const LabelCreate = gql`
  mutation LabelCreate($name: String!, $color: String!) {
    labelCreate(input: { color: $color, name: $name }) {
      errors
      label {
        color
        createdAt
        id
        name
        organizationId
        updatedAt
      }
    }
  }
`

export const LabelUpdate = gql`
  mutation LabelUpdate($name: String, $id: Uuid!, $color: String) {
    labelUpdate(input: { id: $id, name: $name, color: $color }) {
      errors
      label {
        color
        createdAt
        id
        name
        organizationId
        updatedAt
      }
    }
  }
`

export const LabelDelete = gql`
  mutation LabelDelete($id: Uuid!) {
    labelDelete(input: { id: $id }) {
      errors
      label {
        color
        createdAt
        id
        name
        organizationId
        updatedAt
      }
    }
  }
`

export const SbomReprocess = gql`
  mutation SbomReprocess($sbomId: Uuid!) {
    sbomReprocess(input: { sbomId: $sbomId }) {
      errors
    }
  }
`

export const EnterpriseUpgradeRequest = gql`
  mutation EnterpriseUpgradeRequest {
    enterpriseUpgradeRequest(input: {}) {
      success
    }
  }
`

export const UpdateCompliance = gql`
  mutation UpdateCompliance($id: Uuid!, $scoreEnabled: Boolean!) {
    organizationComplianceUpdate(
      input: { id: $id, scoreEnabled: $scoreEnabled }
    ) {
      compliance {
        id
        isEnabled
        complianceType
      }
      errors
    }
  }
`

export const UpdateComplianceList = gql`
  mutation UpdateComplianceList($compliances: [OrganizationComplianceInput!]!) {
    organizationComplianceBulkUpdate(input: { compliances: $compliances }) {
      orgCompliances {
        id
        isEnabled
        complianceType
      }
      errors
    }
  }
`

export const CustomVulnCreate = gql`
  mutation CustomVulnCreate(
    $vulnIdentifier: String!
    $desc: String
    $sev: String
    $reportedAt: ISO8601DateTime
    $publishedAt: ISO8601DateTime
    $lastModifiedAt: ISO8601DateTime
    $customVulnSbomsAttributes: [CustomVulnSbomsAttributesInput!]
    $purl: String
    $cpe: String
    $cvssScore: Float
    $cvssVector: String
  ) {
    customVulnCreate(
      input: {
        vulnIdentifier: $vulnIdentifier
        desc: $desc
        sev: $sev
        reportedAt: $reportedAt
        publishedAt: $publishedAt
        lastModifiedAt: $lastModifiedAt
        cpe: $cpe
        purl: $purl
        customVulnSbomsAttributes: $customVulnSbomsAttributes
        cvssScore: $cvssScore
        cvssVector: $cvssVector
      }
    ) {
      errors
      customVuln {
        id
        vulnIdentifier
      }
    }
  }
`

export const CustomVulnUpdate = gql`
  mutation CustomVulnUpdate(
    $id: Uuid!
    $vulnIdentifier: String
    $desc: String
    $sev: String
    $reportedAt: ISO8601DateTime
    $publishedAt: ISO8601DateTime
    $lastModifiedAt: ISO8601DateTime
    $customVulnSbomsAttributes: [CustomVulnSbomsAttributesInput!]
    $purl: String
    $cpe: String
  ) {
    customVulnUpdate(
      input: {
        id: $id
        vulnIdentifier: $vulnIdentifier
        desc: $desc
        sev: $sev
        reportedAt: $reportedAt
        publishedAt: $publishedAt
        lastModifiedAt: $lastModifiedAt
        cpe: $cpe
        purl: $purl
        customVulnSbomsAttributes: $customVulnSbomsAttributes
      }
    ) {
      errors
      customVuln {
        id
        vulnIdentifier
        customVulnSboms {
          id
          sbomId
          componentId
        }
      }
    }
  }
`

export const CustomVulnDelete = gql`
  mutation CustomVulnDelete($id: ID!) {
    customVulnDelete(input: { id: $id }) {
      errors
      customVuln {
        id
        vulnIdentifier
      }
    }
  }
`

export const RuleExecution = gql`
  mutation RuleExecution($sbomId: Uuid!) {
    automationRuleExecution(input: { sbomId: $sbomId }) {
      errors
    }
  }
`

export const UpdateScoreSetting = gql`
  mutation UpdateScoreSetting(
    $ageWeight: Float!
    $communityWeight: Float!
    $securityWeight: Float!
    $contributorThresholdMin: Int!
    $contributorThresholdMax: Int!
    $pkgAgeThreshold: Int
    $repoAgeThreshold: Int
  ) {
    scoreSettingUpdate(
      input: {
        ageWeight: $ageWeight
        communityWeight: $communityWeight
        securityWeight: $securityWeight
        contributorThresholdMax: $contributorThresholdMax
        contributorThresholdMin: $contributorThresholdMin
        pkgAgeThreshold: $pkgAgeThreshold
        repoAgeThreshold: $repoAgeThreshold
      }
    ) {
      scoreSetting {
        ageWeight
        communityWeight
        securityWeight
        contributorThresholdMax
        contributorThresholdMin
        componentAbandonedThreshold
        repoAgeThreshold
        pkgAgeThreshold
      }
      errors
    }
  }
`

export const componentSupportLevelCreate = gql`
  mutation componentSupportLevelCreate(
    $id: Uuid!
    $level: ComponentSupportLevelValues
    $endDate: ISO8601DateTime
    $notes: String
    $retainManualOverrideFor: Int
  ) {
    componentSupportLevelCreate(
      input: {
        componentId: $id
        level: $level
        endDate: $endDate
        notes: $notes
        retainManualOverrideFor: $retainManualOverrideFor
      }
    ) {
      errors
      componentSupportLevel {
        id
        component {
          id
          name
          version
        }
        level
        endDate
        notes
        retainManualOverrideFor
      }
    }
  }
`

export const componentSupportLevelUpdate = gql`
  mutation componentSupportLevelUpdate(
    $id: Uuid!
    $level: ComponentSupportLevelValues
    $endDate: ISO8601DateTime
    $notes: String
    $retainManualOverrideFor: Int
  ) {
    componentSupportLevelUpdate(
      input: {
        id: $id
        level: $level
        endDate: $endDate
        notes: $notes
        retainManualOverrideFor: $retainManualOverrideFor
      }
    ) {
      errors
      componentSupportLevel {
        id
        component {
          id
          name
          version
        }
        level
        endDate
        notes
        retainManualOverrideFor
      }
    }
  }
`

export const ComponentLicenseStatusUpdate = gql`
  mutation ComponentLicenseStatusUpdate(
    $id: Uuid!
    $sbomId: Uuid!
    $licenseStatus: String!
    $licenseNotes: String!
  ) {
    componentLicenseStatusUpdate(
      input: {
        id: $id
        sbomId: $sbomId
        licenseStatus: $licenseStatus
        licenseNotes: $licenseNotes
      }
    ) {
      component {
        id
        licenseStatus
        licensesExp
        licenseNotes
      }
      errors
    }
  }
`

export const ReRunSbomSupportLevel = gql`
  mutation ReRunSbomSupportLevel($sbomId: Uuid!) {
    componentSupportLevelRun(input: { sbomId: $sbomId }) {
      errors
    }
  }
`

export const CreateBitbucketConnection = gql`
  mutation CreateBitbucketConnection($username: String!, $apiToken: String!) {
    bitbucketConnectionCreate(
      input: { userName: $username, apiToken: $apiToken }
    ) {
      organizationConnection {
        id
        enabled
        connection {
          ... on BitbucketConnection {
            userName
            organizationId
          }
        }
      }
      errors
    }
  }
`

export const DeleteBitbucketConnection = gql`
  mutation DeleteBitbucketConnection($id: ID!) {
    bitbucketConnectionDelete(input: { organizationConnectionId: $id }) {
      errors
    }
  }
`

export const BitbucketRepositoryBulkImport = gql`
  mutation BitbucketRepositoryBulkImport(
    $input: BitbucketRepositoryBulkImportInput!
  ) {
    bitbucketRepositoryBulkImport(input: $input) {
      repositories {
        uuid
        name
        fullName
      }
      errors
    }
  }
`

export const UpdateBitbucketWorkspace = gql`
  mutation UpdateBitbucketWorkspace(
    $organizationConnectionId: ID!
    $workspace: String!
  ) {
    bitbucketConnectionUpdate(
      input: {
        organizationConnectionId: $organizationConnectionId
        workspace: $workspace
      }
    ) {
      organizationConnection {
        id
        enabled
      }
      errors
    }
  }
`

export const componentSupportLevelBulkCreate = gql`
  mutation componentSupportLevelBulkCreate(
    $componentIds: [Uuid!]!
    $supportLevel: ComponentSupportLevelValues!
    $endDate: ISO8601DateTime
    $notes: String
    $retainManualOverrideFor: Int
  ) {
    supportLevelsCreate(
      input: {
        componentIds: $componentIds
        supportLevel: $supportLevel
        endDate: $endDate
        notes: $notes
        retainManualOverrideFor: $retainManualOverrideFor
      }
    ) {
      componentSupportLevels {
        id
        level
        endDate
        notes
        retainManualOverrideFor
        component {
          id
          name
          version
        }
      }
      errors
    }
  }
`

export const ComponentSupportLevelBulkUpdate = gql`
  mutation ComponentSupportLevelBulkUpdate(
    $ids: [Uuid!]!
    $level: ComponentSupportLevelValues!
    $endDate: ISO8601DateTime
    $notes: String
    $retainManualOverrideFor: Int
  ) {
    supportLevelsUpdate(
      input: {
        componentIds: $ids
        supportLevel: $level
        endDate: $endDate
        notes: $notes
        retainManualOverrideFor: $retainManualOverrideFor
      }
    ) {
      clientMutationId
      errors
      componentSupportLevels {
        id
      }
    }
  }
`

export const ComponentSupportLevelBulkDelete = gql`
  mutation ComponentSupportLevelBulkDelete($ids: [Uuid!]!) {
    supportLevelsDelete(input: { componentIds: $ids }) {
      deletedIds
      errors
    }
  }
`
export const OrganizationPackageVersionCreate = gql`
  mutation OrganizationPackageVersionCreate(
    $input: OrganizationPackageVersionCreateInput!
  ) {
    organizationPackageVersionCreate(input: $input) {
      organizationPackageVersion {
        id
        copyrightOverride
        createdAt
        licenseOverride
        noticeOverride
        organizationId
        packageVersionId
        updatedAt
      }
      errors
    }
  }
`

export const OrganizationPackageVersionUpdate = gql`
  mutation OrganizationPackageVersionUpdate(
    $input: OrganizationPackageVersionUpdateInput!
  ) {
    organizationPackageVersionUpdate(input: $input) {
      organizationPackageVersion {
        id
        copyrightOverride
        noticeOverride
        licenseOverride
        updatedAt
      }
      errors
      clientMutationId
    }
  }
`

export const OrganizationPackageVersionDelete = gql`
  mutation DeleteOrganizationPackageVersion($id: ID!) {
    organizationPackageVersionDelete(input: { id: $id }) {
      organizationPackageVersion {
        id
      }
      errors
    }
  }
`

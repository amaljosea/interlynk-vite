import { gql } from '@apollo/client'

// ORGANIZATION UPDATE
export const orgUpdate = gql`
  mutation orgUpdate($name: String, $email: String, $url: String) {
    organizationUpdate(input: { name: $name, email: $email, url: $url }) {
      errors
    }
  }
`

// CREATE INTERNAL COMPONENT
export const createOrgComp = gql`
  mutation createOrgComp($match: String!) {
    organizationComponentCreate(input: { matchStr: $match }) {
      organizationComponent {
        matchStr
        updatedAt
        id
      }
      errors
    }
  }
`

// UPDATE INTERNAL COMPONENT
export const updateOrgComp = gql`
  mutation updateOrgComp($id: ID!, $match: String!) {
    organizationComponentUpdate(input: { id: $id, matchStr: $match }) {
      organizationComponent {
        matchStr
        updatedAt
        id
      }
      errors
    }
  }
`

// DELETE INTERNAL COMPONENT
export const deleteOrgComp = gql`
  mutation deleteOrgComp($id: ID!) {
    organizationComponentDelete(input: { id: $id }) {
      organizationComponent {
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

// CREATE USER
export const createOrgUser = gql`
  mutation createOrgUser($name: String!, $email: String!) {
    userCreate(input: { name: $name, email: $email }) {
      errors
      user {
        id
        name
        email
        role
      }
    }
  }
`

// DELETE USER
export const deleteOrgUser = gql`
  mutation deleteOrgUser($id: ID!) {
    userDelete(input: { id: $id }) {
      errors
    }
  }
`

// UPDATE ORG USER
export const updateOrgUser = gql`
  mutation updateOrgUser($id: ID!, $name: String!, $email: String!) {
    userUpdate(input: { id: $id, name: $name, email: $email }) {
      errors
      user {
        id
        name
        email
        role
      }
    }
  }
`

export const OrgConnectorRefresh = gql`
  mutation OrgConnectorRefresh {
    organizationConnectorRefresh(input: {}) {
      errors
    }
  }
`

export const OrgConnectorCreate = gql`
  mutation OrgConnectorCreate(
    $connId: Uuid!
    $name: String!
    $user: String!
    $token: String!
    $enabled: Boolean
    $region: String
  ) {
    organizationConnectorCreate(
      input: {
        connectorId: $connId
        name: $name
        username: $user
        token: $token
        enabled: $enabled
        awsRegion: $region
      }
    ) {
      organizationConnector {
        id
        organizationId
        connectorId
        connector {
          name
        }
        name
        username
        enabled
      }
    }
  }
`

export const OrgConnectorUpdate = gql`
  mutation OrgConnectorUpdate($id: ID!, $name: String, $enabled: Boolean) {
    organizationConnectorUpdate(
      input: { id: $id, name: $name, enabled: $enabled }
    ) {
      organizationConnector {
        id
        organizationId
        connectorId
        connector {
          name
        }
        name
        username
        enabled
      }
    }
  }
`

export const OrgConnectorDelete = gql`
  mutation OrgConnectorDelete($id: ID!) {
    organizationConnectorDelete(input: { id: $id }) {
      organizationConnector {
        id
      }
    }
  }
`

export const scannerUpdate = gql`
  mutation scannerUpdate(
    $id: ID!
    $company: String!
    $name: String!
    $version: String!
    $description: String!
    $releasedAt: ISO8601Date!
  ) {
    scannerUpdate(
      input: {
        id: $id
        company: $company
        name: $name
        version: $version
        description: $description
        releasedAt: $releasedAt
      }
    ) {
      scanner {
        id
        company
        name
        description
        version
      }
    }
  }
`

export const imageCreate = gql`
  mutation orgImageCreate($id: Uuid!, $name: String!) {
    imageCreate(input: { organizationConnectorId: $id, name: $name }) {
      image {
        id
        name
        organizationConnector {
          id
          organizationId
          connectorId
          name
          username
          enabled
        }
        organizationConnectorId
        updatedAt
      }
    }
  }
`

export const ImageUpdate = gql`
  mutation ImageUpdate($id: ID!, $scanEnabled: Boolean, $scanRefresh: Boolean) {
    imageUpdate(
      input: { id: $id, scanEnabled: $scanEnabled, scanRefresh: $scanRefresh }
    ) {
      image {
        id
        name
        updatedAt
      }
      errors
    }
  }
`

export const AddScannerImage = gql`
  mutation AddScannerImage($imageID: Uuid!, $scannerID: Uuid!) {
    imageScannerAdd(input: { imageId: $imageID, scannerId: $scannerID }) {
      imageScanner {
        id
        scanner {
          id
          name
        }
        imageVersion {
          id
          name
          image {
            id
            name
          }
        }
      }
      errors
    }
  }
`

export const RemoveScannerImage = gql`
  mutation RemoveScannerImage($imageID: Uuid!, $scannerID: Uuid!) {
    imageScannerRemove(input: { imageId: $imageID, scannerId: $scannerID }) {
      errors
    }
  }
`

export const imageVersionCreate = gql`
  mutation imageVersionCreate(
    $imageId: Uuid!
    $name: String!
    $size: Int!
    $imageShaId: String!
  ) {
    imageVersionCreate(
      input: {
        imageId: $imageId
        name: $name
        sizeInBytes: $size
        imageShaId: $imageShaId
      }
    ) {
      imageVersion {
        id
        image {
          id
          name
          organizationConnectorId
        }
        imageShaId
        name
        sizeInBytes
        updatedAt
      }
    }
  }
`

export const VexVulnCreate = gql`
  mutation VexVulnCreate(
    $imageVersionID: Uuid!
    $cveID: String!
    $compName: String!
    $compVersion: String!
    $notes: String
    $vexStatusID: Uuid!
    $vexJustificationID: Uuid
    $fixedVersionID: Uuid
  ) {
    vexVulnCreate(
      input: {
        imageVersionId: $imageVersionID
        cveId: $cveID
        compName: $compName
        compVersion: $compVersion
        notes: $notes
        vexJustificationId: $vexJustificationID
        vexStatusId: $vexStatusID
        fixedByImageVersionId: $fixedVersionID
      }
    ) {
      vexVuln {
        id
        cveId
        compName
        compVersion
        fixedByImageVersionId
        fixedByImageVersion {
          name
        }
        vexJustification {
          id
          name
        }
        vexStatus {
          id
          name
        }
      }
      errors
    }
  }
`

export const CreateShareLynk = gql`
  mutation CreateShareLynk(
    $enabled: Boolean
    $emails: [String!]!
    $projects: [Uuid!]
    $images: [Uuid!]
  ) {
    shareLynkCreate(
      input: {
        enabled: $enabled
        shareUsers: $emails
        projectIds: $projects
        imageIds: $images
      }
    ) {
      shareLynk {
        id
        enabled
        contents {
          __typename
          ... on Project {
            id
            name
            description
          }
        }
        shareUsers {
          email
        }
      }
      errors
    }
  }
`

export const UpdateShareLynk = gql`
  mutation UpdateShareLynk(
    $shareLynkId: Uuid!
    $emails: [String!]
    $projects: [Uuid!]
    $images: [Uuid!]
    $enabled: Boolean
  ) {
    shareLynkUpdate(
      input: {
        enabled: $enabled
        shareLynkId: $shareLynkId
        shareUsers: $emails
        projectIds: $projects
        imageIds: $images
      }
    ) {
      shareLynk {
        id
        enabled
        contents {
          __typename
          ... on Project {
            id
            name
            description
          }
        }
        shareUsers {
          email
        }
      }
      errors
    }
  }
`

export const DeleteShareLynk = gql`
  mutation DeleteShareLynk($id: ID!) {
    shareLynkDelete(input: { id: $id }) {
      shareLynk {
        id
      }
      errors
    }
  }
`

export const OrgConnectorValidate = gql`
  mutation OrgConnectorValidate($id: ID!) {
    organizationConnectorValidate(input: { id: $id }) {
      errors
    }
  }
`

export const UpdateImageVersion = gql`
  mutation UpdateImageVersion($id: ID!, $scanRefresh: Boolean) {
    imageVersionUpdate(input: { id: $id, scanRefresh: $scanRefresh }) {
      imageVersion {
        id
        name
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
    $version: String
    $licenses: LicenseInput
    $cpes: [String!]
    $purl: String
    $scope: String
    $primary: Boolean
    $internal: Boolean
  ) {
    componentCreate(
      input: {
        sbomId: $sbomId
        kind: $kind
        name: $name
        version: $version
        licenses: $licenses
        cpes: $cpes
        purl: $purl
        scope: $scope
        primary: $primary
        internal: $internal
      }
    ) {
      component {
        id
        name
        version
        primary
        internal
        purl
        cpes
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
    $licenses: LicenseInput
    $cpes: [String!]
    $purl: String
    $primary: Boolean
    $internal: Boolean
    $uniqueId: Boolean
    $scope: String
  ) {
    componentUpdate(
      input: {
        id: $id
        sbomId: $sbomId
        kind: $kind
        name: $name
        licenses: $licenses
        cpes: $cpes
        purl: $purl
        scope: $scope
        primary: $primary
        internal: $internal
        generateUniqueId: $uniqueId
      }
    ) {
      component {
        id
        name
        version
        kind
        primary
        internal
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
    $sbomID: Uuid!
    $name: String!
    $version: String
    $vendor: String
  ) {
    toolCreate(
      input: {
        sbomId: $sbomID
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

// UPDATE SBOM TOOL
export const toolUpdate = gql`
  mutation UpdateTools(
    $toolID: Uuid!
    $sbomID: Uuid!
    $name: String
    $version: String
    $vendor: String
  ) {
    toolUpdate(
      input: {
        toolId: $toolID
        sbomId: $sbomID
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
  mutation authorCreate($name: String!, $email: String, $sbomId: Uuid!) {
    authorCreate(input: { name: $name, email: $email, sbomId: $sbomId }) {
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

export const authorUpdate = gql`
  mutation authorUpdate($authorId: Uuid!, $name: String, $email: String) {
    authorUpdate(input: { authorId: $authorId, name: $name, email: $email }) {
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
    $licenses: LicenseInput
  ) {
    sbomCreate(
      input: {
        projectId: $projectId
        spec: $spec
        specVersion: $specVersion
        format: $format
        licenses: $licenses
      }
    ) {
      errors
      sbom {
        id
        creationAt
        licenses
        lifecycle
        project {
          name
        }
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
  ) {
    sbomUpdate(
      input: {
        id: $id
        spec: $spec
        specVersion: $specVersion
        format: $format
        licenses: $licenses
      }
    ) {
      errors
      sbom {
        id
        authors {
          name
          email
        }
        creationAt
        licenses
        licensesExp
        licensesCustom
        lifecycle
        project {
          name
        }
        spec
        specVersion
        tools {
          name
          version
        }
        updatedAt
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
  mutation createApiToken($expiresAt: ISO8601DateTime, $notes: String) {
    apiTokenCreate(input: { expiresAt: $expiresAt, notes: $notes }) {
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
        notes
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
    $notes: String
  ) {
    apiTokenUpdate(
      input: {
        apiKeyId: $id
        expiresAt: $expires
        revokedAt: $revoked
        notes: $notes
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
    $vexStatusId: Uuid!
    $vexJustificationId: Uuid
    $cdxResponseId: Uuid
    $note: String
    $impact: String
    $detail: String
    $action: String
    $fixedIn: String
  ) {
    componentVexUpdate(
      input: {
        componentVulnId: $compVulnId
        vexStatusId: $vexStatusId
        vexJustificationId: $vexJustificationId
        cdxResponseId: $cdxResponseId
        note: $note
        impact: $impact
        detail: $detail
        action: $action
        fixedIn: $fixedIn
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

// UPDATE COMPONENT RELATION
export const UpdateCompRelation = gql`
  mutation UpdateCompRelation(
    $relId: Uuid!
    $from: Uuid
    $to: Uuid
    $relType: String
  ) {
    componentRelationUpdate(
      input: {
        compRelationId: $relId
        fromCompId: $from
        toCompId: $to
        relationType: $relType
      }
    ) {
      compRelation {
        id
        fromComp {
          id
          name
        }
        toComp {
          id
          name
        }
        relType
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

// CREATE AUTOMATION
export const CreateAutomation = gql`
  mutation CreateAutomation(
    $projectId: Uuid!
    $applicable: AutoCheckApplicability!
    $condition: AutoCheckCondition!
    $attr: AutoCheckAttrNames!
    $enabled: Boolean!
    $compName: String
    $compVersion: String
    $set: JSON
  ) {
    autoCheckCreate(
      input: {
        projectId: $projectId
        applicability: $applicable
        condition: $condition
        attrName: $attr
        enabled: $enabled
        compName: $compName
        compVersion: $compVersion
        setTo: $set
      }
    ) {
      autoCheck {
        id
        applicability
        condition
        attrName
        enabled
        lookup
        setTo
      }
      errors
    }
  }
`

// UPDATE AUTOMATION
export const UpdateAutomation = gql`
  mutation UpdateAutomation(
    $id: Uuid!
    $projectId: Uuid!
    $condition: AutoCheckCondition!
    $enabled: Boolean!
    $compName: String
    $compVersion: String
    $set: JSON
  ) {
    autoCheckUpdate(
      input: {
        id: $id
        projectId: $projectId
        condition: $condition
        enabled: $enabled
        compName: $compName
        compVersion: $compVersion
        setTo: $set
      }
    ) {
      autoCheck {
        id
        applicability
        condition
        attrName
        enabled
        lookup
        setTo
      }
      errors
    }
  }
`

// DELETE AUTOMATION
export const DeleteAutomation = gql`
  mutation DeleteAutomation($autoCheckId: Uuid!, $projectId: Uuid!) {
    autoCheckDelete(input: { id: $autoCheckId, projectId: $projectId }) {
      autoCheck {
        id
      }
      errors
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

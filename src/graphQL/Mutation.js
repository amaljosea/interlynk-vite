import { gql } from '@apollo/client'

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
        value
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
  mutation UpdateProject($id: Uuid!, $name: String, $desc: String) {
    projectUpdate(input: { id: $id, name: $name, description: $desc }) {
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

export const CreateComponent = gql`
  mutation CreateComponent(
    $id: Uuid!
    $kind: String!
    $name: String!
    $version: String
    $licenses: [String!]
    $cpes: [String!]
    $purl: String
    $primary: Boolean
    $internal: Boolean
  ) {
    componentCreate(
      input: {
        sbomId: $id
        kind: $kind
        name: $name
        version: $version
        licenses: $licenses
        cpes: $cpes
        purl: $purl
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

export const UpdateComponent = gql`
  mutation UpdateComponent(
    $id: Uuid!
    $kind: String
    $name: String
    $licenses: [String!]
    $cpes: [String!]
    $purl: String
    $primary: Boolean
    $internal: Boolean
  ) {
    componentUpdate(
      input: {
        id: $id
        kind: $kind
        name: $name
        licenses: $licenses
        cpes: $cpes
        purl: $purl
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

export const DeleteComponent = gql`
  mutation DeleteComponent($id: Uuid!) {
    componentDelete(input: { id: $id }) {
      errors
    }
  }
`

export const toolCreate = gql`
  mutation toolCreate($name: String!, $sbomId: Uuid!, $version: String!) {
    toolCreate(input: { name: $name, sbomId: $sbomId, version: $version }) {
      tool {
        id
        name
        version
        updatedAt
      }
      errors
    }
  }
`

export const toolUpdate = gql`
  mutation toolUpdate($toolId: ID!, $name: String, $version: String) {
    toolUpdate(input: { toolId: $toolId, name: $name, version: $version }) {
      tool {
        id
        name
        version
        updatedAt
      }
      errors
    }
  }
`

export const toolDelete = gql`
  mutation toolDelete($toolId: Uuid!, $sbomId: Uuid!) {
    toolDelete(input: { toolId: $toolId, sbomId: $sbomId }) {
      tool {
        id
        name
        version
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

export const supplierCreate = gql`
  mutation supplierCreate(
    $name: String!
    $email: String
    $sbomId: Uuid!
    $componentId: Uuid
  ) {
    supplierCreate(
      input: {
        name: $name
        email: $email
        sbomId: $sbomId
        componentId: $componentId
      }
    ) {
      supplier {
        id
        name
        email
        updatedAt
      }
      errors
    }
  }
`

export const supplierUpdate = gql`
  mutation supplierUpdate(
    $name: String
    $email: String
    $supplierId: Uuid!
    $sbomId: Uuid!
    $componentId: Uuid
  ) {
    supplierUpdate(
      input: {
        name: $name
        email: $email
        supplierId: $supplierId
        sbomId: $sbomId
        componentId: $componentId
      }
    ) {
      supplier {
        id
        name
        email
        updatedAt
      }
      errors
    }
  }
`

export const supplierDelete = gql`
  mutation supplierDelete(
    $supplierId: Uuid!
    $sbomId: Uuid!
    $componentId: Uuid
  ) {
    supplierDelete(
      input: {
        supplierId: $supplierId
        sbomId: $sbomId
        componentId: $componentId
      }
    ) {
      supplier {
        id
        name
        email
        updatedAt
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
    $cpes: [String!]
    $purl: String
    $licenses: [String!]
  ) {
    sbomCreate(
      input: {
        projectId: $projectId
        spec: $spec
        specVersion: $specVersion
        format: $format
        cpes: $cpes
        purl: $purl
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
        cpes
        creationAt
        licenses
        lifecycle
        project {
          name
        }
        purl
        spec
        specVersion
        suppliers {
          name
          email
        }
        tools {
          name
          version
        }
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
    $cpes: [String!]
    $purl: String
    $licenses: [String!]
  ) {
    sbomUpdate(
      input: {
        id: $id
        spec: $spec
        specVersion: $specVersion
        format: $format
        cpes: $cpes
        purl: $purl
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
        cpes
        creationAt
        licenses
        lifecycle
        project {
          name
        }
        purl
        spec
        specVersion
        suppliers {
          name
          email
        }
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

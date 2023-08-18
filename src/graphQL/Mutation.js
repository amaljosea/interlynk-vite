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
    $imageVersionID: Uuid!
    $enabled: Boolean
    $emails: [String!]!
    $scanners: [Uuid!]
  ) {
    shareLynkCreate(
      input: {
        imageVersionId: $imageVersionID
        enabled: $enabled
        shareUsers: $emails
        shareScanners: $scanners
      }
    ) {
      shareLynk {
        id
        imageId
        imageVersionId
        enabled
        shareScanners {
          scanner {
            id
            name
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
    $enabled: Boolean
    $emails: [String!]
    $scanners: [Uuid!]
  ) {
    shareLynkUpdate(
      input: {
        shareLynkId: $shareLynkId
        enabled: $enabled
        shareUsers: $emails
        shareScanners: $scanners
      }
    ) {
      shareLynk {
        id
        imageId
        imageVersionId
        enabled
        shareScanners {
          scanner {
            id
            name
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
  mutation uploadSbom($doc: Upload!, $projectId: ID!) {
    sbomUpload(input: { doc: $doc, projectId: $projectId }) {
      errors
    }
  }
`

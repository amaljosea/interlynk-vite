import { useMutation } from '@apollo/client'
import { transformLicenseString } from 'utils'

import { useGlobalState } from 'hooks/useGlobalState'

import { sbomUpdate } from 'graphQL/Mutation'

import { FaScaleBalanced } from 'react-icons/fa6'

import LicenseField from './Licenses/LicenseField'
import LynkModal from './LynkModal'

const LicenseModal = ({ data, isOpen, onClose, activeRow, recheck }) => {
  const { status, sbom } = activeRow || ''
  const resolved = status === 'resolved'
  const { sbomState } = useGlobalState()
  const { expLicense } = sbomState

  const isInvalidLicense = expLicense === ''

  const [updateSbom] = useMutation(sbomUpdate, { onCompleted: () => recheck() })

  const handleUpdateSBOM = () => {
    const licenseObj = sbomState?.licenseString
    const isCustomLicense = licenseObj && licenseObj?.type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(licenseObj?.value)
      : licenseObj?.value || ''

    updateSbom({
      variables: {
        id: data?.id,
        spec: data?.spec,
        licenses: {
          licensesExp: license || ''
        }
      }
    }).then((res) => res?.data && onClose())
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleUpdateSBOM}
      title={`${resolved ? 'View' : 'Add'} License`}
      Icon={FaScaleBalanced}
      disabled={isInvalidLicense}
      hidden={resolved}
      buttonText={'Save'}
    >
      <LicenseField
        sbomView={true}
        resolved={resolved}
        license={status === 'resolved' ? sbom?.licensesExp : ''}
      />
    </LynkModal>
  )
}

export default LicenseModal

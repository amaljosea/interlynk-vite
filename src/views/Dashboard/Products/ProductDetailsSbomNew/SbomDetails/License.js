import { useMutation } from '@apollo/client'
import { isCustomerView, parseLicenseString } from 'utils'
import { transformLicenseString } from 'utils'

import { useDisclosure } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel, TagRightIcon } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'
import ActiveBtn from 'components/Misc/ActiveBtn'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { sbomUpdate } from 'graphQL/Mutation'

import { FaPen, FaScaleBalanced } from 'react-icons/fa6'

import ConfirmationModal from '../../components/ConfirmationModal'

const License = ({ data, permission }) => {
  const customerView = isCustomerView()
  const { showToast } = useCustomToast()
  const { sbomState, dispatch } = useGlobalState()
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const { sbomDispatch } = dispatch

  const { id, spec, license } = data || ''

  const LICENSE = useDisclosure()
  const DELETE_LICENSE = useDisclosure()

  const [updateSbom, { loading }] = useMutation(sbomUpdate)

  const onLicenseOpen = () => {
    sbomDispatch({ type: 'SET_LICENSES', payload: license })
    LICENSE?.onOpen()
  }

  const onUpdateLicense = async () => {
    const licenseObj = sbomState?.licenseString
    const isCustomLicense = licenseObj && licenseObj?.type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(licenseObj?.value)
      : licenseObj?.value || ''

    await updateSbom({
      variables: {
        id: id,
        spec: spec,
        licenses: { licensesExp: license || '' }
      }
    })
      .then((res) => {
        if (res?.data?.sbomUpdate?.errors?.length > 0) {
          showToast({
            description: res.data.sbomUpdate.errors[0],
            status: 'error'
          })
        } else {
          sbomDispatch({ type: 'CLEAR_LICENSES' })
          showToast({
            description: 'Licenses updated successfully',
            status: 'success'
          })
        }
      })
      .catch((error) => {
        showToast({
          description: error?.message || 'Failed to update licenses',
          status: 'error'
        })
      })
      .finally(() => {
        DELETE_LICENSE?.isOpen ? DELETE_LICENSE?.onClose() : LICENSE?.onClose()
      })
  }

  return (
    <>
      {license && license !== '' ? (
        <Tag
          variant='subtle'
          colorScheme='green'
          sx={{ w: 'fit-content', my: 2, h: 7 }}
        >
          <TagLabel>{parseLicenseString(license)}</TagLabel>
          <TagRightIcon
            as={FaPen}
            hidden={permission}
            _hover={{ opacity: 1 }}
            onClick={onLicenseOpen}
            data-testid='edit_license'
            sx={{ fontSize: 12, cursor: 'pointer', opacity: 0.5 }}
          />
          <TagCloseButton
            hidden={permission}
            data-testid='delete_license'
            onClick={DELETE_LICENSE?.onOpen}
          />
        </Tag>
      ) : (
        <ActiveBtn
          title='Add License'
          onClick={onLicenseOpen}
          color={primaryBlueText}
        />
      )}

      {/* SBOM LICENSE MODAL */}
      {LICENSE?.isOpen && (
        <LynkModal
          isLoading={loading}
          Icon={FaScaleBalanced}
          isOpen={LICENSE?.isOpen}
          onClose={LICENSE?.onClose}
          onSubmit={onUpdateLicense}
          disabled={!sbomState?.licenseString}
          buttonText={license !== '' ? 'Update' : 'Save'}
          title={`${license !== '' ? 'Update' : 'Add'} License`}
        >
          <LicenseField
            sbomView={true}
            license={license}
            isDisabled={customerView}
          />
        </LynkModal>
      )}

      {/* LICENSE DELETE MODAL */}
      {DELETE_LICENSE?.isOpen && (
        <ConfirmationModal
          name={license}
          isLoading={loading}
          title={'Remove License'}
          onConfirm={onUpdateLicense}
          isOpen={DELETE_LICENSE?.isOpen}
          onClose={DELETE_LICENSE?.onClose}
          description={`You are about to delete the License : ${license} from this version.`}
        />
      )}
    </>
  )
}

export default License

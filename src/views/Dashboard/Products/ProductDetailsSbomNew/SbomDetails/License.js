import { useMutation } from '@apollo/client'
import { parseLicenseString } from 'utils'
import { transformLicenseString } from 'utils'

import { Flex, useDisclosure } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'
import ActiveBtn from 'components/Misc/ActiveBtn'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { sbomUpdate } from 'graphQL/Mutation'

import ConfirmationModal from '../../components/ConfirmationModal'
import { LuScale } from 'react-icons/lu'

const License = ({ data, permission }) => {
  const { isCustomerView } = useRouteFlags()
  const { showToast } = useCustomToast()
  const { sbomState, dispatch } = useGlobalState()
  const { sbomDispatch } = dispatch

  const { primaryBlueText, sameSecondaryText } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText'
  ])

  const { id, spec, license } = data || ''

  const LICENSE = useDisclosure()
  const DELETE_LICENSE = useDisclosure()

  const [updateSbom, { loading }] = useMutation(sbomUpdate)

  const onLicenseOpen = () => {
    sbomDispatch({ type: 'SET_LICENSES', payload: license })
    LICENSE?.onOpen()
  }

  const onUpdateLicense = async () => {
    const licenseObj =
      sbomState?.license?.length > 0 ? sbomState?.license[0] : null
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
          sbomDispatch({ type: 'CLEAR_LICENSE' })
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
      .finally(() => LICENSE?.onClose())
  }

  const onRemoveLicense = async () => {
    await updateSbom({
      variables: { id: id, spec: spec, licenses: { licensesExp: '' } }
    })
      .then((res) => {
        if (res?.data?.sbomUpdate?.errors?.length > 0) {
          showToast({
            description: res.data.sbomUpdate.errors[0],
            status: 'error'
          })
        } else {
          sbomDispatch({ type: 'CLEAR_LICENSE' })
          showToast({
            description: 'License removed successfully',
            status: 'success'
          })
        }
      })
      .catch((error) => {
        showToast({
          description: error?.message || 'Failed to remove licenses',
          status: 'error'
        })
      })
      .finally(() => DELETE_LICENSE?.onClose())
  }

  const licenseExists = license && license !== ''

  return (
    <>
      <Flex flexWrap={'wrap'} alignItems={'center'} gap={2}>
        {licenseExists && (
          <Tag variant='subtle' colorScheme='green'>
            <TagLabel>{parseLicenseString(license)}</TagLabel>
            <TagCloseButton
              hidden={permission}
              data-testid='delete_license'
              onClick={DELETE_LICENSE?.onOpen}
            />
          </Tag>
        )}
        <ActiveBtn
          hidden={permission}
          label={'edit_license'}
          onClick={onLicenseOpen}
          editable={licenseExists ? true : false}
          title={licenseExists ? 'Update' : 'Add License'}
          color={licenseExists ? sameSecondaryText : primaryBlueText}
        />
      </Flex>

      {/* SBOM LICENSE MODAL */}
      {LICENSE?.isOpen && (
        <LynkModal
          isLoading={loading}
          Icon={LuScale}
          isOpen={LICENSE?.isOpen}
          onClose={LICENSE?.onClose}
          onSubmit={onUpdateLicense}
          disabled={sbomState?.license?.length === 0}
          buttonText={license !== '' ? 'Update' : 'Save'}
          title={`${license !== '' ? 'Update' : 'Add'} License`}
        >
          <LicenseField
            sbomView={true}
            license={license}
            isDisabled={isCustomerView}
          />
        </LynkModal>
      )}

      {/* LICENSE DELETE MODAL */}
      {DELETE_LICENSE?.isOpen && (
        <ConfirmationModal
          name={license}
          isLoading={loading}
          title={'Remove License'}
          onConfirm={onRemoveLicense}
          isOpen={DELETE_LICENSE?.isOpen}
          onClose={DELETE_LICENSE?.onClose}
          description={`You are about to delete the License : ${license} from this version.`}
        />
      )}
    </>
  )
}

export default License

import { useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useState } from 'react'
import { transformLicenseString } from 'utils'

import { FormControl, FormLabel, Textarea } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { OrganizationPackageVersionUpdate } from 'graphQL/Mutation'
import { OrganizationPackageVersionCreate } from 'graphQL/Mutation'

import { LuPackage } from 'react-icons/lu'

const UpdateOverrideModal = ({ isOpen, onClose, data }) => {
  const { id, copyright, notice, organizationPackageVersion, licenseExp } =
    data || ''

  const { tabData } = useContext(TabContext)

  const initialData = { copyright: copyright || '', notice: notice || '' }
  const [formData, setFormData] = useState(initialData)

  const { showToast } = useCustomToast()

  const [createOverride, { loading: creating }] = useMutation(
    OrganizationPackageVersionCreate
  )

  const [updateOverride, { loading: updating }] = useMutation(
    OrganizationPackageVersionUpdate
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateLicense = () => {
    const hasLicense = tabData.details?.licenses?.length > 0
    const isCustomLicense =
      hasLicense && tabData.details.licenses[0].type === 'Custom License'

    const license = isCustomLicense
      ? transformLicenseString(tabData.details.licenses[0].value)
      : tabData.details?.licenses?.[0]?.value || ''

    return license
  }

  const handleUpdateOverride = async () => {
    try {
      const { data } = await updateOverride({
        variables: {
          input: {
            id: organizationPackageVersion?.id,
            copyrightOverride: formData?.copyright,
            noticeOverride: formData?.notice,
            licenseOverride: handleUpdateLicense()
          }
        }
      })

      if (data.organizationPackageVersionUpdate.errors?.length) {
        showToast({
          title: 'Update failed',
          description: data.organizationPackageVersionUpdate.errors.join(', '),
          status: 'error'
        })
      } else {
        showToast({
          title: 'Override updated',
          description: 'The override has been successfully updated.',
          status: 'success'
        })
        onClose()
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.message,
        status: 'error'
      })
    }
  }

  const handleCreateOverride = async () => {
    try {
      const { data } = await createOverride({
        variables: {
          input: {
            packageVersionId: id,
            copyrightOverride: formData?.copyright,
            noticeOverride: formData?.notice,
            licenseOverride: handleUpdateLicense()
          }
        }
      })
      if (data.organizationPackageVersionCreate.errors?.length) {
        showToast({
          title: 'Error creating override',
          description: data.organizationPackageVersionCreate.errors.join(', '),
          status: 'error'
        })
      } else {
        showToast({
          title: 'Override created',
          description: 'The override has been successfully created.',
          status: 'success'
        })
        onClose()
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: error.message,
        status: 'error'
      })
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={
        organizationPackageVersion ? handleUpdateOverride : handleCreateOverride
      }
      title={`${organizationPackageVersion ? 'Update' : 'Create'} Override`}
      Icon={LuPackage}
      buttonText={organizationPackageVersion ? 'Update' : 'Create'}
      isLoading={creating || updating}
    >
      <FormControl>
        <FormLabel>Copyright</FormLabel>
        <Textarea
          name='copyright'
          type='text'
          value={formData?.copyright}
          onChange={handleChange}
          placeholder={`Add Copyright`}
        />
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>Notice</FormLabel>
        <Textarea
          name='notice'
          type='text'
          value={formData?.notice}
          onChange={handleChange}
          placeholder={`Add Notice`}
        />
      </FormControl>
      <FormControl mt={4}>
        <LicenseField sbomView={false} license={licenseExp} />
      </FormControl>
    </LynkModal>
  )
}

export default UpdateOverrideModal

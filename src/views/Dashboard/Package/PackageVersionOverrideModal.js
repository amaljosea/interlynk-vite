import { useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useCallback, useContext, useState } from 'react'
import { transformLicenseString } from 'utils'

import { FormControl, FormLabel, Text, Textarea } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { OrganizationPackageVersionUpdate } from 'graphQL/Mutation'
import { OrganizationPackageVersionCreate } from 'graphQL/Mutation'

import { LuPackage } from 'react-icons/lu'

const PackageVersionOverrideModal = ({ isOpen, onClose, data }) => {
  const {
    id,
    copyright,
    notice,
    organizationPackageVersion,
    licenseExp,
    package: pkg
  } = data
  const { tabData } = useContext(TabContext)
  const { showToast } = useCustomToast()

  const [formData, setFormData] = useState({
    copyright: copyright || '',
    notice: notice || ''
  })

  const [createOverride, { loading: creating }] = useMutation(
    OrganizationPackageVersionCreate
  )
  const [updateOverride, { loading: updating }] = useMutation(
    OrganizationPackageVersionUpdate
  )

  const isUpdating = Boolean(organizationPackageVersion)
  const modalTitle = `${isUpdating ? 'Update' : 'Create'} Override`

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const getLicenseOverride = () => {
    const hasLicense = tabData.details?.licenses?.length > 0
    const license = hasLicense ? tabData.details.licenses[0] : null
    if (license?.type === 'Custom License') {
      return transformLicenseString(license.value)
    }
    return license?.value || ''
  }

  const handleSubmit = async () => {
    const mutation = isUpdating ? updateOverride : createOverride
    const variables = {
      input: {
        ...(isUpdating
          ? { id: organizationPackageVersion.id }
          : { packageVersionId: id }),
        copyrightOverride: formData.copyright,
        noticeOverride: formData.notice,
        licenseOverride: getLicenseOverride()
      }
    }

    try {
      const { data } = await mutation({ variables })
      const responseKey = isUpdating
        ? 'organizationPackageVersionUpdate'
        : 'organizationPackageVersionCreate'
      const response = data[responseKey]

      if (response.errors?.length) {
        showToast({
          title: `${isUpdating ? 'Update' : 'Creation'} failed`,
          description: response.errors.join(', '),
          status: 'error'
        })
      } else {
        showToast({
          title: `Override ${isUpdating ? 'updated' : 'created'}`,
          description: `The override has been successfully ${isUpdating ? 'updated' : 'created'}.`,
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
      onSubmit={handleSubmit}
      title={modalTitle}
      Icon={LuPackage}
      buttonText={isUpdating ? 'Update' : 'Create'}
      isLoading={creating || updating}
    >
      <Text mb={4}>
        {isUpdating ? 'Updating' : 'Creating'} override for{' '}
        <Text as='span' fontStyle='italic'>
          {pkg?.name}
        </Text>
      </Text>

      <FormControl>
        <FormLabel>Copyright</FormLabel>
        <Textarea
          name='copyright'
          value={formData.copyright}
          onChange={handleChange}
          placeholder={`Add Copyright`}
        />
      </FormControl>

      <FormControl mt={4}>
        <FormLabel>Notice</FormLabel>
        <Textarea
          name='notice'
          value={formData.notice}
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

export default PackageVersionOverrideModal

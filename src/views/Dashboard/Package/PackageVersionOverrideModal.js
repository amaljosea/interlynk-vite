import { useMutation } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { transformLicenseString } from 'utils'

import { FormControl, FormLabel, Text, Textarea } from '@chakra-ui/react'

import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import {
  OrganizationPackageVersionCreate,
  OrganizationPackageVersionUpdate
} from 'graphQL/Mutation'

import { LuPackage } from 'react-icons/lu'

const PackageVersionOverrideModal = ({ isOpen, onClose, data, isOverride }) => {
  const { tabData } = useContext(TabContext)
  const { showToast } = useCustomToast()

  const initialData = useMemo(() => {
    if (isOverride) {
      return {
        copyright: data.copyrightOverride || '',
        notice: data.noticeOverride || '',
        license: data.licenseOverride || ''
      }
    }
    return {
      copyright: data.copyright || '',
      notice: data.notice || '',
      license: data.licensesExp || ''
    }
  }, [data, isOverride])

  const [formData, setFormData] = useState({
    copyright: initialData.copyright,
    notice: initialData.notice
  })

  useEffect(() => {
    setFormData({
      copyright: initialData.copyright,
      notice: initialData.notice
    })
  }, [initialData])

  const [createOverride, { loading: creating }] = useMutation(
    OrganizationPackageVersionCreate,
    {
      refetchQueries: ['PackageData']
    }
  )

  const [updateOverride, { loading: updating }] = useMutation(
    OrganizationPackageVersionUpdate,
    {
      refetchQueries: ['PackageData']
    }
  )

  const modalTitle = `${isOverride ? 'Update' : 'Create'} Override`

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const getLicenseOverride = () => {
    const hasLicense = tabData.details?.licenses?.length > 0
    const license = hasLicense ? tabData.details.licenses[0] : null
    if (!license) return ''

    if (license.type === 'Custom License') {
      return transformLicenseString(license.value)
    }
    return license.value || ''
  }

  const handleSubmit = async () => {
    const mutation = isOverride ? updateOverride : createOverride
    const variables = {
      input: {
        ...(isOverride
          ? { id: data.id }
          : { name: data.packageName, version: data.version }),
        copyrightOverride: formData.copyright,
        noticeOverride: formData.notice,
        licenseOverride: getLicenseOverride()
      }
    }

    try {
      const result = await mutation({ variables })
      const responseKey = isOverride
        ? 'organizationPackageVersionUpdate'
        : 'organizationPackageVersionCreate'
      const response = result.data[responseKey]

      if (response.errors?.length) {
        showToast({
          title: `${isOverride ? 'Update' : 'Creation'} failed`,
          description: response.errors.join(', '),
          status: 'error'
        })
      } else {
        showToast({
          title: `Override ${isOverride ? 'updated' : 'created'}`,
          description: `The override has been successfully ${isOverride ? 'updated' : 'created'}.`,
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
      buttonText={isOverride ? 'Update' : 'Create'}
      isLoading={creating || updating}
    >
      <Text mb={4}>
        {isOverride ? 'Updating' : 'Creating'} override for{' '}
        <Text as='span' fontStyle='italic'>
          {data.packageName} ({data.version})
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
        <LicenseField sbomView={false} license={initialData.license} />
      </FormControl>
    </LynkModal>
  )
}

export default PackageVersionOverrideModal

import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'

import { CreateSamlConfig, DeleteSamlConfig } from 'graphQL/Mutation'

import { LuSettings } from 'react-icons/lu'

const SSOConfigModal = ({ isOpen, onClose, data }) => {
  const { showToast } = useCustomToast()

  const updateCon = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'edit_connections'
  })

  const [createConnection, { loading: creating }] = useMutation(
    CreateSamlConfig,
    { refetchQueries: ['getAzureConfig'] }
  )
  const [deleteConnection, { loading: deleting }] = useMutation(
    DeleteSamlConfig,
    { refetchQueries: ['getAzureConfig'] }
  )

  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    metadataUrl: '',
    assertionConsumerServiceUrl: '',
    tenant: ''
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    createConnection({
      variables: { ...formData }
    }).then((res) => {
      if (res?.data?.samlConfigCreate?.errors?.length === 0) {
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: 'Your configuration has been successfully saved.',
          status: 'success'
        })
      } else {
        setError(res?.data?.samlConfigCreate?.errors[0])
      }
    })
  }

  const handleDelete = () => {
    deleteConnection({
      variables: { id: data?.id }
    }).then((res) => {
      if (res?.data?.samlConfigDelete?.errors?.length === 0) {
        onClose()
        showToast({
          title: 'Configuration deleted.',
          description: 'Your configuration has been successfully deleted.',
          status: 'success'
        })
      } else {
        setError(res?.data?.samlConfigDelete?.errors[0])
      }
    })
  }

  useEffect(() => {
    if (data) {
      setFormData({
        metadataUrl: data?.metadataUrl || '',
        assertionConsumerServiceUrl: data?.assertionConsumerServiceUrl || '',
        tenant: data?.tenant || ''
      })
    }
  }, [data])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      Icon={LuSettings}
      disabled={!updateCon}
      isLoading={creating || deleting}
      title={'Azure AD Configuration'}
      buttonColor={data ? 'red' : 'blue'}
      buttonText={data ? 'Delete' : 'Save'}
      onSubmit={data ? handleDelete : handleSave}
    >
      <Stack spacing={4}>
        <FormControl isRequired isDisabled={!updateCon}>
          <FormLabel>Metadata</FormLabel>
          <Input
            name='metadataUrl'
            value={formData?.metadataUrl}
            onChange={handleChange}
            placeholder='Enter meta data URL'
          />
        </FormControl>
        <FormControl isRequired isDisabled={!updateCon}>
          <FormLabel>Assertion Consumer Service</FormLabel>
          <Input
            onChange={handleChange}
            name='assertionConsumerServiceUrl'
            value={formData?.assertionConsumerServiceUrl}
            placeholder='Enter assertion URL'
          />
        </FormControl>
        <FormControl isRequired isDisabled={!updateCon}>
          <FormLabel>Tenant</FormLabel>
          <Input
            name='tenant'
            onChange={handleChange}
            value={formData?.tenant}
            placeholder='Enter tenant name'
          />
        </FormControl>
        {error !== '' && <LynkAlert msg={error} />}
      </Stack>
    </LynkModal>
  )
}

export default SSOConfigModal

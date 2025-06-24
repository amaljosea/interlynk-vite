import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { errorMapping } from 'utils/errorUtils'

import { Flex, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import { CreateProjectGroup, UpdateProjectGroup } from 'graphQL/Mutation'

import { LuBox } from 'react-icons/lu'

const ProductModal = ({ isOpen, onClose, data }) => {
  const { id, name, description } = data || {}

  const refetchQueries = [
    'GetProductTable',
    'GetProjectGroupDetails',
    'GetTotalProduct',
    'GetProjectsVendor'
  ]
  const [projectGroupCreate, { loading: creating }] = useMutation(
    CreateProjectGroup,
    { refetchQueries }
  )
  const [projectGroupUpdate, { loading: updating }] = useMutation(
    UpdateProjectGroup,
    { refetchQueries }
  )

  const initialData = { name: name || '', desc: description || '' }
  const [formData, setFormData] = useState(initialData)
  const [error, setError] = useState('')

  const updateProduct = () => {
    projectGroupUpdate({
      variables: {
        id: id,
        name: formData?.name,
        desc: formData?.desc
      }
    }).then((res) => {
      const error = res?.data?.projectGroupUpdate?.errors
      if (error?.length > 0) {
        setError(res.data.projectGroupUpdate.errors[0])
      } else {
        onClose()
      }
    })
  }

  const handleSave = () => {
    projectGroupCreate({
      variables: {
        enabled: true,
        name: formData?.name,
        desc: formData?.desc
      }
    }).then((res) => {
      const error = res?.data?.projectGroupCreate?.errors
      if (error?.length > 0) {
        setError(error[0])
      } else {
        onClose()
      }
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      Icon={LuBox}
      disabled={error !== ''}
      buttonText={data ? 'Update' : 'Save'}
      isLoading={data ? updating : creating}
      title={`${data ? 'Edit' : 'Add'} Product`}
      onSubmit={data ? updateProduct : handleSave}
    >
      <Flex width={'100%'} direction={'column'} gap={4}>
        {error !== '' && <LynkAlert msg={errorMapping[error] || error} />}
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            name='name'
            type='text'
            value={formData?.name}
            onChange={handleChange}
            placeholder={`Add product name`}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            rows={5}
            name='desc'
            value={formData?.desc}
            onChange={handleChange}
            placeholder={`Add product description`}
          />
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default ProductModal

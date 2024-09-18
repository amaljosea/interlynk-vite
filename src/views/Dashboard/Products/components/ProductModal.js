import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { errorMapping } from 'utils/errorUtils'

import {
  Alert,
  AlertIcon,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { CreateProjectGroup, UpdateProjectGroup } from 'graphQL/Mutation'

import { BiSolidLayerPlus } from 'react-icons/bi'

const ProductModal = ({ isOpen, onClose, data }) => {
  const { id, name, description } = data || ''
  const [projectGroupCreate] = useMutation(CreateProjectGroup)
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  const [productName, setProductName] = useState(name || '')
  const [productDesc, setProductDesc] = useState(description || '')
  const [error, setError] = useState('')

  const updateProduct = () => {
    projectGroupUpdate({
      variables: {
        id: id,
        name: productName,
        desc: productDesc
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
        name: productName,
        desc: productDesc
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

  const onNameChange = (e) => {
    setProductName(e.target.value)
    setError('')
  }
  const onDescChange = (e) => {
    setProductDesc(e.target.value)
    setError('')
  }

  const isInvalid = productName === '' || error !== ''

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={data ? updateProduct : handleSave}
        title={`${data ? 'Edit' : 'Add'} Product`}
        Icon={BiSolidLayerPlus}
        disabled={isInvalid}
        buttonText={data ? 'Update' : 'Save'}
      >
        <Flex width={'100%'} direction={'column'} gap={4}>
          {error !== '' && (
            <Alert status='error' borderRadius={4}>
              <AlertIcon />
              <Text fontSize={'sm'}>{errorMapping[error] || error}</Text>
            </Alert>
          )}
          <FormControl isRequired>
            <FormLabel fontSize={12}>Name</FormLabel>
            <Input
              type='text'
              value={productName}
              onChange={onNameChange}
              placeholder={`Add product name`}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize={12}>Description</FormLabel>
            <Textarea
              rows={5}
              value={productDesc}
              onChange={onDescChange}
              placeholder={`Add product description`}
            />
          </FormControl>
        </Flex>
      </LynkModal>
    </>
  )
}

export default ProductModal

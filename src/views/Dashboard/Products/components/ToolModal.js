import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, FormControl, FormLabel, Input } from '@chakra-ui/react'

import LynkError from 'components/LynkError'
import LynkModal from 'components/LynkModal'

import { toolCreate } from 'graphQL/Mutation'

import { FaWrench } from 'react-icons/fa6'

const TextInput = ({ name, value, onChange, placeholder }) => {
  return (
    <Input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

const ToolModal = ({ isOpen, onClose, resolved = false }) => {
  const params = useParams()
  const [createTool, { loading }] = useMutation(toolCreate)
  const initialData = {
    name: '',
    version: '',
    vendor: ''
  }
  const [toolData, setToolData] = useState(initialData)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setToolData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddTool = () => {
    createTool({
      variables: {
        sbomId: params?.sbomid,
        name: toolData?.name,
        version: toolData?.version,
        vendor: toolData?.vendor
      }
    }).then((res) => {
      if (res?.data?.toolCreate?.errors?.length > 0) {
        setError(res?.data?.toolCreate?.errors[0])
      } else {
        setToolData(initialData)
        onClose()
      }
    })
  }

  return (
    <LynkModal
      isOpen={isOpen}
      Icon={FaWrench}
      onClose={onClose}
      isLoading={loading}
      buttonText={'Save'}
      title={`Add Tools`}
      onSubmit={handleAddTool}
    >
      <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
        {error && <LynkError error={error} />}
        <FormControl isRequired hidden={resolved}>
          <FormLabel htmlFor='vendor'>Vendor Name</FormLabel>
          <TextInput
            name='vendor'
            placeholder='Add vendor'
            value={toolData?.vendor}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl isRequired hidden={resolved}>
          <FormLabel htmlFor='name'>Tool Name</FormLabel>
          <TextInput
            name='name'
            placeholder='Add name'
            value={toolData?.name}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl isRequired hidden={resolved}>
          <FormLabel htmlFor='version'>Version</FormLabel>
          <TextInput
            name='version'
            placeholder='Add version'
            value={toolData?.version}
            onChange={handleChange}
          />
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default ToolModal

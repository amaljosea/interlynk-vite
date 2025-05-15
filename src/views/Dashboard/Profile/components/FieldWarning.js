import { gql, useMutation } from '@apollo/client'
import { useState } from 'react'

import { Stack, Text } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { LuTrash } from 'react-icons/lu'

const DeleteField = gql`
  mutation DeleteField($id: Uuid!) {
    componentVulnCustomFieldDefinitionDelete(input: { id: $id }) {
      errors
      componentVulnCustomFieldDefinition {
        displayName
        id
      }
    }
  }
`

const FieldWarning = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const [deleteField, { loading }] = useMutation(DeleteField)
  const [error, setError] = useState('')

  const handleRemove = () => {
    deleteField({ variables: { id: data?.id } }).then((res) => {
      const { componentVulnCustomFieldDefinitionDelete } = res?.data || ''
      if (componentVulnCustomFieldDefinitionDelete?.errors?.length > 0) {
        setError(componentVulnCustomFieldDefinitionDelete?.errors[0])
      } else {
        showToast({
          description: 'Field deleted successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  return (
    <LynkModal
      Icon={LuTrash}
      isOpen={isOpen}
      onClose={onClose}
      buttonColor='red'
      isLoading={loading}
      buttonText='Remove'
      title={'Remove Field'}
      onSubmit={handleRemove}
    >
      <Stack spacing={4}>
        {error && <LynkAlert msg={error} />}
        <Text fontWeight={300} fontSize={16} lineHeight={'30px'}>
          Are you sure you want to remove the following field from the
          organization ?
        </Text>
        <Text fontSize={16} fontWeight={500}>
          {data?.displayName}
        </Text>
      </Stack>
    </LynkModal>
  )
}

export default FieldWarning

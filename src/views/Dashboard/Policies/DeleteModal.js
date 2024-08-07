import { useMutation } from '@apollo/client'

import { useToast } from '@chakra-ui/react'

import { PolicyDelete } from 'graphQL/Mutation'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const DeleteModal = ({ isOpen, onClose, data }) => {
  const toast = useToast()
  const { id, name } = data
  const [deletePolicy] = useMutation(PolicyDelete)

  const onDeletePolicy = async () => {
    await deletePolicy({ variables: { id } }).then((res) => {
      const errors = res?.data?.policyDelete?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 2000
        })
      } else {
        onClose()
      }
    })
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onDeletePolicy}
      name={name}
      title='Archive Policy'
      description='Archiving this policy will:'
      items={[
        `Disable the execution of this policy on products`,
        `Remove results of this policy's execution from existing products`,
        `Remove this policy from the list of available policies`
      ]}
    />
  )
}

export default DeleteModal

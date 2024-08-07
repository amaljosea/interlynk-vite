import { useMutation } from '@apollo/client'

import { useToast } from '@chakra-ui/react'

import { DeleteCompSupportOverride } from 'graphQL/Mutation'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const DeleteModal = ({ isOpen, onClose, data }) => {
  const { id } = data
  const toast = useToast()
  const [deleteSupport] = useMutation(DeleteCompSupportOverride)

  const onDeleteSupport = async () => {
    await deleteSupport({ variables: { id } }).then((res) => {
      const errors = res?.data?.componentSupportOverrideDelete?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 3000
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
      onConfirm={onDeleteSupport}
      title='Archive Support'
      description='Archiving this entry will:'
      items={['Remove this support detail from existing products']}
    />
  )
}

export default DeleteModal

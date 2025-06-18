import { useMutation } from '@apollo/client'

import useCustomToast from 'hooks/useCustomToast'

import { DeleteCompSupportOverride } from 'graphQL/Mutation'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const DeleteModal = ({ isOpen, onClose, data }) => {
  const { id } = data
  const { showToast } = useCustomToast()
  const [deleteSupport, { loading }] = useMutation(DeleteCompSupportOverride, {
    refetchQueries: ['GetSupportTab']
  })

  const onDeleteSupport = async () => {
    await deleteSupport({ variables: { id } }).then((res) => {
      const errors = res?.data?.componentSupportOverrideDelete?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
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
      isLoading={loading}
      onConfirm={onDeleteSupport}
      title='Delete Support'
      description='Deleting this entry will:'
      items={['Remove this support detail from existing products']}
    />
  )
}

export default DeleteModal

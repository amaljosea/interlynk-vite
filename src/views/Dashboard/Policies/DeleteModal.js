import { useMutation } from '@apollo/client'

import useCustomToast from 'hooks/useCustomToast'

import { PolicyDelete } from 'graphQL/Mutation'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const DeleteModal = ({ isOpen, onClose, data }) => {
  const { showToast } = useCustomToast()
  const { id, name } = data
  const [deletePolicy, { loading }] = useMutation(PolicyDelete)

  const onDeletePolicy = async () => {
    await deletePolicy({ variables: { id } }).then((res) => {
      const errors = res?.data?.policyDelete?.errors
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
      onConfirm={onDeletePolicy}
      name={name}
      isLoading={loading}
      title='Delete Policy'
      description='Deleting this policy will:'
      items={[
        `Disable the execution of this policy on products`,
        `Delete results of this policy's execution from existing products`,
        `Delete this policy from the list of available policies`
      ]}
    />
  )
}

export default DeleteModal

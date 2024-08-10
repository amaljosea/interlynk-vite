import { useMutation } from '@apollo/client'

import useCustomToast from 'hooks/useCustomToast'

import { PolicyUpdate } from 'graphQL/Mutation'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const WarnModal = ({ isOpen, onClose, data }) => {
  const { showToast } = useCustomToast()
  const { id, isEnabled, name } = data
  const [updatePolicy] = useMutation(PolicyUpdate)

  const toggleStatus = async () => {
    await updatePolicy({
      variables: { id: id, isEnabled: isEnabled ? false : true }
    }).then((res) => {
      const errors = res?.data?.policyUpdate?.errors
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

  const status = isEnabled ? 'Disable' : 'Enable'

  const modalProps = {
    isOpen,
    onClose,
    onConfirm: toggleStatus,
    name,
    title: `${status} Policy`,
    description: `${isEnabled ? 'Disabling' : 'Enabling'} this policy will:`,
    items: [
      `${status} the execution of this policy on products`,
      `${isEnabled ? 'Remove' : 'Add'} results of this policy's execution from existing products`
    ]
  }

  return <ConfirmationModal {...modalProps} />
}

export default WarnModal

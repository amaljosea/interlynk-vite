import { useMutation } from '@apollo/client'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateProjectGroup } from 'graphQL/Mutation'

import ConfirmationModal from './ConfirmationModal'

const StatusModal = ({ isOpen, onClose, group }) => {
  const showToast = useCustomToast()

  const { id, enabled, name } = group || {}

  const [projectGroupUpdate, { loading }] = useMutation(UpdateProjectGroup, {
    refetchQueries: ['GetProductTable', 'GetProjectGroupDetails']
  })

  // TOGGLE STATUS
  const toggleStatus = async () => {
    await projectGroupUpdate({
      variables: {
        id: id,
        enabled: enabled === true ? false : true
      }
    }).then((res) => {
      const { errors } = res?.data?.projectGroupUpdate || ''
      if (errors?.length > 0) {
        showToast({
          description: `Unable to change status, please try again.`,
          status: 'error'
        })
        onClose()
      } else {
        onClose()
      }
    })
  }

  const status = enabled ? 'Disable' : 'Enable'

  const modalProps = {
    isOpen,
    onClose,
    onConfirm: toggleStatus,
    name,
    title: `${status} Product`,
    description: `${enabled ? 'Disabling' : 'Enabling'} this product will:`,
    items: [
      `${status} this product, its versions and SBOMs`,
      `${status} access to the product for all users`,
      `${status} uploads of SBOMs to this product`
    ],
    isLoading: loading
  }

  return <ConfirmationModal {...modalProps} />
}

export default StatusModal

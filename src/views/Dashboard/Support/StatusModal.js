import { useMutation } from '@apollo/client'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateCompSupportOverride } from 'graphQL/Mutation'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const StatusModal = ({ isOpen, onClose, data }) => {
  const { showToast } = useCustomToast()
  const { id, enabled } = data
  const [updateSupport, { loading }] = useMutation(UpdateCompSupportOverride, {
    refetchQueries: ['GetSupportTab']
  })

  const onChangeStatus = async () => {
    await updateSupport({
      variables: { id: id, enabled: enabled === true ? false : true }
    }).then((res) => {
      const errors = res?.data?.componentSupportOverrideUpdate?.errors
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

  const status = enabled ? 'Disable' : 'Enable'

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={loading}
      onConfirm={onChangeStatus}
      title={`${status} Support`}
      description={`${enabled ? 'Disabling' : 'Enabling'} this entry will:`}
      items={[`${status} this support detail from existing products`]}
    />
  )
}

export default StatusModal

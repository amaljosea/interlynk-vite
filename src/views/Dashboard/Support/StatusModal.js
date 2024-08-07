import { useMutation } from '@apollo/client'

import { useToast } from '@chakra-ui/react'

import { UpdateCompSupportOverride } from 'graphQL/Mutation'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const StatusModal = ({ isOpen, onClose, data }) => {
  const toast = useToast()
  const { id, enabled } = data
  const [updateSupport] = useMutation(UpdateCompSupportOverride)

  const onChangeStatus = async () => {
    await updateSupport({
      variables: { id: id, enabled: enabled === true ? false : true }
    }).then((res) => {
      const errors = res?.data?.componentSupportOverrideUpdate?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          duration: 2000,
          position: 'top'
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
      onConfirm={onChangeStatus}
      title={`${status} Support`}
      description={`${enabled ? 'Disabling' : 'Enabling'} this entry will:`}
      items={[`${status} this support detail from existing products`]}
    />
  )
}

export default StatusModal

import { useMutation } from '@apollo/client'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { AutomationRuleDelete } from 'graphQL/Mutation'

const DeleteRule = ({ isOpen, onClose, activeRow }) => {
  const { showToast } = useCustomToast()

  const [deleteRule, { loading }] = useMutation(AutomationRuleDelete)

  const handleDelete = async () => {
    await deleteRule({ variables: { id: activeRow?.id } }).then((res) => {
      const errors = res?.data?.automationRuleDelete?.errors
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
      onConfirm={handleDelete}
      title='Archive Automation'
      description='Archiving this entry will:'
      items={['Remove this rule from existing automations']}
    />
  )
}

export default DeleteRule

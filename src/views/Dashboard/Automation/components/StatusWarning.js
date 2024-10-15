import { useMutation } from '@apollo/client'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { AutomationRuleUpdate } from 'graphQL/Mutation'

const StatusWarning = ({ isOpen, onClose, activeRow }) => {
  const { showToast } = useCustomToast()

  const [updateRule] = useMutation(AutomationRuleUpdate, {
    fetchPolicy: 'network-only'
  })

  const { active, name } = activeRow

  const toggleStatus = async () => {
    await updateRule({
      variables: {
        id: activeRow?.id,
        active: activeRow?.active === true ? false : true
      }
    }).then((res) => {
      const errors = res?.data?.automationRuleUpdate?.errors
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
      onConfirm={toggleStatus}
      name={name}
      title={`${active ? 'Disable' : 'Enable'} Rule`}
      description={`${active ? 'Disable' : 'Enable'} this rule will:`}
      items={[
        `${active ? 'Disable' : 'Enable'} the execution of this rule on products`,
        `${active ? 'Remove' : 'Add'} conditions of this rule execution from existing products`
      ]}
    />
  )
}

export default StatusWarning

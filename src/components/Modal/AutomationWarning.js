import { useMutation } from '@apollo/client'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { RuleExecution } from 'graphQL/Mutation'

const AutomationWarning = ({ isOpen, onClose, sbom }) => {
  const { showToast } = useCustomToast()

  const [excuteRule, { loading }] = useMutation(RuleExecution)

  const handleSubmit = () => {
    excuteRule({ variables: { sbomId: sbom?.id } })
      .then((res) => {
        if (res?.data?.automationRuleExecution?.errors?.length === 0) {
          showToast({
            description: 'Automation run successfully',
            status: 'success'
          })
        } else {
          showToast({
            description: res?.data?.automationRuleExecution?.errors[0],
            status: 'error'
          })
        }
      })
      .finally(() => onClose())
  }

  const modalProps = {
    isOpen,
    onClose,
    onConfirm: handleSubmit,
    name: `${sbom?.projectVersion}`,
    title: `Run Automation`,
    description: `Automation is already running on imported SBOMs. Re-running automation on this version will:`,
    items: [
      `Recheck the version for all conditions under Automation Rules`,
      `Apply those automation rules in sequence`
    ]
  }

  return <ConfirmationModal {...modalProps} isLoading={loading} />
}

export default AutomationWarning

import { useMutation } from '@apollo/client'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { ReRunSbomSupportLevel } from 'graphQL/Mutation'

const SupportAnalysis = ({ isOpen, onClose, sbom, productGroup }) => {
  const { showToast } = useCustomToast()

  const [reRunSupport, { loading }] = useMutation(ReRunSbomSupportLevel)

  const handleSubmit = () => {
    reRunSupport({ variables: { sbomId: sbom?.id } })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelRun || {}
        if (!errors) {
          showToast({
            description: 'Support analysis run successfully',
            status: 'success'
          })
        } else {
          showToast({
            description: res?.data?.componentSupportLevelRun?.errors[0],
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
    name: `${productGroup?.name} - ${sbom?.projectVersion}`,
    title: `Rerun Support Analysis`,
    description: `Re-running support analysis on this version will:`,
    items: [
      `Recheck the version for conditions under the Support Level`,
      `Apply actions in the order listed under the Support Level`
    ]
  }

  return <ConfirmationModal {...modalProps} isLoading={loading} />
}

export default SupportAnalysis

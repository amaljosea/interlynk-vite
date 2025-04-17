import { useMutation } from '@apollo/client'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { ProjectSettingUpdate, ReRunSbomSupportLevel } from 'graphQL/Mutation'

const SupportAnalysis = ({ reset, isOpen, onClose, data }) => {
  const { showToast } = useCustomToast()

  const { id, group, sbom } = data || {}

  const [reRunSupport, { loading }] = useMutation(ReRunSbomSupportLevel)
  const [updateSettings] = useMutation(ProjectSettingUpdate, {
    onCompleted: () => reset()
  })

  const updateSupportSetting = () => {
    updateSettings({
      variables: { id: id, enableSupportLevel: true }
    })
  }

  const handleSubmit = () => {
    reRunSupport({ variables: { sbomId: sbom?.id } })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelRun || {}
        if (!errors) {
          updateSupportSetting()
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

  const title = `${group?.name} - ${sbom?.projectVersion}`

  const modalProps = {
    isOpen,
    onClose,
    name: title,

    onConfirm: handleSubmit,
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

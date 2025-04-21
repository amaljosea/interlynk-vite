import { useMutation } from '@apollo/client'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { ProjectSettingUpdate, ReRunSbomSupportLevel } from 'graphQL/Mutation'

const SupportAnalysis = ({ reset, isOpen, onClose, data, enabled }) => {
  const { showToast } = useCustomToast()

  const { id, group, sbom } = data || {}

  const [reRunSupport, { loading }] = useMutation(ReRunSbomSupportLevel)
  const [updateSettings] = useMutation(ProjectSettingUpdate, {
    onCompleted: () => reset()
  })

  const handleRescan = () => {
    reRunSupport({ variables: { sbomId: sbom?.id } })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelRun || {}
        if (!errors) {
          showToast({
            title: 'Analysis run successfully',
            description:
              'Supports will be available shortly. Please refresh to update the records',
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

  const updateSupportSetting = () => {
    updateSettings({ variables: { id: id, enableSupportLevel: true } }).then(
      (res) => res?.data && handleRescan()
    )
  }

  const handleSubmit = () => {
    if (enabled) {
      handleRescan()
    } else {
      updateSupportSetting()
    }
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

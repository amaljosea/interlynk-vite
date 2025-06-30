import { useMutation } from '@apollo/client'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { SbomReprocess } from 'graphQL/Mutation'

const ReprocessSbom = ({ isOpen, onClose, data, projectGroup }) => {
  const { showToast } = useCustomToast()
  const { id, projectVersion } = data || ''

  const [reprocessSbom, { loading }] = useMutation(SbomReprocess, {
    refetchQueries: ['GetVersionsTable', 'GetProjectGroupDetails']
  })

  const onReprocess = () => {
    reprocessSbom({ variables: { sbomId: id } })
      .then((res) => {
        const { errors } = res?.data?.sbomReprocess || {}
        if (errors?.length > 0) {
          showToast({ description: errors[0], status: 'error' })
        } else {
          showToast({
            description: 'SBOM reprocess successfully',
            status: 'success'
          })
        }
      })
      .finally(() => onClose())
  }

  const modalProps = {
    isOpen,
    onClose,
    onConfirm: onReprocess,
    name: `${projectGroup?.name} - ${projectVersion}`,
    title: `Rerun Import`,
    description: `Rerunning import on this version will:`,
    items: [
      `Remove any changes made to this version since its import`,
      `Reprocess the SBOM originally imported to create this version`,
      `Reset the change log to empty`
    ]
  }

  return <ConfirmationModal {...modalProps} isLoading={loading} />
}

export default ReprocessSbom

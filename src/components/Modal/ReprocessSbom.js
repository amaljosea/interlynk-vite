import { useMutation } from '@apollo/client'
import { useState } from 'react'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { SbomReprocess } from 'graphQL/Mutation'

const ReprocessSbom = ({ isOpen, onClose, data, projectGroup }) => {
  const { showToast } = useCustomToast()
  const { id, projectVersion } = data || ''

  const [reprocessSbom] = useMutation(SbomReprocess)

  const [isLoading, setIsLoading] = useState(false)

  const onReprocess = () => {
    setIsLoading(true)
    reprocessSbom({ variables: { sbomId: id } }).then((res) => {
      const { errors } = res?.data?.sbomReprocess || ''
      if (errors?.length > 0) {
        showToast({ description: errors[0], status: 'error' })
        setIsLoading(false)
        onClose()
      } else {
        setIsLoading(false)
        onClose()
      }
    })
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

  return <ConfirmationModal {...modalProps} isLoading={isLoading} />
}

export default ReprocessSbom

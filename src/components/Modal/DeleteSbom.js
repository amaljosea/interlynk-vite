import { useMutation } from '@apollo/client'
import { useState } from 'react'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { sbomDelete } from 'graphQL/Mutation'

const DeleteSbom = ({ isOpen, onClose, data, projectGroup }) => {
  const { showToast } = useCustomToast()
  const { id, projectVersion } = data || ''
  const { setClearSelect } = useGlobalState()

  const [deleteSbom] = useMutation(sbomDelete, {
    refetchQueries: ['GetVersionsTable', 'GetProjectDetails']
  })

  const [isLoading, setIsLoading] = useState(false)

  const onDelete = () => {
    setIsLoading(true)
    deleteSbom({
      variables: {
        id: id
      }
    }).then((res) => {
      const { errors } = res?.data?.sbomDelete || ''
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        setIsLoading(false)
        setClearSelect(true)
        onClose()
      }
    })
  }

  const modalProps = {
    isOpen,
    onClose,
    onConfirm: onDelete,
    name: `${projectGroup?.name} - ${projectVersion}`,
    title: 'Delete Version',
    description: 'Deleting this version will:',
    items: [
      'Remove this version and its SBOM',
      'Remove access to this version for all users'
    ],
    isLoading
  }

  return <ConfirmationModal {...modalProps} />
}

export default DeleteSbom

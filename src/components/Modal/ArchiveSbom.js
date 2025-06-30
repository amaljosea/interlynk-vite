import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { isSbomArchived } from 'utils'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { sbomUpdate } from 'graphQL/Mutation'

const ArchiveSbom = ({ isOpen, onClose, data, projectGroup }) => {
  const { showToast } = useCustomToast()
  const { id, spec, projectVersion } = data || {}
  const { setClearSelect } = useGlobalState()

  const isArchived = isSbomArchived(data)

  const [updateSbom] = useMutation(sbomUpdate, {
    refetchQueries: [
      'GetVersionsTable',
      'GetProjectDetails',
      'GetProjectGroupDetails',
      'GetArchivedVersions'
    ]
  })

  const [isLoading, setIsLoading] = useState(false)

  const onArchive = () => {
    setIsLoading(true)
    updateSbom({
      variables: {
        id,
        spec,
        archived: isArchived ? false : true
      }
    }).then((res) => {
      const { errors } = res?.data?.sbomUpdate || ''
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
    onConfirm: onArchive,
    name: `${projectGroup?.name} - ${projectVersion}`,
    title: `${isArchived ? 'Restore' : 'Archive'} Version`,
    description: `${isArchived ? 'Restoring' : 'Archiving'} this version will:`,
    items: [
      `${isArchived ? 'Add this version to' : 'Remove this version from'} the list`,
      `${isArchived ? 'Enable' : 'Disable'} access to the version for all users`,
      `${isArchived ? 'Enable' : 'Disable'} checks, monitoring and notifications for this version`
    ]
  }

  return <ConfirmationModal {...modalProps} isLoading={isLoading} />
}

export default ArchiveSbom

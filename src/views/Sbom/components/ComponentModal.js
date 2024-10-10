import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import useCustomToast from 'hooks/useCustomToast'

import { DeleteComponent } from 'graphQL/Mutation'

const ComponentModal = ({ isOpen, onClose, activeRow }) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const { id, name } = activeRow

  const [deleteComponent, { loading }] = useMutation(DeleteComponent)

  const handleDelete = () => {
    deleteComponent({
      variables: {
        id: id,
        sbomId: sbomId
      }
    }).then((res) => {
      if (res?.data) {
        showToast({
          status: 'success',
          description: 'Component deleted successfully'
        })
        onClose()
      }
    })
  }

  return (
    <>
      <ConfirmationModal
        name={name}
        isOpen={isOpen}
        onClose={onClose}
        isLoading={loading}
        title='Delete Component'
        onConfirm={handleDelete}
        description='Deleting this component will:'
        items={['Remove it from the list and associated SBOM']}
      />
    </>
  )
}

export default ComponentModal

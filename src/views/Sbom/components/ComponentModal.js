import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import { DeleteComponent } from 'graphQL/Mutation'

const ComponentModal = ({ isOpen, onClose, activeRow }) => {
  const params = useParams()
  const prodId = params.productid
  const sbomId = params.sbomid
  const { id, name } = activeRow

  const [deleteComponent] = useMutation(DeleteComponent)

  const handleDelete = async () => {
    await deleteComponent({
      variables: {
        id: id,
        sbomId: sbomId
      }
    }).then((res) => {
      if (res?.data) {
        onClose()
      }
    })
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDelete}
        name={name}
        title='Delete Component'
        description='Deleting this component will:'
        items={['Remove it from the list and associated SBOM']}
      />
    </>
  )
}

export default ComponentModal

import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

const RelDeleteModal = ({ isOpen, onClose, activeComp, handleRemove }) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleRemove}
      name={`${activeComp?.toComp.name}-${activeComp?.toComp.version}`}
      title='Remove'
      description='This will remove the relationship of this component with other
              components and change the dependency order of this version.'
    />
  )
}

export default RelDeleteModal

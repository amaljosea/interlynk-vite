import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

const RelDeleteModal = ({ isOpen, onClose, activeComp, handleRemove }) => {
  const componentName = `${activeComp?.toComp?.name}${
    activeComp?.toComp?.version ? ` - ${activeComp.toComp.version}` : ''
  }`

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleRemove}
      name={componentName}
      title='Remove'
      description='This will remove the relationship of this component with other
              components and change the dependency order of this version.'
    />
  )
}

export default RelDeleteModal

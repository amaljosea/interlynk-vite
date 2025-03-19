import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

const RelDeleteModal = (props) => {
  const { isOpen, onClose, loading, activeComp, handleRemove } = props
  const { name, version } = activeComp.toComp || activeComp.fromComp

  const componentName = `${name || ''}${version ? ` - ${version}` : ''}`

  return (
    <ConfirmationModal
      title='Remove'
      isOpen={isOpen}
      onClose={onClose}
      isLoading={loading}
      name={componentName}
      onConfirm={handleRemove}
      description='This will remove the relationship of this component with other components and change the dependency order of this version.'
    />
  )
}

export default RelDeleteModal

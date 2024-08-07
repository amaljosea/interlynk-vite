import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

const DeleteWarning = ({ isOpen, onClose, onDelete }) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onDelete}
      title='Archive Automation'
      description='Archiving this entry will:'
      items={['Remove this rule from existing automations']}
    />
  )
}

export default DeleteWarning

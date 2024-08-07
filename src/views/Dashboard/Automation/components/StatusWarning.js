import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

const StatusWarning = ({ isOpen, onClose, data, onToggle }) => {
  const { active, name } = data

  const modalProps = {
    isOpen,
    onClose,
    onConfirm: onToggle,
    name,
    title: `${active ? 'Disable' : 'Enable'} Rule`,
    description: `${active ? 'Disable' : 'Enable'} this rule will:`,
    items: [
      `${active ? 'Disable' : 'Enable'} the execution of this rule on products`,
      `${active ? 'Remove' : 'Add'} conditions of this rule execution from existing products`
    ]
  }

  return <ConfirmationModal {...modalProps} />
}

export default StatusWarning

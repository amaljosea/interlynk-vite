import LynkModal from 'components/LynkModal'

import { FaFileExport } from 'react-icons/fa6'

const ExportRule = (props) => {
  const { isOpen, onClose } = props

  const handleSubmit = () => {}

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export Rules`}
      onSubmit={handleSubmit}
      buttonText={'Export'}
      Icon={FaFileExport}
    ></LynkModal>
  )
}

export default ExportRule

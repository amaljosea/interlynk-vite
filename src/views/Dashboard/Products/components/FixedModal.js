import { CheckCircleIcon } from '@chakra-ui/icons'
import { Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

const FixedModal = ({ isOpen, onClose }) => {
  return (
    <LynkModal
      noFooter
      title={'Fixed'}
      isOpen={isOpen}
      onClose={onClose}
      Icon={CheckCircleIcon}
    >
      <Text>The platform automatically fixed this issue.</Text>
    </LynkModal>
  )
}

export default FixedModal

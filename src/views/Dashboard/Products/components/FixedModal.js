import { CheckCircleIcon } from '@chakra-ui/icons'
import { Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

const FixedModal = ({ isOpen, onClose }) => {
  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'Fixed'}
      noFooter
      Icon={CheckCircleIcon}
    >
      <Text>The platform automatically fixed this issue.</Text>
    </LynkModal>
  )
}

export default FixedModal

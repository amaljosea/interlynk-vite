import { Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { LuCircleCheck } from 'react-icons/lu'

const FixedModal = ({ isOpen, onClose }) => {
  return (
    <LynkModal
      noFooter
      title={'Fixed'}
      isOpen={isOpen}
      onClose={onClose}
      Icon={LuCircleCheck}
    >
      <Text>The platform automatically fixed this issue.</Text>
    </LynkModal>
  )
}

export default FixedModal

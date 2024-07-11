import { motion } from 'framer-motion'

import { Flex } from '@chakra-ui/react'

const MotionFlex = motion(Flex)

const Actions = ({ children }) => {
  return (
    <MotionFlex
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </MotionFlex>
  )
}

export default Actions

import { InfoIcon } from '@chakra-ui/icons'
import { Icon } from '@chakra-ui/react'

const Info = (props) => {
  return <Icon as={InfoIcon} color={'blue.500'} cursor={'pointer'} {...props} />
}

export default Info

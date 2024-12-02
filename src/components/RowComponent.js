import { truncatedValue } from 'utils'

import { Text, useDisclosure } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import ComponentCard from './Misc/ComponentCard'

const RowComponent = ({ content }) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const { name } = content || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  const onView = () => onOpen()

  const getValue = () => {
    if (typeof content === 'string') {
      return truncatedValue(content, 40)
    } else {
      return truncatedValue(name, 40)
    }
  }

  const textStyle = {
    fontSize: 14,
    textColor: primaryBlueText,
    cursor: 'pointer'
  }

  return (
    <>
      <Text {...textStyle} onClick={onView}>
        {getValue()}
      </Text>

      <ComponentCard value={content} isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default RowComponent

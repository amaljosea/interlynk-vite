import { truncatedValue } from 'utils'
import { isCustomerView } from 'utils'

import { Text, useDisclosure } from '@chakra-ui/react'

import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import ComponentCard from './Misc/ComponentCard'

const RowComponent = ({ content }) => {
  const tab = useQueryParam('tab')
  const customerView = isCustomerView()
  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor'
  ])

  const { name } = content || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  const onView = () => (customerView ? null : onOpen())

  const getValue = () => {
    if (typeof content === 'string') {
      return truncatedValue(content, 40)
    } else {
      return truncatedValue(name, 40)
    }
  }

  const textStyle = {
    fontSize: 14,
    textColor: tab === 'licenses' ? primaryTextColor : primaryBlueText,
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

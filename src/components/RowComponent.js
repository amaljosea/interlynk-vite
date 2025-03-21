import { truncatedValue } from 'utils'

import { Tag, TagLabel, Text, useDisclosure } from '@chakra-ui/react'

import useQueryParam from 'hooks/useQueryParam'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import ComponentCard from './Misc/ComponentCard'

const RowComponent = ({ key, content }) => {
  const tab = useQueryParam('tab')
  const { isCustomerView } = useRouteFlags()
  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor'
  ])

  const { name } = content || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  const onView = () => (isCustomerView ? null : onOpen())

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
      {tab === 'licenses' ? (
        <Tag key={key} onClick={onView} cursor={'pointer'}>
          {getValue()}
        </Tag>
      ) : (
        <Text {...textStyle} onClick={onView}>
          {getValue()}
        </Text>
      )}

      {isOpen && (
        <ComponentCard value={content} isOpen={isOpen} onClose={onClose} />
      )}
    </>
  )
}

export default RowComponent

import { useCallback, useMemo } from 'react'
import { truncatedValue } from 'utils'

import { Tag, Text, useDisclosure } from '@chakra-ui/react'

import useQueryParam from 'hooks/useQueryParam'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import ComponentCard from './Misc/ComponentCard'

const RowComponent = ({ content }) => {
  const tab = useQueryParam('tab')
  const { isCustomerView } = useRouteFlags()
  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor'
  ])
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onView = useCallback(() => {
    if (!isCustomerView) onOpen()
  }, [isCustomerView, onOpen])

  const displayValue = useMemo(() => {
    const value = typeof content === 'string' ? content : content?.name || ''
    return truncatedValue(value, 40)
  }, [content])

  const textStyle = {
    fontSize: 14,
    textColor: tab === 'licenses' ? primaryTextColor : primaryBlueText,
    cursor: 'pointer'
  }

  const Element = tab === 'licenses' ? Tag : Text

  return (
    <>
      <Element onClick={onView} {...textStyle}>
        {displayValue}
      </Element>

      {isOpen && (
        <ComponentCard value={content} isOpen={isOpen} onClose={onClose} />
      )}
    </>
  )
}

export default RowComponent

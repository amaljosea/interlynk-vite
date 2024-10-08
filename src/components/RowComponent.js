import { useNavigate } from 'react-router-dom'
import { truncatedValue } from 'utils'

import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Flex, Icon, Text, useDisclosure } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import ComponentCard from './Misc/ComponentCard'

const RowComponent = ({ content }) => {
  console.log('content', content)

  const navigate = useNavigate()
  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const { name } = content || ''

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: 'components'
    }
  })

  const onView = () => onOpen()

  const onCheck = () => {
    if (typeof content === 'string') {
      prodCompDispatch({
        type: 'CHANGE_SEARCH_INPUT',
        payload: content?.split(' ')[0] || ''
      })
      prodCompDispatch({
        type: 'SET_EXPAND',
        payload: content?.split(' ')[0] || ''
      })
      navigate(link)
    } else {
      prodCompDispatch({
        type: 'CHANGE_SEARCH_INPUT',
        payload: name
      })
      prodCompDispatch({ type: 'SET_EXPAND', payload: name })
      navigate(link)
    }
  }

  const getValue = () => {
    if (typeof content === 'string') {
      return truncatedValue(content, 40)
    } else {
      return truncatedValue(name, 40)
    }
  }

  return (
    <>
      <Flex sx={{ gap: 2, alignItems: 'center', cursor: 'pointer' }}>
        <Icon
          as={ExternalLinkIcon}
          onClick={onCheck}
          sx={{ w: '16px', h: '16px', color: primaryBlueText }}
        />
        <Text fontSize={14} textColor={primaryBlueText} onClick={onView}>
          {getValue()}
        </Text>
      </Flex>

      <ComponentCard value={content} isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default RowComponent

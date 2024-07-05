import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ViewIcon } from '@chakra-ui/icons'
import { Flex, Tag, Text, useColorModeValue } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

const MotionFlex = motion(Flex)

const RowComponent = ({ content }) => {
  const navigate = useNavigate()
  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch
  const [isHovered, setIsHovered] = useState(false)
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: 'components',
      expand: true
    }
  })

  const onCheck = () => {
    prodCompDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: content })
    navigate(link)
  }

  return (
    <Tag
      gap={3}
      borderRadius='md'
      cursor={'pointer'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Text textColor={textColor}>
        {isHovered && content?.length > 10
          ? `${content?.substring(0, content?.length - 4)}...`
          : content}
      </Text>
      {isHovered && (
        <MotionFlex
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          <ViewIcon color={'blue.500'} onClick={onCheck} />
        </MotionFlex>
      )}
    </Tag>
  )
}

export default RowComponent

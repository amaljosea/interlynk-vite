import React, { useState } from 'react'
import { truncatedValue } from 'utils'

import { Text, chakra } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const ReadMore = ({ text, maxChars = 300 }) => {
  const [expanded, setExpanded] = useState(false)
  const { secondaryBlueText } = useThemeColor(['secondaryBlueText'])

  if (text === '') return <Text>N/A</Text>

  if (text.length <= maxChars) return <Text>{text}</Text>

  const toggle = () => setExpanded((prev) => !prev)

  return (
    <Text fontSize={'sm'} my={0.5}>
      {expanded ? text : truncatedValue(text, maxChars)}{' '}
      <chakra.span
        cursor={'pointer'}
        color={secondaryBlueText}
        onClick={toggle}
      >
        Read {expanded ? 'less' : 'more'}
      </chakra.span>
    </Text>
  )
}

export default ReadMore

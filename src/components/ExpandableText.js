import React, { useState } from 'react'
import { truncatedValue } from 'utils'

import { Text, chakra } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const ExpandableText = ({ text, maxChars = 300, ...props }) => {
  const [expanded, setExpanded] = useState(false)
  const { primaryTextColor, secondaryBlueText } = useThemeColor([
    'primaryTextColor',
    'secondaryBlueText'
  ])

  if (!text) return

  if (text === '')
    return (
      <Text color={primaryTextColor} {...props}>
        N/A
      </Text>
    )

  if (text?.length <= maxChars)
    return (
      <Text color={primaryTextColor} {...props}>
        {text}
      </Text>
    )

  const toggle = () => setExpanded((prev) => !prev)

  return (
    <Text wordBreak={'break-all'} color={primaryTextColor} {...props}>
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

export default ExpandableText

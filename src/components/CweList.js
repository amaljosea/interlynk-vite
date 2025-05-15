import { Link } from 'react-router-dom'

import { Flex, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CweList = ({ data }) => {
  const { primaryTextColor, primaryBlueText } = useThemeColor([
    'primaryTextColor',
    'primaryBlueText'
  ])

  if (!data || data?.length === 0) return 'N/A'

  return (
    <Flex gap={2} flexWrap={'wrap'}>
      {data.map((item, index) => {
        const number = item?.match(/\d+/)?.[0]
        if (item !== 'NVD-CWE-noinfo' && item !== 'NVD-CWE-Other') {
          return (
            <Link
              key={index}
              target='_blank'
              style={{ color: primaryBlueText }}
              to={`https://cwe.mitre.org/data/definitions/${number}.html`}
            >
              {number && item}
              {index + 1 !== data?.length && ', '}
            </Link>
          )
        } else {
          return (
            <Text key={index} color={primaryTextColor}>
              {item}
              {index + 1 !== data?.length && ', '}
            </Text>
          )
        }
      })}
    </Flex>
  )
}

export default CweList

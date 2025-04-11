import { Link } from 'react-router-dom'

import { Flex } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CweList = ({ data }) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const filteredData = data?.filter(
    (item) => item !== 'NVD-CWE-noinfo' && item !== 'NVD-CWE-Other'
  )

  if (!filteredData || filteredData.length === 0) return 'N/A'

  return (
    <Flex gap={2} flexWrap={'wrap'}>
      {filteredData.map((item, index) => {
        const number = item?.match(/\d+/)?.[0]
        return (
          <Link
            key={index}
            target='_blank'
            style={{ color: primaryBlueText }}
            to={`https://cwe.mitre.org/data/definitions/${number}.html`}
          >
            {number && item}
            {index + 1 !== filteredData.length && ', '}
          </Link>
        )
      })}
    </Flex>
  )
}

export default CweList

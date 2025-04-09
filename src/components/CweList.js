import { Link } from 'react-router-dom'

import { Flex } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const CweList = ({ data }) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  if (data?.length === 0) return 'N/A'

  return (
    <Flex gap={2} flexWrap={'wrap'}>
      {data?.map((item, index) => {
        const number = item?.match(/\d+/)?.[0]
        return (
          <Link
            key={index}
            target='_blank'
            style={{ color: primaryBlueText }}
            to={`https://cwe.mitre.org/data/definitions/${number}.html`}
          >
            {item}
            {index + 1 !== data?.length && ', '}
          </Link>
        )
      })}
    </Flex>
  )
}

export default CweList

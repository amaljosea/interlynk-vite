import { truncatedValue } from 'utils'

import { Tag } from '@chakra-ui/react'

const CompInfo = ({ data }) => {
  const { name, version } = data || ''
  return (
    <Tag
      w={'fit-content'}
      colorScheme='blue'
      aria-label='comp_name'
      wordBreak={'break-all'}
    >
      {truncatedValue(name, 20)} {version && `- ${truncatedValue(version, 20)}`}
    </Tag>
  )
}

export default CompInfo

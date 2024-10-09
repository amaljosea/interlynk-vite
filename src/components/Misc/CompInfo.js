import { truncatedValue } from 'utils'

import { Flex, Tag, Text } from '@chakra-ui/react'

const CompInfo = ({ data }) => {
  const { name, version } = data || ''
  return (
    <Flex columnGap={2} flexWrap={'wrap'} alignContent={'center'}>
      <Text fontSize='sm' fontWeight={'normal'} wordBreak={'break-all'}>
        {truncatedValue(name, 20)}
      </Text>
      <Tag size='sm' colorScheme='blue' hidden={!version}>
        {truncatedValue(version, 20)}
      </Tag>
    </Flex>
  )
}

export default CompInfo

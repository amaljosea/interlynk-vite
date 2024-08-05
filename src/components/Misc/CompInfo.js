import { Flex, Tag, Text } from '@chakra-ui/react'

const CompInfo = ({ data }) => {
  const { name, version } = data || ''
  return (
    <Flex width={'90%'} columnGap={2} flexWrap={'wrap'} alignContent={'center'}>
      <Text fontSize='sm' fontWeight={'normal'} wordBreak={'break-all'}>
        {name}
      </Text>
      <Tag size='sm' colorScheme='blue'>
        {version}
      </Tag>
    </Flex>
  )
}

export default CompInfo

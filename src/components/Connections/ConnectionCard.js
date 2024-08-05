import { CheckIcon } from '@chakra-ui/icons'
import { Button, Flex, Text, useColorModeValue } from '@chakra-ui/react'

import Card from '../Card/Card'

const ConnectionCard = ({
  icon: Icon,
  name,
  onConfigure,
  isConnected,
  color
}) => {
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  return (
    <Card
      height='200px'
      width='200px'
      borderWidth='1px'
      borderRadius='lg'
      overflow='hidden'
      position='relative'
    >
      <Flex align='center' justify='center' direction='column' p={4}>
        <Icon size='40px' color={color} />
        <Text
          pt='20px'
          noOfLines={1}
          fontSize='lg'
          fontWeight='500'
          color={textColor}
        >
          {name}
        </Text>
        <Button colorScheme='blue' size='md' mt='20px' onClick={onConfigure}>
          Configure
        </Button>
        {isConnected && (
          <CheckIcon
            w={8}
            h={8}
            bg={'green.500'}
            color={'white'}
            border={'1px solid #4299E1'}
            rounded={'full'}
            p={'4px'}
            position={'absolute'}
            right={2}
            top={2}
          />
        )}
      </Flex>
    </Card>
  )
}

export default ConnectionCard

import { CheckIcon } from '@chakra-ui/icons'
import { Button, Flex, Text } from '@chakra-ui/react'

import Card from '../Card/Card'

const ConnectionCard = ({
  icon: Icon,
  name,
  onConfigure,
  isConnected,
  color,
  isDisabled
}) => {
  return (
    <Card
      height='200px'
      width='200px'
      borderWidth='1px'
      borderRadius='lg'
      overflow='hidden'
      boxShadow='lg'
      _hover={{ boxShadow: 'xl' }}
      position='relative'
    >
      <Flex align='center' justify='center' direction='column' p={4}>
        <Icon size='40px' color={color} />
        <Text
          noOfLines={1}
          fontSize='lg'
          color='gray.600'
          fontWeight='500'
          pt='20px'
        >
          {name}
        </Text>
        <Button
          colorScheme='blue'
          size='md'
          mt='20px'
          onClick={onConfigure}
          isDisabled={isDisabled}
        >
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

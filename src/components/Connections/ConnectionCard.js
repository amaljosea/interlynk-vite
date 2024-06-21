import { CheckIcon } from '@chakra-ui/icons'
import { Button, Flex, Text } from '@chakra-ui/react'

import Card from '../Card/Card'

const ConnectionCard = ({
  icon: Icon,
  name,
  onConfigure,
  isConnected,
  color
}) => {
  return (
    <Card
      height='200px'
      width='200px'
      borderWidth='1px'
      borderRadius='lg'
      overflow='hidden'
      boxShadow='lg'
    >
      <Flex align='center' justify='center' direction='column'>
        <Icon size='25px' color={color} />
        <Text
          noOfLines={1}
          fontSize='md'
          color='gray.500'
          fontWeight='400'
          pt='20px'
        >
          {name}
        </Text>
        <Button colorScheme='blue' size='sm' mt='30px' onClick={onConfigure}>
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
            right={1}
            top={1}
          />
        )}
      </Flex>
    </Card>
  )
}

export default ConnectionCard

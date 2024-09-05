import { CheckIcon } from '@chakra-ui/icons'
import { Button, Flex, Text, useColorModeValue } from '@chakra-ui/react'

import Card from '../Card/Card'

const ConnectionCard = ({
  icon: Icon,
  iconSrc,
  name,
  onConfigure,
  isConnected,
  description,
  color
}) => {
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  return (
    <Card
      width='320px'
      borderWidth='1px'
      borderRadius='lg'
      overflow='hidden'
      position='relative'
    >
      <Flex direction='column' height='100%' gap={'16px'} mb={2}>
        <Flex align='center'>
          {iconSrc ? (
            <img
              src={iconSrc}
              alt={`${name} icon`}
              width='40px'
              height='40px'
            />
          ) : (
            <Icon color={color} size='40px' />
          )}
          <Text
            ml={3}
            noOfLines={1}
            fontSize='lg'
            fontWeight='500'
            color={textColor}
          >
            {name}
          </Text>
        </Flex>

        <Text fontSize={'12px'} minH={'50px'} maxH={'auto'} color='gray.500'>
          {description}
        </Text>

        {/* Button */}
        <Button
          colorScheme={isConnected ? 'blue' : 'white'}
          size='md'
          width={isConnected ? '150px' : '120px'}
          color={isConnected ? 'white' : 'blue.500'}
          leftIcon={
            isConnected ? (
              <CheckIcon
                w={'20px'}
                h={'20px'}
                color='blue.500'
                bg='white'
                borderRadius='full'
                p={1}
              />
            ) : undefined
          }
          onClick={onConfigure}
          border={!isConnected && '1px solid'}
        >
          {isConnected ? 'Configured' : 'Configure'}
        </Button>
      </Flex>
    </Card>
  )
}

export default ConnectionCard

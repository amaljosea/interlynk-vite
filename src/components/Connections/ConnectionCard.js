import { CheckIcon } from '@chakra-ui/icons'
import { Button, Flex, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

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
  const { primaryTextColor, primaryBlueText } = useThemeColor([
    'primaryTextColor',
    'primaryBlueText'
  ])

  return (
    <Card
      width='320px'
      borderWidth='1px'
      borderRadius='lg'
      overflow='hidden'
      position='relative'
      padding={'20px'}
    >
      <Flex direction='column' height='100%' gap={'16px'}>
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
            ml={'16px'}
            noOfLines={1}
            fontSize='lg'
            fontWeight='500'
            color={primaryTextColor}
          >
            {name}
          </Text>
        </Flex>

        <Text fontSize={'12px'} color='gray.500'>
          {description}
        </Text>

        {/* Button */}
        <Button
          colorScheme={isConnected ? 'blue' : 'white'}
          size='md'
          width={isConnected ? '150px' : '120px'}
          color={isConnected ? 'white' : primaryBlueText}
          bg={isConnected ? primaryBlueText : ''}
          leftIcon={
            isConnected ? (
              <CheckIcon
                w={'20px'}
                h={'20px'}
                color={primaryBlueText}
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

import { CheckCircleIcon } from '@chakra-ui/icons'
import { Button, Flex, Text } from '@chakra-ui/react'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import Card from '../Card/Card'

const ConnectionCard = ({
  iconSrc,
  name,
  onConfigure,
  isConnected,
  description
}) => {
  const { primaryTextColor, secondaryTextInverse } = useThemeColor([
    'primaryTextColor',
    'secondaryTextInverse'
  ])

  const canUpdate = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'create_update_connection'
  })

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
          <img
            src={iconSrc}
            alt={`${name} icon`}
            width={'40px'}
            height='40px'
          />
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

        <Text height={'54px'} fontSize={'12px'} color={secondaryTextInverse}>
          {description}
        </Text>

        {/* Button */}
        <Button
          fontSize='sm'
          title='Configure'
          onClick={onConfigure}
          isDisabled={!canUpdate}
          width={isConnected ? '150px' : '120px'}
          colorScheme={isConnected ? 'blue' : 'gray'}
          leftIcon={isConnected && <CheckCircleIcon />}
        >
          {isConnected ? 'Configured' : 'Configure'}
        </Button>
      </Flex>
    </Card>
  )
}

export default ConnectionCard

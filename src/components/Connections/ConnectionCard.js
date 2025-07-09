import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Image,
  Text
} from '@chakra-ui/react'

import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleCheckBig } from 'react-icons/lu'

const ConnectionCard = ({
  iconSrc,
  name,
  onConfigure,
  isConnected,
  description
}) => {
  const tab = useQueryParam('tab')
  const orgConnections = tab === 'integrations-org'
  const { primaryTextColor, secondaryTextInverse } = useThemeColor([
    'primaryTextColor',
    'secondaryTextInverse'
  ])

  const canUpdate = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'edit_connections'
  })

  return (
    <Card variant={'outline'}>
      <CardHeader pb={0}>
        <Flex align='center'>
          <Image
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
      </CardHeader>
      <CardBody pb={0}>
        <Text fontSize={'sm'} color={secondaryTextInverse}>
          {description}
        </Text>
      </CardBody>
      <CardFooter>
        <Button
          fontSize='sm'
          title='Configure'
          width={'fit-content'}
          onClick={onConfigure}
          isDisabled={orgConnections && !canUpdate}
          colorScheme={isConnected ? 'blue' : 'gray'}
          leftIcon={isConnected && <LuCircleCheckBig size={18} />}
        >
          {isConnected ? 'Configured' : 'Configure'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ConnectionCard

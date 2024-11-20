// Assets
import avatar2 from 'assets/img/avatars/avatar2.png'
import avatar3 from 'assets/img/avatars/avatar3.png'
import avatar4 from 'assets/img/avatars/avatar4.png'
import avatar5 from 'assets/img/avatars/avatar5.png'
import avatar6 from 'assets/img/avatars/avatar6.png'
import React from 'react'

import { Avatar, Button, Flex, Text } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import { useThemeColor } from 'hooks/useThemeColors'

const Conversations = ({ title }) => {
  // Chakra color mode
  const { inverseSecondaryBgColor, secondaryTextInverse, lightTealBorder } =
    useThemeColor([
      'inverseSecondaryBgColor',
      'secondaryTextInverse',
      'lightTealBorder'
    ])

  return (
    <Card p='16px'>
      <CardHeader p='12px 5px' mb='12px'>
        <Text fontSize='lg' color={inverseSecondaryBgColor} fontWeight='bold'>
          {title}
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex direction='column' w='100%'>
          <Flex justifyContent='space-between' mb='21px'>
            <Flex align='center'>
              <Avatar
                src={avatar2}
                w='50px'
                h='50px'
                borderRadius='15px'
                me='10px'
              />
              <Flex direction='column'>
                <Text
                  fontSize='sm'
                  color={inverseSecondaryBgColor}
                  fontWeight='bold'
                >
                  Sophie B.{' '}
                </Text>
                <Text
                  fontSize='xs'
                  color={secondaryTextInverse}
                  fontWeight='400'
                >
                  Hi! I need more information...
                </Text>
              </Flex>
            </Flex>
            <Button title='Reply' p='0px' bg='transparent' variant='no-hover'>
              <Text
                fontSize='sm'
                fontWeight='600'
                color={lightTealBorder}
                alignSelf='center'
              >
                REPLY
              </Text>
            </Button>
          </Flex>
          <Flex justifyContent='space-between' mb='21px'>
            <Flex align='center'>
              <Avatar
                src={avatar3}
                w='50px'
                h='50px'
                borderRadius='15px'
                me='10px'
              />
              <Flex direction='column'>
                <Text
                  fontSize='sm'
                  color={inverseSecondaryBgColor}
                  fontWeight='bold'
                >
                  Sophie B.{' '}
                </Text>
                <Text
                  fontSize='xs'
                  color={secondaryTextInverse}
                  fontWeight='400'
                >
                  Awesome work, can you change...
                </Text>
              </Flex>
            </Flex>
            <Button title='Reply' p='0px' bg='transparent' variant='no-hover'>
              <Text
                fontSize='sm'
                fontWeight='600'
                color={lightTealBorder}
                alignSelf='center'
              >
                REPLY
              </Text>
            </Button>
          </Flex>
          <Flex justifyContent='space-between' mb='21px'>
            <Flex align='center'>
              <Avatar
                src={avatar4}
                w='50px'
                h='50px'
                borderRadius='15px'
                me='10px'
              />
              <Flex direction='column'>
                <Text
                  fontSize='sm'
                  color={inverseSecondaryBgColor}
                  fontWeight='bold'
                >
                  Sophie B.{' '}
                </Text>
                <Text
                  fontSize='xs'
                  color={secondaryTextInverse}
                  fontWeight='400'
                >
                  Have a great afternoon...
                </Text>
              </Flex>
            </Flex>
            <Button title='Reply' p='0px' bg='transparent' variant='no-hover'>
              <Text
                fontSize='sm'
                fontWeight='600'
                color={lightTealBorder}
                alignSelf='center'
              >
                REPLY
              </Text>
            </Button>
          </Flex>
          <Flex justifyContent='space-between' mb='21px'>
            <Flex align='center'>
              <Avatar
                src={avatar5}
                w='50px'
                h='50px'
                borderRadius='15px'
                me='10px'
              />
              <Flex direction='column'>
                <Text
                  fontSize='sm'
                  color={inverseSecondaryBgColor}
                  fontWeight='bold'
                >
                  Sophie B.{' '}
                </Text>
                <Text
                  fontSize='xs'
                  color={secondaryTextInverse}
                  fontWeight='400'
                >
                  About files I can...
                </Text>
              </Flex>
            </Flex>
            <Button title='Reply' p='0px' bg='transparent' variant='no-hover'>
              <Text
                fontSize='sm'
                fontWeight='600'
                color={lightTealBorder}
                alignSelf='center'
              >
                REPLY
              </Text>
            </Button>
          </Flex>
          <Flex justifyContent='space-between' mb='21px'>
            <Flex align='center'>
              <Avatar
                src={avatar6}
                w='50px'
                h='50px'
                borderRadius='15px'
                me='10px'
              />
              <Flex direction='column'>
                <Text
                  fontSize='sm'
                  color={inverseSecondaryBgColor}
                  fontWeight='bold'
                >
                  Sophie B.{' '}
                </Text>
                <Text
                  fontSize='xs'
                  color={secondaryTextInverse}
                  fontWeight='400'
                >
                  About files I can...
                </Text>
              </Flex>
            </Flex>
            <Button title='Reply' p='0px' bg='transparent' variant='no-hover'>
              <Text
                fontSize='sm'
                fontWeight='600'
                color={lightTealBorder}
                alignSelf='center'
              >
                REPLY
              </Text>
            </Button>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default Conversations

import React from 'react'

import { Button, Flex, Icon, Spacer, Text } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'

import { useThemeColor } from 'hooks/useThemeColors'

// react icons
import { BsArrowRight } from 'react-icons/bs'

const BuiltByDevelopers = ({ title, name, description, image }) => {
  const { inverseSecondaryBgColor, secondaryTextColor, lightTealBorder } =
    useThemeColor([
      'inverseSecondaryBgColor',
      'secondaryTextColor',
      'lightTealBorder'
    ])

  return (
    <Card minHeight='290.5px' p='1.2rem'>
      <CardBody w='100%'>
        <Flex flexDirection={{ sm: 'column', lg: 'row' }} w='100%'>
          <Flex
            flexDirection='column'
            h='100%'
            lineHeight='1.6'
            width={{ lg: '45%' }}
          >
            <Text fontSize='sm' color={secondaryTextColor} fontWeight='bold'>
              {title}
            </Text>
            <Text
              fontSize='lg'
              color={inverseSecondaryBgColor}
              fontWeight='bold'
              pb='.5rem'
            >
              {name}
            </Text>
            <Text fontSize='sm' color={secondaryTextColor} fontWeight='normal'>
              {description}
            </Text>
            <Spacer />
            <Flex align='center'>
              <Button
                p='0px'
                title='Read more'
                variant='no-hover'
                bg='transparent'
                my={{ sm: '1.5rem', lg: '0px' }}
              >
                <Text
                  fontSize='sm'
                  color={inverseSecondaryBgColor}
                  fontWeight='bold'
                  cursor='pointer'
                  transition='all .5s ease'
                  my={{ sm: '1.5rem', lg: '0px' }}
                  _hover={{ me: '4px' }}
                >
                  Read more
                </Text>
                <Icon
                  as={BsArrowRight}
                  w='20px'
                  h='20px'
                  fontSize='2xl'
                  transition='all .5s ease'
                  mx='.3rem'
                  cursor='pointer'
                  pt='4px'
                  _hover={{ transform: 'translateX(20%)' }}
                />
              </Button>
            </Flex>
          </Flex>
          <Spacer />
          <Flex
            bg={lightTealBorder}
            align='center'
            justify='center'
            borderRadius='15px'
            width={{ lg: '40%' }}
            minHeight={{ sm: '250px' }}
          >
            {image}
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default BuiltByDevelopers

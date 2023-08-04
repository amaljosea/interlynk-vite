// Chakra imports
import { Avatar, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'

const Header = ({
  selectedTab,
  setSelectedTab,
  avatarImage,
  name,
  email,
  tabs
}) => {
  // Chakra color mode
  const textColor = useColorModeValue('gray.700', 'white')

  const emailColor = useColorModeValue('gray.400', 'gray.300')

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card mb='6'>
        <CardBody>
          {/* user info */}
          <Flex
            align='center'
            mb={{ sm: '10px', md: '0px' }}
            direction={{ sm: 'column', md: 'row' }}
            w={{ sm: '100%' }}
            textAlign={{ sm: 'center', md: 'start' }}
          >
            <Avatar
              me={{ md: '22px' }}
              src={avatarImage}
              w='80px'
              h='80px'
              borderRadius='15px'
            />
            <Flex direction='column' maxWidth='100%' my={{ sm: '14px' }}>
              <Text
                fontSize={{ sm: 'lg', lg: 'xl' }}
                color={textColor}
                fontWeight='bold'
                ms={{ sm: '8px', md: '0px' }}
              >
                {name}
              </Text>
              <Text
                fontSize={{ sm: 'sm', md: 'md' }}
                color={emailColor}
                fontWeight='semibold'
              >
                {email}
              </Text>
            </Flex>
          </Flex>
          {/* tabs */}
          <Flex
            direction={{ sm: 'column', lg: 'row' }}
            w={{ sm: '100%', md: '50%', lg: 'auto' }}
            gap={2}
          >
            {tabs.map((tab, index) => (
              <Button
                key={index}
                onClick={() => setSelectedTab(tab.name)}
                variant={`${selectedTab == tab.name ? 'solid' : 'outline'}`}
                colorScheme='blue'
              >
                <Flex align='center' justifyContent='center'>
                  <tab.icon
                    color={`${selectedTab == tab.name ? 'white' : '#3182CE'}`}
                    w='100%'
                    h='100%'
                  />
                  <Text fontSize='xs' fontWeight='bold' ms='6px'>
                    {tab.name}
                  </Text>
                </Flex>
              </Button>
            ))}
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default Header

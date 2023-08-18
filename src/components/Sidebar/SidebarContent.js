/*eslint-disable*/
// chakra imports
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Center,
  Flex,
  Stack,
  Text,
  useColorModeValue,
  Link,
  Tooltip
} from '@chakra-ui/react'
import IconBox from 'components/Icons/IconBox'
import { InterlynkLogo } from 'components/Icons/Icons'
import { Separator } from 'components/Separator/Separator'
import { SidebarHelp } from 'components/Sidebar/SidebarHelp'
import GlobalContext from 'context/GlobalContext'
import { useContext, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// this function creates the links and collapses that appear in the sidebar (left menu)

const SidebarContent = ({ logoText, routes }) => {
  const { minimize, setMinimize } = useContext(GlobalContext)
  // to check for active links and opened collapses
  let location = useLocation()
  // this is for the rest of the collapses
  const [state, setState] = useState({})

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    if (routeName === '/customer/') {
      return 'active'
    } else {
      return location.pathname === routeName ? 'active' : ''
    }
  }
  const createLinks = (routes) => {
    // Chakra Color Mode
    const activeBg = useColorModeValue('white', 'gray.700')
    const inactiveBg = useColorModeValue('white', 'gray.700')
    const activeColor = useColorModeValue('gray.700', 'white')
    const inactiveColor = useColorModeValue('gray.400', 'gray.400')

    return routes.map((prop, index) => {
      if (prop.redirect) {
        return null
      }
      if (prop.category) {
        var st = {}
        st[prop['state']] = !state[prop.state]
        return (
          <div key={prop.name}>
            <Text
              color={activeColor}
              fontWeight='bold'
              mb={{
                xl: '12px'
              }}
              mx='auto'
              ps={{
                sm: '10px',
                xl: '16px'
              }}
              py='12px'
            >
              {document.documentElement.dir === 'rtl'
                ? prop.rtlName
                : prop.name}
            </Text>
            {createLinks(prop.views)}
          </div>
        )
      }

      if (prop.layout === '/customer' || prop.layout === '/sharelynk') {
        return (
          <Button
            key={index}
            boxSize='initial'
            justifyContent='flex-start'
            alignItems='center'
            bg='transparent'
            mb={{
              xl: '12px'
            }}
            mx={{
              xl: 'auto'
            }}
            py='4px'
            ps={{
              sm: '10px',
              xl: '16px'
            }}
            borderRadius='15px'
            _hover='none'
            w='100%'
            _active={{
              bg: '',
              transform: 'none',
              borderColor: 'transparent'
            }}
            _focus={{
              boxShadow: 'none'
            }}
          >
            <Flex>
              <IconBox
                bg={'blue.300'}
                color='white'
                h='36px'
                w='36px'
                me='12px'
              >
                {prop.icon}
              </IconBox>
              {minimize ? (
                ''
              ) : (
                <Text color={inactiveColor} my='auto' fontSize='sm'>
                  {document.documentElement.dir === 'rtl'
                    ? prop.rtlName
                    : prop.name}
                </Text>
              )}
            </Flex>
          </Button>
        )
      } else {
        return (
          <NavLink to={prop.layout + prop.path} key={prop.name}>
            {activeRoute(prop.layout + prop.path) === 'active' ? (
              <Tooltip label={prop.name} display={minimize ? 'block' : 'none'}>
                <Button
                  boxSize='initial'
                  justifyContent='flex-start'
                  alignItems='center'
                  bg={activeBg}
                  mb={{
                    xl: '12px'
                  }}
                  mx={{
                    xl: 'auto'
                  }}
                  ps={{
                    sm: '10px',
                    xl: '16px'
                  }}
                  py='4px'
                  borderRadius='15px'
                  _hover='none'
                  w='100%'
                  _active={{
                    bg: 'inherit',
                    transform: 'none',
                    borderColor: 'transparent'
                  }}
                  _focus={{
                    boxShadow: 'none'
                  }}
                >
                  <Flex>
                    {typeof prop.icon === 'string' ? (
                      <Icon>{prop.icon}</Icon>
                    ) : (
                      <IconBox
                        bg='blue.300'
                        color='white'
                        h='36px'
                        w='36px'
                        me='12px'
                      >
                        {prop.icon}
                      </IconBox>
                    )}
                    {!minimize && (
                      <Text color={activeColor} my='auto' fontSize='sm'>
                        {document.documentElement.dir === 'rtl'
                          ? prop.rtlName
                          : prop.name}
                      </Text>
                    )}
                  </Flex>
                </Button>
              </Tooltip>
            ) : (
              <Tooltip label={prop.name} display={minimize ? 'block' : 'none'}>
                <Button
                  boxSize='initial'
                  justifyContent='flex-start'
                  alignItems='center'
                  bg='transparent'
                  mb={{
                    xl: '12px'
                  }}
                  mx={{
                    xl: 'auto'
                  }}
                  py='4px'
                  ps={{
                    sm: '10px',
                    xl: '16px'
                  }}
                  borderRadius='15px'
                  _hover='none'
                  w='100%'
                  _active={{
                    bg: 'inherit',
                    transform: 'none',
                    borderColor: 'transparent'
                  }}
                  _focus={{
                    boxShadow: 'none'
                  }}
                >
                  <Flex>
                    {typeof prop.icon === 'string' ? (
                      <Icon>{prop.icon}</Icon>
                    ) : (
                      <IconBox
                        bg={inactiveBg}
                        color='blue.300'
                        h='36px'
                        w='36px'
                        me='12px'
                      >
                        {prop.icon}
                      </IconBox>
                    )}
                    {minimize ? (
                      ''
                    ) : (
                      <Text color={inactiveColor} my='auto' fontSize='sm'>
                        {document.documentElement.dir === 'rtl'
                          ? prop.rtlName
                          : prop.name}
                      </Text>
                    )}
                  </Flex>
                </Button>
              </Tooltip>
            )}
          </NavLink>
        )
      }
    })
  }

  const links = <>{createLinks(routes)}</>

  return (
    <>
      <Box pt={'25px'} mb='12px' pos={'relative'}>
        <Link to={`/vendor/dashboard`}>
          <Box
            display='flex'
            lineHeight='100%'
            mb='30px'
            ml={'20px'}
            fontWeight='bold'
            justifyContent='start'
            alignItems='center'
            fontSize='11px'
          >
            <InterlynkLogo w='32px' h='32px' me='10px' />
            {minimize ? (
              ''
            ) : (
              <Text fontSize='lg' mt='3px'>
                {logoText}
              </Text>
            )}
          </Box>
        </Link>
        <Separator></Separator>
      </Box>
      <Stack direction='column' mb='40px'>
        <Box>{links}</Box>
      </Stack>
      <Center
        pos={'absolute'}
        bottom={'64px'}
        right={'-14px'}
        cursor={'pointer'}
        bg={'white'}
        width={'36px'}
        height={'36px'}
        rounded={'full'}
        border={'1px solid lightgray'}
        zIndex={111}
        onClick={() => setMinimize(!minimize)}
      >
        {minimize ? (
          <ChevronRightIcon w={7} h={7} />
        ) : (
          <ChevronLeftIcon w={7} h={7} />
        )}
      </Center>
      <SidebarHelp />
    </>
  )
}

export default SidebarContent

/*eslint-disable*/
// chakra imports
import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import IconBox from 'components/Icons/IconBox'
import { InterlynkLogo } from 'components/Icons/Icons'
import { Separator } from 'components/Separator/Separator'
import { SidebarHelp } from 'components/Sidebar/SidebarHelp'
import GlobalContext from 'context/GlobalContext'
import { useContext, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

// this function creates the links and collapses that appear in the sidebar (left menu)

const SidebarContent = ({ logoText, routes }) => {
  const { minimize, setMinimize } = useContext(GlobalContext)
  // to check for active links and opened collapses
  let location = useLocation()
  // this is for the rest of the collapses
  const [state, setState] = useState({})

  const activeRoute = (routeName) => {
    if (routeName === '/customer/') {
      return 'active'
    } else if (location.pathname === routeName) {
      return 'active'
    } else {
      return ''
    }
  }

  const createLinks = (routes) => {
    const inactiveBg = useColorModeValue('white', 'gray.700')
    const activeColor = useColorModeValue('gray.900', 'white')
    const inactiveColor = useColorModeValue('gray.500', 'gray.500')

    return routes
      .filter((item) => item.path !== '/autofix' && item.path !== '/changelog')
      .map((prop, index) => {
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

        return (
          <Link
            to={
              prop.path === '/settings'
                ? `${prop.layout}${prop.path}?tab=general`
                : prop.layout + prop.path
            }
            key={prop.name}
          >
            {activeRoute(prop.layout + prop.path) === 'active' ? (
              <Button
                boxSize='initial'
                justifyContent='flex-start'
                alignItems='center'
                title={prop.name}
                mb={{
                  xl: '12px'
                }}
                mx={{
                  xl: 'auto'
                }}
                py='4px'
                pl={'18px'}
                bg='none'
                _active={{
                  bg: 'none'
                }}
                _hover={{
                  bg: 'none'
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
                    <Text
                      color={activeColor}
                      my='auto'
                      fontSize='sm'
                      transition='transform 0.1s ease-in-out'
                      opacity={minimize ? 0 : 100}
                    >
                      {document.documentElement.dir === 'rtl'
                        ? prop.rtlName
                        : prop.name}
                    </Text>
                  )}
                </Flex>
              </Button>
            ) : (
              <Button
                boxSize='initial'
                justifyContent='flex-start'
                alignItems='center'
                mb={{
                  xl: '12px'
                }}
                mx={{
                  xl: 'auto'
                }}
                py='4px'
                pl={'18px'}
                bg='none'
                _active={{
                  bg: 'none'
                }}
                _hover={{
                  bg: 'none'
                }}
                title={prop.name}
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
                    <Text
                      color={inactiveColor}
                      my='auto'
                      fontSize='sm'
                      transition='transform 0.1s ease-in-out'
                      opacity={minimize ? 0 : 100}
                    >
                      {document.documentElement.dir === 'rtl'
                        ? prop.rtlName
                        : prop.name}
                    </Text>
                  )}
                </Flex>
              </Button>
            )}
          </Link>
        )
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
            mb='32px'
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
              <Text fontSize='lg' mt='12px'>
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
      <SidebarHelp />
    </>
  )
}

export default SidebarContent

/*eslint-disable*/
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Link,
  Spinner,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import IconBox from 'components/Icons/IconBox'
import { InterlynkLogo } from 'components/Icons/Icons'
import { Separator } from 'components/Separator/Separator'
import { SidebarHelp } from 'components/Sidebar/SidebarHelp'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

function SidebarResponsive(props) {
  const { isFreeTier } = useGlobalQueryContext()
  // to check for active links and opened collapses
  let location = useLocation()
  // this is for the rest of the collapses
  const [state, setState] = React.useState({})
  const mainPanel = React.useRef()
  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname === routeName ? 'active' : ''
  }

  const routesActual = isFreeTier
    ? props.routes.filter(
        (route) =>
          route.name !== 'Requests' &&
          route.name !== 'Licenses' &&
          route.name !== 'Analytics' &&
          route.name !== 'Support'
      )
    : props.routes

  const createLinks = (routes) => {
    const { primaryTextColor, secondaryTextColor, secondaryBgColor } =
      useThemeColor([
        'primaryTextColor',
        'secondaryTextColor',
        'secondaryBgColor'
      ])

    return routes.map((prop, key) => {
      if (prop.redirect) {
        return null
      }
      if (prop.category) {
        var st = {}
        st[prop['state']] = !state[prop.state]
        return (
          <div key={prop.name}>
            <Text
              color={primaryTextColor}
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

      return (
        <NavLink to={prop.layout + prop.path} key={prop.name}>
          {activeRoute(prop.layout + prop.path) === 'active' ? (
            <Button
              boxSize='initial'
              justifyContent='flex-start'
              alignItems='center'
              bg={''}
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
              py='12px'
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
                <Text color={primaryTextColor} my='auto' fontSize='sm'>
                  {document.documentElement.dir === 'rtl'
                    ? prop.rtlName
                    : prop.name}
                </Text>
              </Flex>
            </Button>
          ) : (
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
              py='12px'
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
                    bg={secondaryBgColor}
                    color='blue.300'
                    h='36px'
                    w='36px'
                    me='12px'
                  >
                    {prop.icon}
                  </IconBox>
                )}
                <Text color={secondaryTextColor} my='auto' fontSize='sm'>
                  {document.documentElement.dir === 'rtl'
                    ? prop.rtlName
                    : prop.name}
                </Text>
              </Flex>
            </Button>
          )}
        </NavLink>
      )
    })
  }

  const { logoText, routes, ...rest } = props

  var links = <>{createLinks(routesActual)}</>
  //  BRAND
  //  Chakra Color Mode
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  let hamburgerColor = primaryTextColor
  if (props.secondary === true) {
    hamburgerColor = 'white'
  }
  var brand = (
    <Box pt={'35px'} mb='8px'>
      <Link
        href={`${process.env.PUBLIC_URL}/#/`}
        target='_blank'
        display='flex'
        lineHeight='100%'
        mb='30px'
        fontWeight='bold'
        justifyContent='center'
        alignItems='center'
        fontSize='11px'
      >
        <InterlynkLogo w='32px' h='32px' me='10px' />
        <Text fontSize='sm' mt='3px'>
          {logoText}
        </Text>
      </Link>
      <Separator></Separator>
    </Box>
  )

  // SIDEBAR
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  // Color variables
  return (
    <Flex
      display={{ sm: 'flex', xl: 'none' }}
      ref={mainPanel}
      alignItems='center'
    >
      <HamburgerIcon
        cursor={'pointer'}
        color={hamburgerColor}
        w='18px'
        h='18px'
        ref={btnRef}
        onClick={onOpen}
      />
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={document.documentElement.dir === 'rtl' ? 'right' : 'left'}
      >
        <DrawerOverlay />
        <DrawerContent
          w='250px'
          maxW='250px'
          ms={{
            sm: '16px'
          }}
          my={{
            sm: '16px'
          }}
          borderRadius='16px'
        >
          <DrawerCloseButton
            _focus={{ boxShadow: 'none' }}
            _hover={{ boxShadow: 'none' }}
          />
          <DrawerBody maxW='250px' px='1rem'>
            <Box maxW='100%' h='100vh'>
              <Box>{brand}</Box>
              <Stack direction='column' mb='40px'>
                <Box>{links}</Box>
              </Stack>
              <SidebarHelp></SidebarHelp>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  )
}

export default SidebarResponsive

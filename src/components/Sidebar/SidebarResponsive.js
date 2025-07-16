/*eslint-disable*/
import React, { useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import {
  Box,
  Button,
  Flex,
  Link,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import IconBox from 'components/Icons/IconBox'
import { InterlynkLogo } from 'components/Icons/Icons'
import LynkDrawer from 'components/LynkDrawer'
import { Separator } from 'components/Separator/Separator'
import { SidebarHelp } from 'components/Sidebar/SidebarHelp'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuMenu } from 'react-icons/lu'

function SidebarResponsive(props) {
  const { logoText, routes, secondary } = props

  const { isFreeTier } = useGlobalQueryContext()
  const location = useLocation()
  const category = location.pathname.split('/')[2]

  const mainPanel = useRef()
  const { primaryTextColor, secondaryTextColor, secondaryBgColor } =
    useThemeColor([
      'primaryTextColor',
      'secondaryTextColor',
      'secondaryBgColor'
    ])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

  // function to check if a route is active
  const isActiveRoute = (routeName) => {
    const name = routeName.split('/')[2]
    return location.pathname === routeName || name?.includes(category)
      ? 'active'
      : ''
  }

  // Filter routes based on tier status
  const filteredRoutes = isFreeTier
    ? routes.filter(
        ({ name }) =>
          !['Requests', 'Licenses', 'Analytics', 'Support', 'Package'].includes(
            name
          )
      )
    : routes

  // Generate navigation links
  const createLinkButton = (prop, isActive) => {
    const buttonColor = isActive ? primaryTextColor : secondaryTextColor
    const iconColor = isActive ? 'white' : 'blue.300'

    return (
      <Button
        title={prop.name}
        boxSize='initial'
        justifyContent='flex-start'
        alignItems='center'
        bg={isActive ? '' : 'transparent'}
        mb={{ xl: '12px' }}
        mx={{ xl: 'auto' }}
        py='12px'
        ps={{ sm: '10px', xl: '16px' }}
        borderRadius='15px'
        _hover='none'
        w='100%'
        _active={{
          bg: 'inherit',
          transform: 'none',
          borderColor: 'transparent'
        }}
        _focus={{ boxShadow: 'none' }}
      >
        <Flex>
          {typeof prop.icon === 'string' ? (
            <Icon>{prop.icon}</Icon>
          ) : (
            <IconBox
              bg={isActive ? 'blue.300' : secondaryBgColor}
              color={iconColor}
              h='36px'
              w='36px'
              me='12px'
            >
              {prop.icon}
            </IconBox>
          )}
          <Text color={buttonColor} my='auto' fontSize='sm'>
            {document.documentElement.dir === 'rtl' ? prop.rtlName : prop.name}
          </Text>
        </Flex>
      </Button>
    )
  }

  const createLinks = (routes) => {
    return routes.map((prop) => {
      if (prop.redirect) return null

      if (prop.category) {
        return (
          <div key={prop.name}>
            <Text
              color={primaryTextColor}
              fontWeight='bold'
              mb={{ xl: '12px' }}
              mx='auto'
              ps={{ sm: '10px', xl: '16px' }}
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

      const routePath = prop.layout + prop.path
      const isActive = isActiveRoute(routePath) === 'active'

      return (
        <NavLink
          to={routePath}
          key={prop.name}
          target={prop.name === 'Documentation' ? '_blank' : '_self'}
        >
          {createLinkButton(prop, isActive)}
        </NavLink>
      )
    })
  }

  const brand = (
    <Box pt='35px' mb='8px'>
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
      <Separator />
    </Box>
  )

  const hamburgerColor = secondary ? 'white' : primaryTextColor

  return (
    <Flex
      display={{ sm: 'flex', xl: 'none' }}
      ref={mainPanel}
      alignItems='center'
    >
      <LuMenu
        cursor={'pointer'}
        color={hamburgerColor}
        w='18px'
        h='18px'
        ref={btnRef}
        onClick={onOpen}
      />
      <LynkDrawer
        isOpen={isOpen}
        onClose={onClose}
        size={'sm'}
        placement={document.documentElement.dir === 'rtl' ? 'right' : 'left'}
        noFooter
        noHeader
      >
        <Box maxW='100%' h='100vh'>
          <Box>{brand}</Box>
          <Stack direction='column' mb='40px'>
            <Box>{createLinks(filteredRoutes)}</Box>
          </Stack>
          <SidebarHelp />
        </Box>
      </LynkDrawer>
    </Flex>
  )
}

export default SidebarResponsive

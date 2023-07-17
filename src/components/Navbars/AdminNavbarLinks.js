// Chakra Icons
import { BellIcon } from '@chakra-ui/icons'
// Chakra Imports
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
// Custom Icons
import { ProfileIcon, SettingsIcon } from 'components/Icons/Icons'
// Custom Components
import { ItemContent } from 'components/Menu/ItemContent'
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'
import PropTypes from 'prop-types'
import React, { useContext } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import routes from 'routes.js'
import { FaSignOutAlt } from 'react-icons/fa'
import GlobalContext from 'context/GlobalContext'

import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'

export default function HeaderLinks(props) {
  const location = useLocation()
  const history = useHistory()

  const { variant, children, fixed, secondary, onOpen, ...rest } = props
  const { setIsAuthenticate } = useContext(GlobalContext)

  // console.log(`location`, location)

  const [username, setUsername] = useState('')

  const userName = localStorage.getItem('username')
  const userEmail = localStorage.getItem('userEmail')

  useEffect(() => {
    if (location.pathname.startsWith('/vendor')) {
      setUsername(userName)
    } else if (location.pathname.startsWith('/customer')) {
      setUsername(userEmail)
    }
  }, [])

  // Chakra Color Mode
  let mainTeal = useColorModeValue('teal.300', 'teal.300')
  let inputBg = useColorModeValue('white', 'gray.800')
  let mainText = useColorModeValue('gray.700', 'gray.200')
  let navbarIcon = useColorModeValue('gray.500', 'gray.200')
  let searchIcon = useColorModeValue('gray.700', 'gray.200')

  if (secondary) {
    navbarIcon = 'white'
    mainText = 'white'
  }

  const handleLogout = () => {
    localStorage.removeItem('username')
    Cookies.remove('authToken')
    setIsAuthenticate(false)
    history.push('/auth')
  }

  return (
    <Flex
      pe={{ sm: '0px', md: '0px' }}
      w={{ sm: '100%', md: 'auto' }}
      alignItems='center'
      flexDirection='row'
    >
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label='Options'
          variant='none'
          color='gray.400'
          ms='0px'
          px='0px'
          me={{ sm: '2px', md: '16px' }}
          // color={navbarIcon}
          // variant='transparent-with-icon'
          rightIcon={
            document.documentElement.dir ? (
              ''
            ) : (
              <ProfileIcon color={navbarIcon} w='22px' h='22px' me='0px' />
            )
          }
          leftIcon={
            document.documentElement.dir ? (
              <ProfileIcon color={navbarIcon} w='22px' h='22px' me='0px' />
            ) : (
              ''
            )
          }
        >
          <Text display={{ sm: 'none', md: 'flex' }} fontSize={'sm'}>
            {username ? username : 'Surendra Pathak'}
          </Text>
        </MenuButton>
        {location.pathname.startsWith('/customer') ? (
          <MenuList size='sm'>
            <MenuGroup title=''>
              <Link to='/register'>
                <MenuItem icon={<SettingsIcon />}>Register</MenuItem>
              </Link>
            </MenuGroup>
          </MenuList>
        ) : (
          <MenuList size='sm'>
            <MenuGroup title=''>
              <Link to='/vendor/connections'>
                <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
              </Link>
              {userName ? (
                <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                  Logout
                </MenuItem>
              ) : (
                <Link to='/'>
                  <MenuItem icon={<FaSignOutAlt />}>Login</MenuItem>
                </Link>
              )}
            </MenuGroup>
          </MenuList>
        )}
      </Menu>
      <SidebarResponsive
        logoText={props.logoText}
        secondary={props.secondary}
        routes={routes}
        // logo={logo}
        {...rest}
      />
      {!userName && (
        <Menu>
          <MenuButton>
            <BellIcon color={navbarIcon} w='18px' h='18px' />
          </MenuButton>
          <MenuList p='16px 8px'>
            <Flex flexDirection='column'>
              <MenuItem borderRadius='8px' mb='10px'>
                <ItemContent
                  time='6 hours ago'
                  info='SPDX 3.0 Support'
                  boldInfo='[New Feature]'
                  aName='Feature'
                />
              </MenuItem>
              <MenuItem borderRadius='8px' mb='10px'>
                <ItemContent
                  time='3 days ago'
                  info='CycloneDX 1.4 Export'
                  boldInfo='[Fix]'
                  aName='Bug'
                />
              </MenuItem>
              <MenuItem borderRadius='8px'>
                <ItemContent
                  time='4 days ago'
                  info='SBOMQS Depth Fixed'
                  boldInfo='[Fix'
                  aName='Bug'
                />
              </MenuItem>
            </Flex>
          </MenuList>
        </Menu>
      )}
    </Flex>
  )
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func
}

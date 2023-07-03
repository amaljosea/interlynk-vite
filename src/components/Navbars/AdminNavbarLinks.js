// Chakra Icons
import { BellIcon, SearchIcon } from '@chakra-ui/icons'
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
// Assets
import avatar1 from 'assets/img/avatars/avatar1.png'
import avatar2 from 'assets/img/avatars/avatar2.png'
import avatar3 from 'assets/img/avatars/avatar3.png'
// Custom Icons
import { ProfileIcon, SettingsIcon, LogoutIcon } from 'components/Icons/Icons'
// Custom Components
import { ItemContent } from 'components/Menu/ItemContent'
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'
import PropTypes from 'prop-types'
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import routes from 'routes.js'
import { FaSignOutAlt } from 'react-icons/fa'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'

export default function HeaderLinks(props) {
  const { variant, children, fixed, secondary, onOpen, ...rest } = props

  const { authUser, setAuthUser } = useContext(GlobalContext)

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
  const settingsRef = React.useRef()
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
          <Text display={{ sm: 'none', md: 'flex' }}>
            {authUser ? authUser.name : 'Surendra Pathak'}
          </Text>
        </MenuButton>
        <MenuList size='sm'>
          <MenuGroup title=''>
            <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
            {authUser ? (
              <MenuItem
                icon={<FaSignOutAlt />}
                onClick={() => setAuthUser(null)}
              >
                Logout
              </MenuItem>
            ) : (
              <Link to='/'>
                <MenuItem icon={<FaSignOutAlt />}>Login</MenuItem>
              </Link>
            )}
          </MenuGroup>
        </MenuList>
      </Menu>
      <SidebarResponsive
        logoText={props.logoText}
        secondary={props.secondary}
        routes={routes}
        // logo={logo}
        {...rest}
      />
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
    </Flex>
  )
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func
}

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
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Icon,
  Stack,
  Code,
  Select
} from '@chakra-ui/react'
// Custom Icons
import { ProfileIcon, SettingsIcon } from 'components/Icons/Icons'
// Custom Components
import { ItemContent } from 'components/Menu/ItemContent'
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'
import PropTypes from 'prop-types'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { dashRoutes } from 'routes.js'
import { FaRegKeyboard, FaSignOutAlt } from 'react-icons/fa'

import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useQuery } from '@apollo/client'
import { GetOrg } from 'graphQL/Queries'

export default function HeaderLinks(props) {
  const location = useLocation()
  const history = useHistory()

  const { data } = useQuery(GetOrg)

  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const customerView = location.pathname.startsWith('/customer')

  const { variant, children, fixed, secondary, onOpen, ...rest } = props

  const [username, setUsername] = useState('')

  const authToken = Cookies.get('authToken')

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
  let navbarIcon = useColorModeValue('gray.500', 'gray.200')

  if (secondary) {
    navbarIcon = 'white'
  }

  const paramId = Cookies.get('signedParamId')
  const logoutURL = process.env.REACT_APP_VENDOR_LOGOUT_URL

  const handleLogout = async () => {
    try {
      await axios
        .delete(`${logoutURL}`, {
          headers: {
            Authorization: authToken
          }
        })
        .then((res) => {
          if (res.data.status === 200) {
            localStorage.removeItem('username')
            localStorage.removeItem('email')
            Cookies.remove('authToken')
            history.push('/auth')
          }
        })
    } catch (error) {}
  }

  const handleCustomerLogout = () => {
    localStorage.removeItem('userEmail')
    Cookies.remove('userToken')
    window.location.href = `/login?signed_url_params=${paramId}`
  }

  const shortcuts = [
    {
      key: 'Alt + 1',
      title: 'Create Component'
    },
    {
      key: 'Alt + 2',
      title: 'Build SBOM'
    },
    {
      key: 'Alt + 3',
      title: 'Download SBOM'
    },
    {
      key: 'Ctrl + /',
      title: 'Search'
    }
  ]

  return (
    <Flex gap={4} alignItems='center' flexDirection='row'>
      <Select width={'fit-content'} bg={'white'} size='sm'>
        <option value='Today'>Today</option>
        <option value='1 weeks'>1 weeks</option>
        <option value='2 weeks'>2 weeks</option>
        <option value='3 weeks'>3 weeks</option>
        <option value='1 month'>1 month</option>
      </Select>
      {productId && !customerView && (
        <Popover isLazy>
          <PopoverTrigger>
            <IconButton
              m={0}
              p={0}
              variant='ghost'
              icon={<FaRegKeyboard fontSize={24} color='darkgray' />}
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader fontWeight='medium'>
              Keyboard Shortcuts
            </PopoverHeader>
            <PopoverBody>
              <Flex gap={2} direction={'column'}>
                {shortcuts.map((item, index) => (
                  <Stack key={index} direction={'row'} alignItems={'center'}>
                    <Code bg={'#444'} color='white' px={1.5}>
                      {item.key}
                    </Code>
                    <Text fontSize={'sm'}> - {item.title}</Text>
                  </Stack>
                ))}
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label='Options'
          variant='none'
          color='gray.400'
          ms='0px'
          px='0px'
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
            {data ? data.organization.currentUser.name : ''}
          </Text>
        </MenuButton>
        {location.pathname.startsWith('/vendor') && (
          <MenuList size='sm'>
            <MenuGroup title=''>
              <Link to='/vendor/profiles?tab=person'>
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
        {location.pathname.startsWith('/customer') && (
          <MenuList size='sm'>
            <MenuGroup title=''>
              <MenuItem icon={<SettingsIcon />} onClick={handleCustomerLogout}>
                Log out
              </MenuItem>
            </MenuGroup>
          </MenuList>
        )}
      </Menu>
      <SidebarResponsive
        logoText={props.logoText}
        secondary={props.secondary}
        routes={dashRoutes}
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

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
  Stack,
  Kbd,
  Icon,
  MenuDivider
} from '@chakra-ui/react'
// Custom Icons
import { ProfileIcon, SettingsIcon } from 'components/Icons/Icons'
// Custom Components
import { ItemContent } from 'components/Menu/ItemContent'
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'
import PropTypes from 'prop-types'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { dashRoutes } from 'routes.js'
import { FaRegKeyboard, FaSignOutAlt, FaExchangeAlt } from 'react-icons/fa'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import axios from 'axios'
import { useGlobalState } from 'hooks/useGlobalState'
import { GetOrg } from 'graphQL/Queries'
import { useQuery } from '@apollo/client'
import { FaUser } from 'react-icons/fa6'

export default function HeaderLinks(props) {
  const location = useLocation()
  const navigate = useNavigate()

  const { userName, setUserName } = useGlobalState()

  const { data, error } = useQuery(GetOrg)

  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const customerView = location.pathname.startsWith('/customer')

  const { variant, children, fixed, secondary, onOpen, ...rest } = props

  const authToken = Cookies.get('authToken')

  const name = localStorage.getItem('username')
  const email = localStorage.getItem('email')
  const userEmail = localStorage.getItem('userEmail')
  const org = localStorage.getItem('organization')

  useEffect(() => {
    if (location.pathname.startsWith('/vendor')) {
      setUserName(name || email)
    } else if (location.pathname.startsWith('/customer')) {
      setUserName(userEmail)
    }
  }, [])

  useEffect(() => {
    if (!name || !email || error) {
      Cookies.remove('authToken')
      navigate('/auth')
    }
  }, [error])

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
          if (res.data) {
            localStorage.removeItem('username')
            localStorage.removeItem('email')
            localStorage.removeItem('product')
            Cookies.remove('authToken')
            navigate('/auth')
          }
        })
    } catch (error) {
      // Even in case of server error, make sure user experience moves to relogin
      localStorage.removeItem('username')
      localStorage.removeItem('email')
      localStorage.removeItem('product')
      Cookies.remove('authToken')
      navigate('/auth')
    }
  }

  const handleCustomerLogout = () => {
    localStorage.removeItem('userEmail')
    Cookies.remove('userToken')
    window.location.href = `/login?signed_url_params=${paramId}`
  }

  const shortcuts = [
    {
      key: 'Ctrl + /',
      title: 'Search'
    }
  ]

  return (
    <Flex gap={4} alignItems='center' flexDirection='row'>
      {/*  /// TODO: 1.0 Add back in when ready }
      {!customerView && (
        <Select
          width={'fit-content'}
          bg={'white'}
          size='sm'
          name='duration'
          id='duration'
        >
          <option value='Today'>Today</option>
          <option value='1 weeks'>1 weeks</option>
          <option value='2 weeks'>2 weeks</option>
          <option value='3 weeks'>3 weeks</option>
          <option value='1 month'>1 month</option>
        </Select>
        ) */}
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
                    <Kbd>{item.key}</Kbd>
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
            {userName || name}
          </Text>
        </MenuButton>
        {location.pathname.startsWith('/vendor') && (
          <MenuList>
            <MenuGroup title=''>
              <MenuItem>
                <Flex flexDirection='row' alignItems={'flex-start'} gap={3}>
                  <Icon as={FaUser} width={2.5} mt={1} />
                  <Stack direction={'column'} spacing={-2}>
                    <Text mt={0} mb={0}>
                      {name}
                    </Text>
                    <Text mt={0} mb={0} fontSize={'sm'} color={'#718096'}>
                      {email}
                    </Text>
                    <Text mt={0} mb={0} fontSize={'sm'} color={'#718096'}>
                      {org !== 'undefined' ? org?.replace(/"/g, '') : ''}
                    </Text>
                  </Stack>
                </Flex>
              </MenuItem>
              <MenuDivider />
              {data?.organization && (
                <Link to={`/vendor/settings?tab=person`}>
                  <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
                </Link>
              )}
              <Link to='/vendor/settings?tab=organization'>
                <MenuItem icon={<FaExchangeAlt />}>Organizations</MenuItem>
              </Link>
              <MenuDivider />
              <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                Logout
              </MenuItem>
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
        {...rest}
      />
    </Flex>
  )
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func
}

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
  MenuDivider,
  Button,
  MenuItemOption,
  MenuOptionGroup
} from '@chakra-ui/react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GetOrg } from 'graphQL/Queries'
import { dashRoutes } from 'routes.js'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
// Custom Icons
import { ProfileIcon, SettingsIcon } from 'components/Icons/Icons'
import { FaRegKeyboard, FaSignOutAlt, FaExchangeAlt } from 'react-icons/fa'
import { FaCode, FaInbox, FaSquareArrowUpRight, FaUser } from 'react-icons/fa6'
// Custom Components
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'
import { useGlobalState } from 'hooks/useGlobalState'
import { logoutUser } from 'utils/authUtils'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { GetProjectGroup } from 'graphQL/Queries'

export default function HeaderLinks(props) {
  const location = useLocation()
  const navigate = useNavigate()
  const { userName, setUserName, envName, setEnvName } = useGlobalState()
  const { data, error } = useQuery(GetOrg)
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const group = JSON.parse(localStorage.getItem('product'))
  const dashboardView = location.pathname === '/vendor/dashboard'

  const { variant, children, fixed, secondary, onOpen, ...rest } = props

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
    if (!email || error) {
      logoutUser().then((r) => navigate('/auth'))
    }
  }, [error])

  // Chakra Color Mode
  let navbarIcon = useColorModeValue('gray.500', 'gray.200')

  if (secondary) {
    navbarIcon = 'white'
  }

  const handleLogout = async () => {
    await logoutUser()
    navigate('/auth')
  }

  const shortcuts = [{ key: 'Ctrl + /', title: 'Search' }]

  const [getProdGroup] = useLazyQuery(GetProjectGroup, {fetchPolicy: 'network-only'})

  const handleEnvChange = (value) => {
    localStorage.setItem('environment', value)
    setEnvName(value)
    if (sbomId) {
      getProdGroup({ variables: { id: group?.id } }).then((res) => {
        if (res?.data) {
          const env = res?.data?.projectGroup?.projects?.find((item) => item.name === value)
          localStorage.setItem('activeEnv', env?.id)
          navigate(`/vendor/products/${group?.name}?id=${group?.id}`)
        }
      })
    }
  }

  const envIcon = (env) => {
    switch (env) {
      case 'default':
        return <FaInbox />
      case 'development':
        return <FaCode />
      case 'production':
        return <FaSquareArrowUpRight />
    }
  }

  return (
    <Flex gap={4} alignItems='center' flexDirection='row'>
      {/* ENVIRONMENT */}
      {(dashboardView || productId) && (
        <Menu closeOnSelect={true}>
          <MenuButton
            as={Button}
            size='sm'
            colorScheme='blue'
            fontWeight='medium'
            fontSize='sm'
            leftIcon={envIcon(envName)}
            rightIcon={<ChevronDownIcon />}
            textTransform='capitalize'
          >
            {envName || 'Default'}
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              value={envName}
              onChange={(value) => handleEnvChange(value)}
              type='radio'
            >
              {['default', 'development', 'production'].map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize='sm'
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      )}
      {productId && (
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

import { useLazyQuery } from '@apollo/client'
import { useKBar } from 'kbar'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { dashRoutes } from 'routes.js'
import { logoutUser } from 'utils/authUtils'

import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Kbd,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  Text,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'

// Custom Icons
import { ProfileIcon, SettingsIcon } from 'components/Icons/Icons'
// Custom Components
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetOrgName } from 'graphQL/Queries'

import { FaExchangeAlt, FaSignOutAlt } from 'react-icons/fa'
import {
  FaCode,
  FaInbox,
  FaMoon,
  FaSquareArrowUpRight,
  FaSun,
  FaUser
} from 'react-icons/fa6'

export default function HeaderLinks(props) {
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const params = useParams()
  const { query } = useKBar()

  const productId = params.productid
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid

  const { colorMode, toggleColorMode, setColorMode } = useColorMode()
  const bgColor = useColorModeValue('#EDF2F7', '#2D3748')

  const dashboardView = location.pathname === '/vendor/dashboard'
  const signedUrlParams = location.pathname.startsWith('/customer')
  const name = localStorage.getItem('username')
  const email = localStorage.getItem('email')
  const userEmail = localStorage.getItem('userEmail')

  const {
    userName,
    setClearSelect,
    setSelectedSbom,
    setUserName,
    envName,
    setEnvName
  } = useGlobalState()

  const [fetchOrg, { data }] = useLazyQuery(GetOrgName, {
    fetchPolicy: 'network-only'
  })

  const { projects } = props
  const { secondary, ...rest } = props

  useEffect(() => {
    if (location.pathname.startsWith('/vendor')) {
      setUserName(name || email)
    } else if (location.pathname.startsWith('/customer')) {
      setUserName(userEmail)
    }
  }, [email, location, name, setUserName, userEmail])

  useEffect(() => {
    if (!email && location.pathname.startsWith('/vendor')) {
      logoutUser().then(() => navigate('/auth'))
    }
  }, [email, location, navigate])

  // Chakra Color Mode
  let navbarIcon = useColorModeValue('gray.500', 'gray.200')

  if (secondary) {
    navbarIcon = 'white'
  }

  const handleLogout = async () => {
    await logoutUser()
    setColorMode('light')
    navigate('/auth')
  }

  // const shortcuts = [{ key: 'Ctrl + /', title: 'Search' }]

  const handleEnvChange = (value) => {
    if (params.productgroupid) {
      const project = projects.find((p) => p.name === value)
      navigate(
        generateProductDetailPageUrlFromCurrentUrl({
          productid: project.id
        })
      )
    }
    localStorage.setItem('environment', value)
    setEnvName(value)
    setClearSelect(true)
    setSelectedSbom([])
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

  const detectOS = () => {
    const { userAgent } = window.navigator
    if (/Windows NT 10.0/.test(userAgent)) return 'Windows 10'
    if (/Windows NT 6.2/.test(userAgent)) return 'Windows 8'
    if (/Windows NT 6.1/.test(userAgent)) return 'Windows 7'
    if (/Windows NT 6.0/.test(userAgent)) return 'Windows Vista'
    if (/Windows NT 5.1/.test(userAgent)) return 'Windows XP'
    if (/Mac OS X 10[._]\d+/.test(userAgent)) return 'Mac OS X'
    if (/Linux/.test(userAgent)) return 'Linux'
    if (/Android/.test(userAgent)) return 'Android'
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
    return 'Unknown'
  }
  const os = detectOS()

  return (
    <Flex gap={3} alignItems='center' flexDirection='row'>
      {/* JOIN WAITLIST */}
      {signedUrlParams && (
        <Link href='https://www.interlynk.io/sign-up' isExternal>
          <Button colorScheme='blue' size='sm'>
            Sign up
          </Button>
        </Link>
      )}
      {/* SEARCH */}
      <InputGroup
        size='sm'
        width={'250px'}
        pos={'relative'}
        display={signedUrlParams ? 'none' : 'block'}
      >
        <InputLeftElement>
          <SearchIcon color={'gray.400'} />
        </InputLeftElement>
        <Input
          bg={bgColor}
          border='none'
          borderRadius={6}
          placeholder='Search..'
          onClick={query?.toggle}
          display={signedUrlParams ? 'none' : 'block'}
        />
        <Box pos={'absolute'} top={'0.2rem'} right={1.5}>
          <Kbd>{os?.startsWith('Windows') ? 'Ctrl' : 'Cmd'}</Kbd> <Kbd>K</Kbd>
        </Box>
      </InputGroup>
      {/* ENVIRONMENT */}
      {(dashboardView || productId) && !vulnId && (
        <Menu closeOnSelect={true}>
          <MenuButton
            size='sm'
            as={Button}
            fontSize='sm'
            colorScheme='blue'
            fontWeight='medium'
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
      {/* DARK MODE */}
      <IconButton
        size='sm'
        onClick={toggleColorMode}
        icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
        display={signedUrlParams ? 'none' : 'flex'}
      />
      {!signedUrlParams && (
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label='Options'
            variant='none'
            color='gray.400'
            ms='0px'
            px='0px'
            onClick={() => fetchOrg()}
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
          <MenuList>
            <MenuGroup title=''>
              <MenuItem>
                <Flex flexDirection='row' alignItems={'flex-start'} gap={3}>
                  <Icon as={FaUser} width={2.5} mt={1} />
                  <Stack direction={'column'} spacing={-1}>
                    <Text>{name}</Text>
                    <Text fontSize={'sm'} color={'#718096'}>
                      {email}
                    </Text>
                    <Text fontSize={'sm'} color={'#718096'}>
                      {data?.organization?.name || ''}
                    </Text>
                  </Stack>
                </Flex>
              </MenuItem>
              <MenuDivider hidden={!data?.organization} />
              <Link to={`/vendor/settings?tab=personal-details`}>
                <MenuItem
                  icon={<SettingsIcon />}
                  display={data?.organization ? 'flex' : 'none'}
                >
                  Settings
                </MenuItem>
              </Link>
              <Link to='/vendor/settings?tab=organizations'>
                <MenuItem
                  icon={<FaExchangeAlt />}
                  display={data?.organization ? 'flex' : 'none'}
                >
                  Organizations
                </MenuItem>
              </Link>
              <MenuDivider />
              <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      )}
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

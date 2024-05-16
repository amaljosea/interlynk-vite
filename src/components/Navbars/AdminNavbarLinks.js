import { useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { dashRoutes } from 'routes.js'
import { logoutUser } from 'utils/authUtils'

import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  Icon,
  IconButton,
  Kbd,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

// Custom Icons
import { ProfileIcon, SettingsIcon } from 'components/Icons/Icons'
// Custom Components
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetOrgName } from 'graphQL/Queries'

import { FaExchangeAlt, FaRegKeyboard, FaSignOutAlt } from 'react-icons/fa'
import { FaCode, FaInbox, FaSquareArrowUpRight, FaUser } from 'react-icons/fa6'

export default function HeaderLinks(props) {
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const params = useParams()

  const productId = params.productid
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid

  const dashboardView = location.pathname === '/vendor/dashboard'
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
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
  }, [])

  useEffect(() => {
    if (!email && location.pathname.startsWith('/vendor')) {
      logoutUser().then(() => navigate('/auth'))
    }
  }, [location])

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

  return (
    <Flex gap={4} alignItems='center' flexDirection='row'>
      {/* JOIN WAITLIST */}
      {signedUrlParams && (
        <Link href='https://www.interlynk.io/sign-up' isExternal>
          <Button colorScheme='blue' size='sm'>
            Sign up
          </Button>
        </Link>
      )}
      {/* ENVIRONMENT */}
      {(dashboardView || productId) && !vulnId && (
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
          <PopoverContent pos={'relative'} right={10}>
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
                  <Stack direction={'column'} spacing={-2}>
                    <Text mt={0} mb={0}>
                      {name}
                    </Text>
                    <Text mt={0} mb={0} fontSize={'sm'} color={'#718096'}>
                      {email}
                    </Text>
                    <Text mt={0} mb={0} fontSize={'sm'} color={'#718096'}>
                      {data?.organization?.name || ''}
                    </Text>
                  </Stack>
                </Flex>
              </MenuItem>
              <MenuDivider hidden={!data?.organization} />
              <Link href={`/vendor/settings?tab=personal-details`}>
                <MenuItem
                  icon={<SettingsIcon />}
                  display={data?.organization ? 'flex' : 'none'}
                >
                  Settings
                </MenuItem>
              </Link>
              <Link href='/vendor/settings?tab=organizations'>
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

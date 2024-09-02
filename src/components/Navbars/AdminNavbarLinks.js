import { gql, useLazyQuery, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useKBar } from 'kbar'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { dashRoutes } from 'routes.js'
import { logoutUser } from 'utils/authUtils'
import { homeSteps } from 'utils/tourUtils'
import { productSteps } from 'utils/tourUtils'

import { SearchIcon } from '@chakra-ui/icons'
import {
  Avatar,
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
  MenuList,
  Stack,
  Text,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'

// Custom Icons
import { SettingsIcon } from 'components/Icons/Icons'
// Custom Components
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { GetOrgName } from 'graphQL/Queries'

import { FaExchangeAlt, FaSignOutAlt } from 'react-icons/fa'
import { FaLocationArrow, FaMoon, FaSun, FaUser } from 'react-icons/fa6'

// GET PROFILE PHOTO
export const GetProfilePic = gql`
  query GetProfilePic {
    organization {
      currentUser {
        name
        email
        profileImage {
          filename
          url
        }
      }
    }
  }
`

export default function HeaderLinks(props) {
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const { query } = useKBar()

  const SERVER_URL = process.env.REACT_APP_SERVER

  const { colorMode, toggleColorMode, setColorMode } = useColorMode()
  const bgColor = useColorModeValue('#EDF2F7', '#2D3748')
  const dashboardView = location.pathname === '/vendor/dashboard'
  const productView = location.pathname === '/vendor/products'
  const signedUrlParams = location.pathname.startsWith('/customer')

  const { userName, setUserName } = useGlobalState()
  const { orgView } = useGlobalQueryContext()

  const { data: org } = useQuery(GetProfilePic, { skip: signedUrlParams })
  const { currentUser } = org?.organization || ''
  const { profileImage, name, email } = currentUser || ''

  const [fetchOrg, { data }] = useLazyQuery(GetOrgName, {
    skip: !orgView || signedUrlParams
  })

  const { ...rest } = props

  useEffect(() => {
    if (location.pathname.startsWith('/vendor')) {
      setUserName(name || '')
    }
  }, [location, name, setUserName])

  const handleLogout = async () => {
    await logoutUser()
    setColorMode('light')
    navigate('/auth')
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

  const { setIsOpen, setCurrentStep, setSteps } = useTour()

  const onStartTour = () => {
    localStorage.setItem('tourCompleted', false)
    document.body.classList.add('no-scroll')
    if (sbomId) {
      setCurrentStep(3)
    } else {
      setCurrentStep(0)
    }
    setIsOpen(true)
  }

  const updateTour = (steps, name) => {
    localStorage.setItem('activeTour', name)
    setSteps(steps)
  }

  const onStartDashTour = () => {
    document?.body?.classList.add('no-scroll')
    if (dashboardView) {
      updateTour(homeSteps, 'dashboard')
    }
    if (productView) {
      updateTour(productSteps, 'products')
    }
    setCurrentStep(0)
    setIsOpen(true)
  }

  return (
    <Flex gap={3} alignItems='center' flexDirection='row'>
      {/* JOIN WAITLIST */}
      {signedUrlParams && (
        <Flex alignItems={'center'} gap={3}>
          <Button size='sm' onClick={onStartTour} hidden={!productId}>
            Start Tour
          </Button>
          <Link to='https://app.interlynk.io/register' target='_blank'>
            <Button className='signup' colorScheme='blue' size='sm'>
              Sign up
            </Button>
          </Link>
        </Flex>
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
          isReadOnly
          bg={bgColor}
          border='none'
          borderRadius={6}
          placeholder='Search..'
          onClick={query?.toggle}
          display={signedUrlParams ? 'none' : 'block'}
        />
        <Box pos={'absolute'} top={'0.2rem'} right={1.5}>
          <Kbd>{os?.startsWith('Windows') ? 'Ctrl' : 'Cmd'} + K</Kbd>
        </Box>
      </InputGroup>
      {/* DARK MODE */}
      <IconButton
        size='sm'
        onClick={toggleColorMode}
        icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
      />
      {!signedUrlParams && (
        <Menu>
          <MenuButton onClick={() => (orgView ? fetchOrg() : null)}>
            <Avatar
              size='sm'
              name={userName || name}
              src={`${SERVER_URL}/${profileImage?.url}`}
            />
          </MenuButton>
          <MenuList>
            <MenuGroup title=''>
              <MenuItem hidden={!name}>
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
              <MenuDivider hidden={!name} />
              <Link to={`/vendor/settings?tab=personal-details`}>
                <MenuItem
                  icon={<SettingsIcon />}
                  display={data?.organization ? 'flex' : 'none'}
                >
                  Settings
                </MenuItem>
              </Link>
              {(dashboardView || productView) && (
                <MenuItem
                  onClick={onStartDashTour}
                  icon={<FaLocationArrow />}
                  hidden={!shouldShowDemoFeatures || productId}
                >
                  Start {productView ? 'Product' : ''} Tour
                </MenuItem>
              )}
              <Link to='/vendor/settings?tab=organizations'>
                <MenuItem
                  icon={<FaExchangeAlt />}
                  display={data?.organization ? 'flex' : 'none'}
                >
                  Organizations
                </MenuItem>
              </Link>
              <MenuDivider hidden={!data?.organization} />
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

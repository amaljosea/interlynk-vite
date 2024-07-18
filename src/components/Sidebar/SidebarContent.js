import InterlynkLogo from 'assets/img/logo.png'
import { Link, useLocation } from 'react-router-dom'

import {
  Divider,
  Flex,
  Img,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import IconBox from 'components/Icons/IconBox'
import { SidebarHelp } from 'components/Sidebar/SidebarHelp'

import useAnalyticsEventTracker from 'hooks/useAnalyticsEventTracker'

const SidebarContent = ({ routes }) => {
  const location = useLocation()
  const activeUser = localStorage.getItem('email')
  const org = localStorage.getItem('organization')
  const isSuperAdmin = localStorage.getItem('isSuperAdmin')
  const dashboardView = location.pathname === '/vendor/dashboard'
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const urlParts = location.pathname.split('/')
  const category = urlParts[2]

  const gaEventTracker = useAnalyticsEventTracker('Interlynk Dashboard')

  const filterRoutes =
    activeUser === 'sp@interlynk.io' ||
    activeUser === 'surendra.pathak@interlynk' ||
    isSuperAdmin === 'true'
      ? routes
      : routes?.filter((item) => item?.name !== 'SAG')

  const activeBg = useColorModeValue('blue.500', 'blue.500')
  const inActiveBg = useColorModeValue('gray.100', 'gray.700')

  const activeRoute = (routeName) => {
    const parts = routeName.split('/')
    const name = parts[2]
    if (routeName === '/customer/') {
      return 'active'
    } else if (name === category) {
      return 'active'
    }
  }

  const createLinks = (routes) => {
    return routes.map((prop) => {
      const isActive = activeRoute(prop.layout + prop.path) === 'active'

      return (
        <Tooltip key={prop.name} label={prop.name} placement='right'>
          <Link
            className={dashboardView ? prop.name.toLowerCase() : ''}
            to={
              prop.path === '/settings'
                ? `${prop.layout}${prop.path}?tab=${org === 'undefined' ? 'organization' : 'general'}`
                : prop.layout + prop.path
            }
            onClick={() => gaEventTracker(prop.name)}
          >
            <IconBox
              h={'40px'}
              w={'40px'}
              color={isActive ? 'white' : 'blue.500'}
              bg={isActive ? activeBg : inActiveBg}
            >
              {prop.icon}
            </IconBox>
          </Link>
        </Tooltip>
      )
    })
  }

  const links = createLinks(filterRoutes)

  return (
    <Flex gap={4} py={3.5} flexDirection={'column'} alignItems={'center'}>
      <Link to={signedUrlParams ? `/customer/products` : `/vendor/dashboard`}>
        <Img src={InterlynkLogo} w='32px' h='32px' />
      </Link>
      <Divider />
      <Flex
        gap={3}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        {links}
      </Flex>
      <SidebarHelp />
    </Flex>
  )
}

export default SidebarContent

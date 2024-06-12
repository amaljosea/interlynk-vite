import InterlynkLogo from 'assets/img/logo.png'
import { Link, useLocation } from 'react-router-dom'

import { Divider, Flex, IconButton, Img, Tooltip } from '@chakra-ui/react'

import { SidebarHelp } from 'components/Sidebar/SidebarHelp'

import useAnalyticsEventTracker from 'hooks/useAnalyticsEventTracker'

const SidebarContent = ({ routes }) => {
  const location = useLocation()
  const activeUser = localStorage.getItem('email')
  const org = localStorage.getItem('organization')
  const isSuperAdmin = localStorage.getItem('isSuperAdmin')
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
            to={
              prop.path === '/settings'
                ? `${prop.layout}${prop.path}?tab=${org === 'undefined' ? 'organization' : 'general'}`
                : prop.layout + prop.path
            }
            onClick={() => gaEventTracker(prop.name)}
          >
            <IconButton
              icon={prop.icon}
              borderRadius={'lg'}
              color={isActive ? 'white' : 'blue.500'}
              colorScheme={isActive ? 'blue' : 'gray'}
            />
          </Link>
        </Tooltip>
      )
    })
  }

  const links = createLinks(filterRoutes)

  return (
    <Flex gap={4} py={6} flexDirection={'column'} alignItems={'center'}>
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

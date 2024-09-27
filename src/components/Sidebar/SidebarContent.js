import InterlynkLogo from 'assets/img/logo.png'
import { useEffect, useState } from 'react'
import ReactGA from 'react-ga4'
import { Link, useLocation } from 'react-router-dom'

import {
  Divider,
  Flex,
  Img,
  Spinner,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import IconBox from 'components/Icons/IconBox'
import { SidebarHelp } from 'components/Sidebar/SidebarHelp'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

const SidebarContent = ({ routes }) => {
  const location = useLocation()
  const activeUser = localStorage.getItem('email')
  const isSuperAdmin = localStorage.getItem('isSuperAdmin')
  const dashboardView = location.pathname === '/vendor/dashboard'
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const urlParts = location.pathname.split('/')
  const category = urlParts[2]

  const { orgView, isFreeTier, orgQueryLoading } = useGlobalQueryContext()
  const [routesActual, setRoutesActual] = useState([])

  const handleClick = (prop) => {
    ReactGA.send({ hitType: 'pageview', page: prop.path, title: prop.name })
  }

  useEffect(() => {
    // Filter routes based on the active user and free tier status
    const filterRoutes =
      activeUser === 'sp@interlynk.io' ||
      activeUser === 'surendra.pathak@interlynk' ||
      isSuperAdmin === 'true'
        ? routes
        : routes.filter((item) => item.name !== 'SAG')

    const updatedRoutes = isFreeTier
      ? filterRoutes.filter(
          (route) =>
            route.name !== 'Requests' &&
            route.name !== 'Licenses' &&
            route.name !== 'Analytics' &&
            route.name !== 'Support'
        )
      : filterRoutes

    setRoutesActual(updatedRoutes)
  }, [isFreeTier, routes, activeUser, isSuperAdmin])

  if (orgQueryLoading) {
    return (
      <Flex align='center' justify='center' h='100vh'>
        <Spinner />
      </Flex>
    )
  }

  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const inActiveBg = useColorModeValue('gray.100', 'gray.700')

  const activeRoute = (routeName) => {
    const parts = routeName.split('/')
    const name = parts[2]
    if (routeName === '/customer/') {
      return 'active'
    } else if (name?.includes(category)) {
      return 'active'
    }
  }

  const createLinks = (routes) => {
    return routes.map((prop) => {
      const { name, path, layout, icon } = prop || ''
      const isActive = activeRoute(layout + path) === 'active'
      return (
        <Tooltip key={name} label={name} placement='right'>
          <Link
            className={dashboardView ? name.toLowerCase() : ''}
            to={
              path === '/settings'
                ? `${layout}${path}?tab=${!orgView ? 'organization' : 'users'}`
                : layout + path
            }
            onClick={() => handleClick(prop)}
          >
            <IconBox
              h={'40px'}
              w={'40px'}
              color={isActive ? 'white' : primaryBlueText}
              bg={isActive ? primaryBlueText : inActiveBg}
            >
              {icon}
            </IconBox>
          </Link>
        </Tooltip>
      )
    })
  }

  const links = createLinks(routesActual)

  return (
    <Flex gap={4} py={5} flexDirection={'column'} alignItems={'center'}>
      <Link to={signedUrlParams ? `/customer/products` : `/vendor/dashboard`}>
        <Img src={InterlynkLogo} w='32px' h='32px' className='welcome' />
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

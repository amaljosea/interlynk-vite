import InterlynkLogo from 'assets/img/logo.png'
import { useEffect, useState } from 'react'
import ReactGA from 'react-ga4'
import { Link, useLocation } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { Divider, Flex, Img, Tooltip } from '@chakra-ui/react'

import IconBox from 'components/Icons/IconBox'
import { SidebarHelp } from 'components/Sidebar/SidebarHelp'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

const SidebarContent = ({ routes }) => {
  const location = useLocation()
  const dashboardView = location.pathname === '/vendor/dashboard'
  const signedUrlParams = getSignedUrlParams()
  const urlParts = location.pathname.split('/')
  const category = urlParts[2]

  const { organization } = useGlobalState()
  const [routesActual, setRoutesActual] = useState([])

  const handleClick = (prop) => {
    ReactGA.send({ hitType: 'pageview', page: prop.path, title: prop.name })
  }

  useEffect(() => {
    // Filter routes based on the active user and free tier status
    const isFreeTier = organization?.tier === 'free'
    const updatedRoutes = isFreeTier
      ? routes.filter(
          (route) =>
            route.name !== 'Requests' &&
            route.name !== 'Licenses' &&
            route.name !== 'Analytics' &&
            route.name !== 'Support'
        )
      : routes
    setRoutesActual(updatedRoutes)
  }, [organization, routes])

  const { primaryBlueText, secondaryBgColor } = useThemeColor([
    'primaryBlueText',
    'secondaryBgColor'
  ])

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
                ? `${layout}${path}?tab=${!organization ? 'organization' : 'users'}`
                : layout + path
            }
            onClick={() => handleClick(prop)}
            target={name === 'Documentation' ? '_blank' : '_self'}
          >
            <IconBox
              h={'40px'}
              w={'40px'}
              color={isActive ? 'white' : primaryBlueText}
              bg={isActive ? primaryBlueText : secondaryBgColor}
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

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
  const category = location.pathname.split('/')[2]
  const { organization } = useGlobalState()
  const [filteredRoutes, setFilteredRoutes] = useState([])

  const { primaryBlueText, secondaryBgColor } = useThemeColor([
    'primaryBlueText',
    'secondaryBgColor'
  ])

  useEffect(() => {
    // Filter routes based on the active user and free tier status
    const isFreeTier = organization?.tier === 'free'
    const updatedRoutes =
      isFreeTier || !organization
        ? routes.filter(
            (route) =>
              !['Requests', 'Licenses', 'Analytics', 'Support'].includes(
                route.name
              )
          )
        : routes
    setFilteredRoutes(updatedRoutes)
  }, [organization, routes])

  const handleClick = (route) => {
    ReactGA.send({ hitType: 'pageview', page: route.path, title: route.name })
  }

  const isActiveRoute = (routeName) => {
    const name = routeName.split('/')[2]
    return routeName === '/customer/' || name?.includes(category)
      ? 'active'
      : ''
  }

  const renderLink = (route) => {
    const { name, path, layout, icon } = route
    const isActive = isActiveRoute(layout + path) === 'active'
    const toPath =
      path === '/settings'
        ? `${layout}${path}?tab=${!organization ? 'organization' : 'users'}`
        : layout + path

    return (
      <Tooltip key={name} label={name} placement='right'>
        <Link
          to={toPath}
          aria-label={name.toLowerCase()}
          onClick={() => handleClick(route)}
          className={dashboardView ? name.toLowerCase() : ''}
          target={name === 'Documentation' ? '_blank' : '_self'}
        >
          <IconBox
            sx={{ w: '40px', h: '40px' }}
            color={isActive ? 'white' : primaryBlueText}
            bg={isActive ? primaryBlueText : secondaryBgColor}
          >
            {icon}
          </IconBox>
        </Link>
      </Tooltip>
    )
  }

  return (
    <Flex gap={4} py={5} flexDirection={'column'} alignItems={'center'}>
      <Link to={signedUrlParams ? `/customer/products` : `/vendor/dashboard`}>
        <Img
          w='32px'
          h='32px'
          alt='Interlynk'
          src={InterlynkLogo}
          className='welcome'
        />
      </Link>
      <Divider />
      <Flex
        gap={3}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        {filteredRoutes.map(renderLink)}
      </Flex>
      <SidebarHelp />
    </Flex>
  )
}

export default SidebarContent

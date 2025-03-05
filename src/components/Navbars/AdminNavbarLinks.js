import { useTour } from '@reactour/tour'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { customerRoutes } from 'routes'
import { dashRoutes } from 'routes.js'
import { getSignedUrlParams } from 'utils'
import { logoutUser } from 'utils/authUtils'
import { getItem, removeItem, setItem } from 'utils/localStorageUtils'

import { Button, Flex, useColorMode } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import Loading from 'components/Misc/Loading'
import Organizations from 'components/Organizations'
// Custom Components
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'

import { useGlobalState } from 'hooks/useGlobalState'

import { FaDesktop, FaMoon, FaSun } from 'react-icons/fa6'

import { SearchBar } from './SearchBar'
import { UserMenu } from './UserMenu'

export default function AdminNavbarLinks(props) {
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const { organization } = useGlobalState()
  const { colorMode, setColorMode } = useColorMode()
  const [currentMode, setCurrentMode] = useState(colorMode || 'system')

  const signedUrlParams = getSignedUrlParams()

  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await logoutUser().then(() => setLoading(false))
  }

  const { setIsOpen, setCurrentStep } = useTour()

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

  const onThemeChange = (mode) => {
    setCurrentMode(mode)
    setColorMode(mode)
  }

  return (
    <Flex gap={3} alignItems='center' flexDirection='row'>
      {/* JOIN WAITLIST */}
      {signedUrlParams && (
        <Flex alignItems={'center'} gap={3}>
          <Button
            title='Start tour'
            size='sm'
            onClick={onStartTour}
            hidden={!productId}
          >
            Start Tour
          </Button>
          <Link to={`/register`} target='_blank'>
            <Button
              title='Sign up'
              className='signup'
              colorScheme='blue'
              size='sm'
            >
              Sign up
            </Button>
          </Link>
        </Flex>
      )}

      {/* SEARCH */}
      <SearchBar />

      {/* THEME */}
      <Menu>
        <MenuButton size={'sm'} as={Button}>
          {currentMode === 'light' ? (
            <FaSun />
          ) : currentMode === 'dark' ? (
            <FaMoon />
          ) : (
            <FaDesktop />
          )}
        </MenuButton>
        <MenuList fontSize='sm'>
          <MenuItem icon={<FaSun />} onClick={() => onThemeChange('light')}>
            Light
          </MenuItem>
          <MenuItem icon={<FaMoon />} onClick={() => onThemeChange('dark')}>
            Dark
          </MenuItem>
          <MenuItem
            icon={<FaDesktop />}
            onClick={() => onThemeChange('system')}
          >
            System
          </MenuItem>
        </MenuList>
      </Menu>

      {/* ORGANIZATIONS */}
      {!signedUrlParams && organization && <Organizations />}

      {/* USER MENU */}
      {!signedUrlParams && <UserMenu handleLogout={handleLogout} />}

      <SidebarResponsive
        logoText={props.logoText}
        secondary={props.secondary}
        routes={signedUrlParams ? customerRoutes : dashRoutes}
        {...props}
      />

      {/* LOADING */}
      {loading && <Loading type={'signout'} />}
    </Flex>
  )
}

AdminNavbarLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func
}

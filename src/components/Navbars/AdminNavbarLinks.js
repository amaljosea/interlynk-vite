import { useTour } from '@reactour/tour'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'
import { logoutUser } from 'utils/authUtils'

import { Button, Flex, IconButton, useColorMode } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import Loading from 'components/Misc/Loading'
import OrgMenu from 'components/OrgMenu'
// Custom Components
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'

import { useGlobalState } from 'hooks/useGlobalState'
import { useRoutes } from 'hooks/useRoutes'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu'

import { SearchBar } from './SearchBar'
import { UserMenu } from './UserMenu'

export default function AdminNavbarLinks(props) {
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const { organization } = useGlobalState()
  const { colorMode, setColorMode } = useColorMode()
  const [currentMode, setCurrentMode] = useState(colorMode || 'system')
  const { vendor, customer } = useRoutes()

  const signedUrlParams = getSignedUrlParams()
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

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

  const iconStyle = { fontSize: 20, color: secondaryTextColor }

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
      {!signedUrlParams && <SearchBar />}

      {/* THEME */}
      <Menu>
        <MenuButton size={'sm'} as={IconButton} variant={'ghost'}>
          {currentMode === 'light' ? (
            <LuSun {...iconStyle} style={{ margin: '0 auto' }} />
          ) : currentMode === 'dark' ? (
            <LuMoon {...iconStyle} style={{ margin: '0 auto' }} />
          ) : (
            <LuMonitor {...iconStyle} style={{ margin: '0 auto' }} />
          )}
        </MenuButton>
        <MenuList minWidth='120px' fontSize='sm'>
          <MenuItem onClick={() => onThemeChange('light')}>Light</MenuItem>
          <MenuItem onClick={() => onThemeChange('dark')}>Dark</MenuItem>
          <MenuItem onClick={() => onThemeChange('system')}>System</MenuItem>
        </MenuList>
      </Menu>

      {/* ORGANIZATIONS */}
      {!signedUrlParams && organization && <OrgMenu />}

      {/* USER MENU */}
      {!signedUrlParams && <UserMenu handleLogout={handleLogout} />}

      <SidebarResponsive
        {...props}
        logoText={props.logoText}
        secondary={props.secondary}
        routes={signedUrlParams ? customer : vendor}
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

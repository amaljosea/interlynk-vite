import { useTour } from '@reactour/tour'
import PropTypes from 'prop-types'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { customerRoutes } from 'routes'
import { dashRoutes } from 'routes.js'
import { getSignedUrlParams } from 'utils'
import { logoutUser } from 'utils/authUtils'

import { Button, Flex, IconButton, useColorMode } from '@chakra-ui/react'

// Custom Components
import SidebarResponsive from 'components/Sidebar/SidebarResponsive'

import { FaMoon, FaSun } from 'react-icons/fa6'

import { SearchBar } from './SearchBar'
import { UserMenu } from './UserMenu'

export default function AdminNavbarLinks(props) {
  const navigate = useNavigate()
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const { colorMode, toggleColorMode, setColorMode } = useColorMode()

  const signedUrlParams = getSignedUrlParams()

  const handleLogout = async () => {
    await logoutUser()
    setColorMode('light')
    navigate('/auth')
  }

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

  return (
    <Flex gap={3} alignItems='center' flexDirection='row'>
      {/* JOIN WAITLIST */}
      {signedUrlParams && (
        <Flex alignItems={'center'} gap={3}>
          <Button size='sm' onClick={onStartTour} hidden={!productId}>
            Start Tour
          </Button>
          <Link to={`/register`} target='_blank'>
            <Button className='signup' colorScheme='blue' size='sm'>
              Sign up
            </Button>
          </Link>
        </Flex>
      )}

      {/* SEARCH */}

      <SearchBar />

      {/* DARK MODE */}
      <IconButton
        size='sm'
        onClick={toggleColorMode}
        icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
      />

      {/* USER MENU */}
      {!signedUrlParams && <UserMenu handleLogout={handleLogout} />}

      <SidebarResponsive
        logoText={props.logoText}
        secondary={props.secondary}
        routes={signedUrlParams ? customerRoutes : dashRoutes}
        {...props}
      />
    </Flex>
  )
}

AdminNavbarLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func
}

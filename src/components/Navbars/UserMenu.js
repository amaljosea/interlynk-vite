import { useTour } from '@reactour/tour'
import { Link, useParams } from 'react-router-dom'
import { homeSteps, productSteps } from 'utils/tourUtils'

import { Avatar, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaBuilding, FaSignOutAlt } from 'react-icons/fa'
import { FaLocationArrow, FaUser } from 'react-icons/fa6'

const SERVER_URL = process.env.REACT_APP_SERVER

export const UserMenu = ({ handleLogout }) => {
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const { organization } = useGlobalState()
  const params = useParams()
  const { setIsOpen, setCurrentStep, setSteps } = useTour()

  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  const productId = params.productid
  const dashboardView = location.pathname === '/vendor/dashboard'
  const productView = location.pathname === '/vendor/products'

  const currentUser = organization?.currentUser

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
    <Menu>
      <MenuButton>
        <Avatar
          size='sm'
          name={currentUser?.name}
          src={`${SERVER_URL}/${currentUser?.profileImage?.url}`}
        />
      </MenuButton>
      <MenuList fontSize='sm'>
        <MenuGroup>
          <MenuItem hidden={!currentUser}>
            <Link to={`/vendor/settings?tab=security tokens`}>
              <Flex flexDirection='row' alignItems='flex-start' gap={3}>
                <Icon as={FaUser} width={2.5} mt={1} />
                <Stack spacing={0}>
                  {currentUser?.name && <Text>{currentUser?.name}</Text>}
                  <Text fontSize='sm' color={sameSecondaryText}>
                    {currentUser?.email}
                  </Text>
                </Stack>
              </Flex>
            </Link>
          </MenuItem>
          <MenuDivider hidden={!currentUser} />
          {(dashboardView || productView) && (
            <MenuItem
              onClick={onStartDashTour}
              icon={<FaLocationArrow />}
              hidden={!shouldShowDemoFeatures || productId}
            >
              Start {productView ? 'Product' : ''} Tour
            </MenuItem>
          )}
          <Link to={`/vendor/settings?tab=users`}>
            <MenuItem
              icon={<FaBuilding />}
              display={organization ? 'flex' : 'none'}
            >
              Organizations
            </MenuItem>
          </Link>
          <MenuDivider hidden={!organization} />
          <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
            Logout
          </MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  )
}

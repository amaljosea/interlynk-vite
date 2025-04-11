import { useTour } from '@reactour/tour'
import { Link, useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'
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
import { useRouteFlags } from 'hooks/useRouteFlags'
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
  const { isDashboardView, isProductsPage } = useRouteFlags()

  const currentUser = organization?.currentUser
  const userName = currentUser?.name
    ? truncatedValue(currentUser?.name, 20)
    : 'N/A'

  const updateTour = (steps, name) => {
    localStorage.setItem('activeTour', name)
    setSteps(steps)
  }

  const onStartDashTour = () => {
    document?.body?.classList.add('no-scroll')
    if (isDashboardView) {
      updateTour(homeSteps, 'dashboard')
    }
    if (isProductsPage) {
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
                  {currentUser?.name && <Text>{userName}</Text>}
                  <Text fontSize='sm' color={sameSecondaryText}>
                    {currentUser?.email}
                  </Text>
                </Stack>
              </Flex>
            </Link>
          </MenuItem>
          <MenuDivider hidden={!currentUser} />
          {(isDashboardView || isProductsPage) && (
            <MenuItem
              onClick={onStartDashTour}
              icon={<FaLocationArrow />}
              hidden={!shouldShowDemoFeatures || productId}
            >
              Start {isProductsPage ? 'Product' : ''} Tour
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

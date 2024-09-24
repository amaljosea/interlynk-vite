import { TourProvider, useTour } from '@reactour/tour'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { KBarProvider } from 'kbar'
import React, { useEffect } from 'react'
import { Outlet, redirect, useNavigate, useParams } from 'react-router-dom'
import { dashRoutes } from 'routes.js'

import { Box, Flex, Stack, Text, useColorMode } from '@chakra-ui/react'

import Kbar from 'components/Kbar'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { FaArrowLeft, FaArrowRight, FaRegFile } from 'react-icons/fa6'

import { getActiveNavbar, getActiveRoute, tourStyles } from '../utils'
import { logoutUser } from '../utils/authUtils'

export default function Admin() {
  const params = useParams()

  const { steps } = useTour()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()

  const productId = params.productid
  const sbomId = params.sbomid
  const authToken = Cookies.get('authToken')
  const tabRes = window.matchMedia('(max-width: 1199px)')
  const productView = location.pathname === '/vendor/products'

  const {
    generateProductDetailPageUrlFromCurrentUrl: genProdUrl,
    generateProductVersionDetailPageUrlFromCurrentUrl: getSbomUrl
  } = useProductUrlContext()

  document.documentElement.dir = 'ltr'
  // Chakra Color Mode

  const isTokenExpired = (token) => {
    const decodedToken = jwtDecode(token)
    if (!decodedToken) {
      return true
    }
    const currentTime = Date.now() / 1000
    return decodedToken.exp < currentTime
  }

  const actions = [
    {
      id: 'home',
      name: 'Home',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/dashboard')
    },
    {
      id: 'products',
      name: 'Products',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/products')
    },
    {
      id: 'requests',
      name: 'Requests',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/requests')
    },
    {
      id: 'vulnerabilities',
      name: 'Vulnerabilities',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/vulnerabilities')
    },
    {
      id: 'licenses',
      name: 'Licenses',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/licenses')
    },
    {
      id: 'analytics',
      name: 'Analytics',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/analytics')
    },
    {
      id: 'tools',
      name: 'Tools',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/tools')
    },
    {
      id: 'support',
      name: 'Support',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/support')
    },
    {
      id: 'policies',
      name: 'Policies',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/policies')
    },
    {
      id: 'settings',
      name: 'Settings',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/settings?tab=users')
    }
  ]

  const onTourUpdate = (value) => {
    document?.body?.classList.remove('no-scroll')
    value.setIsOpen(false)
  }

  const onProdNavigate = (step) => {
    if (step === 3) {
      const link = genProdUrl({ paramsObj: { tab: 'versions' } })
      navigate(link)
    } else if (step === 4) {
      const link = genProdUrl({ paramsObj: { tab: 'vulnerabilities' } })
      navigate(link)
    } else if (step === 5) {
      const link = genProdUrl({ paramsObj: { tab: 'automation rules' } })
      navigate(link)
    } else if (step === 6) {
      const link = genProdUrl({ paramsObj: { tab: 'policies' } })
      navigate(link)
    }
  }

  const onSbomNavigate = (step) => {
    if (step === 8) {
      const link = getSbomUrl({ paramsObj: { tab: 'general' } })
      navigate(link)
    } else if (step === 9) {
      const link = getSbomUrl({ paramsObj: { tab: 'parts' } })
      navigate(link)
    } else if (step === 10) {
      const link = getSbomUrl({ paramsObj: { tab: 'components' } })
      navigate(link)
    } else if (step === 11) {
      const link = getSbomUrl({ paramsObj: { tab: 'vulnerabilities' } })
      navigate(link)
    } else if (step === 12) {
      const link = getSbomUrl({ paramsObj: { tab: 'licenses' } })
      navigate(link)
    } else if (step === 13) {
      const link = getSbomUrl({ paramsObj: { tab: 'checks' } })
      navigate(link)
    }
  }

  const onClickPrev = (props) => {
    const { currentStep, setCurrentStep } = props
    if (productId && !sbomId) {
      onProdNavigate(currentStep - 1)
    }
    if (productId && sbomId) {
      onSbomNavigate(currentStep - 1)
    }
    setTimeout(() => {
      setCurrentStep(currentStep - 1)
    }, 600)
  }

  const onClickNext = (props) => {
    const { currentStep, setCurrentStep } = props
    if (productId && !sbomId) {
      onProdNavigate(currentStep + 1)
    }
    if (productId && sbomId) {
      onSbomNavigate(currentStep + 1)
    }
    setCurrentStep(currentStep + 1)
  }

  const onComplete = (props) => {
    localStorage.removeItem('activeTour')
    document?.body?.classList.remove('no-scroll')
    props?.setIsOpen(false)
  }

  useEffect(() => {
    if (authToken) {
      try {
        const expired = isTokenExpired(authToken)
        if (expired === true) {
          logoutUser().then(() => navigate('/auth'))
        }
      } catch (err) {
        console.error('Invalid Token')
        logoutUser().then(() => navigate('/auth'))
      }
    }
  }, [authToken, navigate])

  useEffect(() => {
    if (!authToken) {
      navigate('/auth')
    }
  }, [authToken, navigate])

  useEffect(() => {
    if (location.pathname.startsWith('/vendor')) {
      redirect('/vendor/dashboard')
      sessionStorage.removeItem('awsToken')
      sessionStorage.removeItem('signedUrlParams')
    }
  }, [])

  return (
    <KBarProvider actions={actions} options={{ enableHistory: true }}>
      <Kbar />
      <Stack
        spacing={0}
        width={'100%'}
        direction={'row'}
        alignItems={'flex-start'}
        bg='rgba(0,0,0,0.04)'
      >
        <TourProvider
          steps={steps}
          position={'right'}
          styles={tourStyles}
          nextButton={(props) =>
            props?.stepsLength !== props?.currentStep + 1 ? (
              <FaArrowRight
                cursor={'pointer'}
                onClick={() => onClickNext(props)}
                style={{
                  display:
                    productId && props?.currentStep === 6 ? 'none' : 'flex'
                }}
              />
            ) : (
              <Text cursor={'pointer'} onClick={() => onComplete(props)}>
                Finish
              </Text>
            )
          }
          disableKeyboardNavigation={true}
          prevButton={(props) =>
            props?.stepsLength !== 1 &&
            props?.currentStep !== 0 && (
              <FaArrowLeft
                cursor={'pointer'}
                onClick={() => onClickPrev(props)}
                style={{
                  display:
                    (productId && props?.currentStep === 1) ||
                    (productId && sbomId && props?.currentStep === 7)
                      ? 'none'
                      : 'flex'
                }}
              />
            )
          }
          showPrevNextButtons={!productView}
          onClickClose={(value) => onTourUpdate(value)}
          onClickMask={(value) => onTourUpdate(value)}
          badgeContent={(props) =>
            `${props?.currentStep + 1}/${props?.totalSteps}`
          }
        >
          <Box pos={'sticky'} top={0}>
            <Sidebar routes={dashRoutes} />
          </Box>
          <Flex width={'100%'} flexDir={'column'}>
            <Box
              top={0}
              zIndex={111}
              pos={'sticky'}
              bg={colorMode === 'light' ? 'white' : 'gray.900'}
              borderBottom={`1px solid ${colorMode === 'light' ? '#E2E8F0' : '#1A202C'}`}
            >
              <AdminNavbar
                tabRes={tabRes}
                brandText={getActiveRoute(dashRoutes)}
                secondary={getActiveNavbar(dashRoutes)}
              />
            </Box>
            <Box my={5} px={6}>
              <Outlet />
            </Box>
          </Flex>
        </TourProvider>
      </Stack>
    </KBarProvider>
  )
}

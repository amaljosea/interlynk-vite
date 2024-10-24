import { useQuery } from '@apollo/client'
import { TourProvider, useTour } from '@reactour/tour'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { KBarProvider } from 'kbar'
import React, { useEffect } from 'react'
import { Outlet, redirect, useNavigate, useParams } from 'react-router-dom'
import { dashRoutes } from 'routes.js'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { Alert, Box, Button, Center, Flex, Stack, Text } from '@chakra-ui/react'
import { AlertDescription, AlertIcon, AlertTitle } from '@chakra-ui/react'
import { useColorMode, useMediaQuery } from '@chakra-ui/react'

import DeviceWarning from 'components/DeviceWarning'
import Kbar from 'components/Kbar'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { getOrganization } from 'graphQL/Queries'

import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6'

import {
  displayErrorMessage,
  getActiveNavbar,
  getActiveRoute,
  tourStyles
} from '../utils'
import { logoutUser } from '../utils/authUtils'

export default function Admin() {
  const params = useParams()

  const { steps } = useTour()
  const navigate = useNavigate()
  const { setColorMode } = useColorMode()
  const { organization, setOrganization } = useGlobalState()
  const [isDesktop] = useMediaQuery('(min-width: 1024px)')

  const productId = params.productid
  const sbomId = params.sbomid
  const authToken = Cookies.get('authToken')
  const tabRes = window.matchMedia('(max-width: 1199px)')
  const productView = location.pathname === '/vendor/products'

  const {
    generateProductDetailPageUrlFromCurrentUrl: genProdUrl,
    generateProductVersionDetailPageUrlFromCurrentUrl: getSbomUrl
  } = useProductUrlContext()

  const { mainContrastBgColor, neutralBorder } = useThemeColor([
    'mainContrastBgColor',
    'neutralBorder'
  ])

  document.documentElement.dir = 'ltr'

  const { data, error, loading } = useQuery(getOrganization, {
    skip: location.pathname.startsWith('/vendor') && authToken ? false : true
  })

  const isTokenExpired = (token) => {
    const decodedToken = jwtDecode(token)
    if (!decodedToken) {
      return true
    }
    const currentTime = Date.now() / 1000
    return decodedToken.exp < currentTime
  }

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

  const handleLogout = async () => {
    await logoutUser()
    setColorMode('light')
    navigate('/auth')
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

  useEffect(() => {
    if (data && data.organization) {
      setOrganization(data.organization)
    }
  }, [data, setOrganization])

  if (error) {
    return (
      <Center>
        <Alert
          status='error'
          variant='subtle'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          height='240px'
        >
          <AlertIcon boxSize='40px' mr={0} />
          <AlertTitle mt={4} mb={1} fontSize='lg'>
            {displayErrorMessage(
              error?.networkError?.statusCode,
              error?.message
            )}
          </AlertTitle>
          <AlertDescription mt={4} maxWidth='sm'>
            <Button onClick={handleLogout}>Logout</Button>
          </AlertDescription>
        </Alert>
      </Center>
    )
  }

  if (!isDesktop) return <DeviceWarning />

  return (
    <KBarProvider options={{ enableHistory: true }}>
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
              bg={mainContrastBgColor}
              borderBottom={`1px solid ${neutralBorder}`}
            >
              <AdminNavbar
                tabRes={tabRes}
                brandText={getActiveRoute(dashRoutes)}
                secondary={getActiveNavbar(dashRoutes)}
              />
            </Box>
            <Box my={4} px={5}>
              {organization ? <Outlet /> : <OrgRegister loading={loading} />}
            </Box>
          </Flex>
        </TourProvider>
      </Stack>
    </KBarProvider>
  )
}

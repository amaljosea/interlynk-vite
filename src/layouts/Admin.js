/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery } from '@apollo/client'
import { TourProvider, useTour } from '@reactour/tour'
import NotFound from 'assets/svg/not-found.svg'
import Cookies from 'js-cookie'
import { KBarProvider } from 'kbar'
import React, { useEffect } from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom'
import { displayErrorMessage } from 'utils/errorUtils'
import { getItem, setItem } from 'utils/localStorageUtils'
import { tourStyles } from 'utils/tourUtils'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { Box, Button, Center, Flex, Img, Stack, Text } from '@chakra-ui/react'

import DeviceWarning from 'components/DeviceWarning'
import Kbar from 'components/Kbar'
import Loading from 'components/Misc/Loading'
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useRoutes } from 'hooks/useRoutes'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetOrganization } from 'graphQL/Queries'

import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'

import { getActiveNavbar, getActiveRoute, isMobileOrTablet } from '../utils'
import { logoutUser } from '../utils/authUtils'

export default function Admin() {
  const params = useParams()

  const { steps } = useTour()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    setOrganization,
    setSelectedAnalytics,
    setSelectedProducts,
    setSelectedActivities,
    setSelectedPolicies,
    setSelectedTrends,
    setSelectedVulns
  } = useGlobalState()
  const isMobile = isMobileOrTablet()

  const cards = getItem('selectedCards')
  const analytics = getItem('selectedAnalytics')

  const selectedCards = cards ? JSON.parse(cards) : null
  const selectedAnalyticsCards = analytics ? JSON.parse(analytics) : []

  const { activities, products, vulns, trends, policies } = selectedCards || {}

  const productId = params.productid
  const sbomId = params.sbomid
  const authToken = Cookies.get('authToken')
  const tabRes = window.matchMedia('(max-width: 1199px)')
  const { vendor } = useRoutes()
  const { isProductsPage, isVendorPage, isVendorRootPage } = useRouteFlags()

  const {
    generateProductDetailPageUrlFromCurrentUrl: genProdUrl,
    generateProductVersionDetailPageUrlFromCurrentUrl: getSbomUrl
  } = useProductUrlContext()

  const { mainContrastBgColor, neutralBorder, primaryBlueText } = useThemeColor(
    ['mainContrastBgColor', 'neutralBorder', 'primaryBlueText']
  )

  document.documentElement.dir = 'ltr'

  const { data, error, loading } = useQuery(GetOrganization, {
    skip: isVendorPage && authToken ? false : true
  })

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
    setOrganization(null)
  }

  useEffect(() => {
    if (!authToken) {
      logoutUser().then(() => setOrganization(null))
    }
  }, [authToken, setOrganization])

  useEffect(() => {
    if (isVendorRootPage) {
      navigate('/vendor/dashboard')
      sessionStorage.removeItem('awsToken')
      sessionStorage.removeItem('signedUrlParams')
    }
  }, [])

  useEffect(() => {
    if (data && data.organization) {
      const { id, name } = data.organization || {}
      setOrganization(data.organization)
      setSelectedProducts(products)
      setSelectedActivities(activities)
      setSelectedTrends(trends)
      setSelectedVulns(vulns)
      setSelectedPolicies(policies)
      setSelectedAnalytics(selectedAnalyticsCards)
      setItem('organization', JSON.stringify({ id: id, name: name }))
    } else {
      setOrganization(null)
    }
  }, [data, setOrganization])

  if (!authToken) {
    return <Navigate to='/auth' state={{ from: location }} replace />
  }

  if (error) {
    return (
      <Center as={Flex} flexDir={'column'} h={'100vh'}>
        <Text fontSize='3xl' fontWeight={'semibold'} color={primaryBlueText}>
          Something went wrong
        </Text>
        <Text mt={2}>
          {displayErrorMessage(error?.networkError?.statusCode, error?.message)}
        </Text>
        <Button title='Logout' colorScheme='blue' mt={4} onClick={handleLogout}>
          Logout
        </Button>
        <Img alt='Not found' src={NotFound} width={'36%'} />
      </Center>
    )
  }

  if (isMobile) return <DeviceWarning />

  if (loading) return <Loading type='login' />

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
              <LuArrowRight
                size={18}
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
              <LuArrowLeft
                size={18}
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
          showPrevNextButtons={!isProductsPage}
          onClickClose={(value) => onTourUpdate(value)}
          onClickMask={(value) => onTourUpdate(value)}
          badgeContent={(props) =>
            `${props?.currentStep + 1}/${props?.totalSteps}`
          }
        >
          <Box pos={'sticky'} top={0}>
            <Sidebar routes={vendor} />
          </Box>
          <Flex width={'100%'} flexDir={'column'}>
            <Box
              top={0}
              zIndex={1111}
              pos={'sticky'}
              bg={mainContrastBgColor}
              borderBottom={`1px solid ${neutralBorder}`}
            >
              <AdminNavbar
                tabRes={tabRes}
                brandText={getActiveRoute(vendor)}
                secondary={getActiveNavbar(vendor)}
              />
            </Box>
            <Box my={4} px={5}>
              {data?.organization ? <Outlet /> : <OrgRegister />}
            </Box>
          </Flex>
        </TourProvider>
      </Stack>
    </KBarProvider>
  )
}

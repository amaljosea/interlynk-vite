// Chakra Imports
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  useColorModeValue
} from '@chakra-ui/react'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import AdminNavbarLinks from './AdminNavbarLinks'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useGlobalState } from 'hooks/useGlobalState'
import { GetUserPermissions } from 'graphQL/Queries'
import { useQuery } from '@apollo/client'
import { permissionList } from 'utils'

export default function AdminNavbar(props) {
  const {
    setActiveSbomTab,
    setActiveCsSbomTab,
    userPermissions,
    setUserPermissions
  } = useGlobalState()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const {} = useQuery(GetUserPermissions, {
    skip: [...userPermissions]?.length === 0 ? false : true,
    onCompleted: (data) => {
      const permissions = permissionList(
        data?.organization?.currentUser?.role?.permissionsMap || []
      )
      setUserPermissions(permissions)
    }
  })

  function parseJSONSafely(str) {
    try {
      return JSON.parse(str)
    } catch (e) {
      console.err(e)
      // Return a default object, or null based on use case.
      return {}
    }
  }

  const [scrolled, setScrolled] = useState(false)
  const { brandText, tabRes } = props
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const prodID = queryParams.get('id')
  const parts = queryParams.get('parts')
  const sbomId = queryParams.get('sbom')
  const vulnId = queryParams.get('vulnId')
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const activeVuln = localStorage.getItem('activeVuln')
  const activeEnv = localStorage.getItem('activeEnv')
  const imageName = localStorage.getItem('Image')
  const currentProduct = (() => {
    try {
      return parseJSONSafely(localStorage.getItem(`product`))
    } catch (error) {
      console.log(error)
      return null
    }
  })()
  const currentSBOM = (() => {
    try {
      return parseJSONSafely(localStorage.getItem(`currentSBOM`))
    } catch (error) {
      console.log(error)
      return null
    }
  })()
  const subProduct = (() => {
    try {
      return parseJSONSafely(localStorage.getItem('subProduct'))
    } catch (error) {
      console.log(error)
      return null
    }
  })()

  const urlParts = location.pathname.split('/')
  const category = urlParts[2]

  // Here are all the props that may change depending on navbar's type or state.(secondary, variant, scrolled)
  let mainText = useColorModeValue('gray.700', 'gray.200')
  let secondaryText = useColorModeValue('gray.400', 'gray.200')
  let navbarPosition = 'absolute'
  let navbarBg = 'none'
  let navbarBorder = 'transparent'
  let secondaryMargin = '0px'
  if (props.fixed === true)
    if (scrolled === true) {
      navbarPosition = 'fixed'
      navbarShadow = useColorModeValue(
        '0px 7px 23px rgba(0, 0, 0, 0.05)',
        'none'
      )
      navbarBg = useColorModeValue(
        'linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)',
        'linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)'
      )
      navbarBorder = useColorModeValue('#FFFFFF', 'rgba(255, 255, 255, 0.31)')
      navbarFilter = useColorModeValue(
        'none',
        'drop-shadow(0px 7px 23px rgba(0, 0, 0, 0.05))'
      )
    }
  if (props.secondary) {
    navbarBackdrop = 'none'
    navbarPosition = 'absolute'
    mainText = 'white'
    secondaryText = 'white'
    secondaryMargin = '22px'
    paddingX = '30px'
  }

  useEffect(() => {
    if (!parts) {
      window.localStorage.removeItem('subProduct')
    }
  }, [parts])

  return (
    <Flex
      position={navbarPosition}
      bg={navbarBg}
      borderColor={navbarBorder}
      borderWidth='1.5px'
      borderStyle='solid'
      transitionDelay='0s, 0s, 0s, 0s'
      transitionDuration=' 0.25s, 0.25s, 0.25s, 0s'
      transition-property='box-shadow, background-color, filter, border'
      transitionTimingFunction='linear, linear, linear, linear'
      borderRadius='16px'
      display='flex'
      minH='75px'
      lineHeight='25.6px'
      mt={secondaryMargin}
      right={12}
      top='12px'
      width={'100%'}
    >
      <Flex
        width={'100%'}
        flexDirection={{
          sm: 'column',
          md: 'row'
        }}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Box
          pos={'relative'}
          left={tabRes?.matches ? 24 : 44}
          mb={{ sm: '8px', md: '0px' }}
        >
          <Breadcrumb>
            <BreadcrumbItem color={mainText}>
              <Link
                to={
                  !location.pathname.startsWith('/customer')
                    ? '/vendor/dashboard'
                    : '/customer/products'
                }
                color={secondaryText}
              >
                Interlynk
              </Link>
            </BreadcrumbItem>

            <BreadcrumbItem color={mainText} textTransform={'capitalize'}>
              <Link to={`/${path}/${category}`}>{category}</Link>
            </BreadcrumbItem>

            {params?.name && (
              <BreadcrumbItem
                color={mainText}
                isCurrentPage={sbomId && currentSBOM?.version ? false : true}
              >
                <Link
                  to={`/${path}/products/${params.name}?id=${currentProduct?.groupId}`}
                  onClick={() => {
                    localStorage.removeItem('currentSBOM')
                    if (signedUrlParams) {
                      setActiveCsSbomTab(0)
                      localStorage.setItem('activeCsSbomTab', 0)
                    } else {
                      setActiveSbomTab(0)
                      localStorage.setItem('activeSbomTab', 0)
                    }
                  }}
                >
                  {decodeURI(params.name)}
                </Link>
              </BreadcrumbItem>
            )}

            {sbomId && currentSBOM?.version && (
              <BreadcrumbItem
                color={mainText}
                isCurrentPage={parts ? false : true}
              >
                <BreadcrumbLink
                  href={
                    parts
                      ? `/${path}/products/${currentProduct?.name}?id=${activeEnv}&sbom=${currentSBOM?.id}`
                      : ''
                  }
                  onClick={() => {
                    localStorage.setItem('activeSbomTab', 0)
                    setActiveSbomTab(0)
                  }}
                >
                  {currentSBOM?.version}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {imageName !== null && versionId && brandText === 'Images' && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink
                  href=''
                  color={mainText}
                  onClick={() => window.localStorage.removeItem('subProduct')}
                >
                  {imageName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {((prodID && category === 'vulnerabilities') || vulnId) && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink>{activeVuln || ''}</BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {subProduct && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink color={mainText}>
                  {subProduct?.name || ''}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {subProduct && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink color={mainText}>
                  {subProduct?.version || ''}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Breadcrumb>
        </Box>

        <Box>
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={props.secondary}
            fixed={props.fixed}
          />
        </Box>
      </Flex>
    </Flex>
  )
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  secondary: PropTypes.bool
}

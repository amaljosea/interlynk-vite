// Chakra Imports
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  HStack,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import PropTypes from 'prop-types'
import React, { useContext, useState, useEffect } from 'react'
import AdminNavbarLinks from './AdminNavbarLinks'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import { vulnList } from 'variables/general'
import { GetProductInfo } from 'graphQL/Queries'
import { useLazyQuery, useQuery } from '@apollo/client'

export default function AdminNavbar(props) {
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
  const { brandText } = props
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const product = queryParams.get('id')
  const prodID = queryParams.get('id')
  const parts = queryParams.get('parts')
  const sbomId = queryParams.get('sbom')

  const { setActiveProdTab } = useContext(GlobalContext)

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
  const activeProd = localStorage.getItem('activeProduct')
  const subProduct = localStorage.getItem('subProduct')
  const activeSBOM = localStorage.getItem('activeSBOM')

  const vulnData = vulnList.find((item) => item.id === prodID)

  const urlParts = location.pathname.split('/')
  const category = urlParts[2]
  const productIndex = urlParts.indexOf('products')
  const productName =
    productIndex !== -1 ? urlParts.slice(productIndex + 1).join('/') : ''

  useEffect(() => {
    if (currentProduct && currentProduct.name !== decodeURI(productName)) {
      navigate('/vendor/dashboard')
    }
  }, [])

  const { data } = useQuery(GetProductInfo, {
    variables: {
      id: prodID
    }
  })

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
  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  }
  window.addEventListener('scroll', changeNavbar)

  const path = (name) => {
    if (!location.pathname.startsWith('/customer')) {
      switch (name) {
        case 'Dashboard':
          return '/vendor/dashboard'
        case 'Images':
          return '/vendor/images'
        case 'Products':
          return '/vendor/products'
        case 'Connections':
          return '/vendor/connections'
        case 'Settings':
          return `/vendor/autofix?id=${prodID}`
        case 'Change Log':
          return `/vendor/changelog?id=${prodID}`
        case 'Vulnerabilities':
          return `/vendor/vulnerabilities`
      }
    } else {
      switch (name) {
        case 'Images':
          return '/customer/images'
        case 'Products':
          return '/customer/products'
      }
    }
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
        alignItems={{ xl: 'center' }}
        justifyContent={'space-between'}
      >
        <Box pos={'relative'} left={'40'} mb={{ sm: '8px', md: '0px' }}>
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
              <Link to={`/vendor/${category}`}>{category}</Link>
            </BreadcrumbItem>

            {productName && (
              <BreadcrumbItem
                color={mainText}
                isCurrentPage={currentSBOM?.version ? false : true}
              >
                <Link to={`/vendor/products/${productName}?id=${prodID}`}>
                  {decodeURI(productName)}
                </Link>
              </BreadcrumbItem>
            )}

            {currentSBOM?.version && (
              <BreadcrumbItem color={mainText} isCurrentPage>
                <BreadcrumbLink href=''>{currentSBOM?.version}</BreadcrumbLink>
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

            {vulnData && (
              <BreadcrumbItem color={mainText}>
                <Link to={`/vendor/vulnerabilities?id=${prodID}`}>
                  {vulnData?.vuln.vulnId}
                </Link>
              </BreadcrumbItem>
            )}

            {subProduct && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink color={mainText}>{subProduct}</BreadcrumbLink>
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
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func
}

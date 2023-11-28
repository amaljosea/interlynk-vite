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
import { Link, useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false)
  const { brandText } = props

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const product = queryParams.get('p')
  const prodID = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const parts = queryParams.get('parts')

  const imageName = localStorage.getItem('Image')
  const productName = localStorage.getItem(`product`)
  const activeProd = localStorage.getItem('activeProduct')
  const subProduct = localStorage.getItem('subProduct')

  const { currentProduct, setActiveProdTab } = useContext(GlobalContext)

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

            {(location.pathname.startsWith('/vendor/autofix') ||
              location.pathname.startsWith('/vendor/changelog')) && (
              <BreadcrumbItem color={mainText}>
                <HStack spacing={2}>
                  <Link to={'/vendor/products'} color={secondaryText}>
                    Products
                  </Link>
                  <Text>/</Text>
                  <Link
                    to={
                      currentProduct.sbomId !== null
                        ? `/vendor/products?&p=${prodID}&sbom=${currentProduct.sbomId}`
                        : `/vendor/products`
                    }
                    color={secondaryText}
                    onClick={() =>
                      window.localStorage.setItem('product', activeProd)
                    }
                  >
                    {activeProd}
                  </Link>
                </HStack>
              </BreadcrumbItem>
            )}

            <BreadcrumbItem color={mainText}>
              <Link
                to={`${path(brandText)}`}
                color={secondaryText}
                onClick={() => {
                  localStorage.removeItem('cloudScanner')
                  window.localStorage.removeItem('subProduct')
                }}
              >
                {brandText}
              </Link>
            </BreadcrumbItem>

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

            {productName !== null && product && brandText === 'Products' && (
              <BreadcrumbItem color={mainText}>
                <Link
                  to={
                    currentProduct
                      ? `/vendor/products?&p=${currentProduct.id}&sbom=${currentProduct.sbomId}`
                      : '/vendor/products'
                  }
                  onClick={() => {
                    window.localStorage.removeItem('subProduct')
                    window.localStorage.removeItem('subProductVersion')
                    setActiveProdTab(0)
                  }}
                >
                  {productName}
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

// Chakra Imports
import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { parseJSONSafely, permissionList, truncatedValue } from 'utils'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Grid,
  GridItem,
  useColorModeValue
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetUserPermissions } from 'graphQL/Queries'

import AdminNavbarLinks from './AdminNavbarLinks'

export default function AdminNavbar(props) {
  const navigate = useNavigate()
  const { setActiveSbomTab, setActiveCsSbomTab, setUserPermissions } =
    useGlobalState()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { data } = useQuery(GetUserPermissions, {
    skip: signedUrlParams ? true : false,
    onCompleted: (data) => {
      const permissions = permissionList(
        data?.organization?.currentUser?.role?.permissionsMap || []
      )
      setUserPermissions(permissions)
    }
  })

  const [scrolled, setScrolled] = useState(false)
  const { brandText, tabRes } = props
  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const prodID = queryParams.get('id')
  const parts = queryParams.get('parts')
  const sbomId = queryParams.get('sbom')
  const vulnId = queryParams.get('vulnId')
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const activeVuln = localStorage.getItem('activeVuln')
  const activeEnv = localStorage.getItem('activeEnv')
  const currentProduct = (() => {
    try {
      return parseJSONSafely(localStorage.getItem('product'))
    } catch (error) {
      console.log(error)
      return null
    }
  })()
  const currentSBOM = (() => {
    try {
      return parseJSONSafely(localStorage.getItem('currentSBOM'))
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
      navbarBg = useColorModeValue(
        'linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)',
        'linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)'
      )
      navbarBorder = useColorModeValue('#FFFFFF', 'rgba(255, 255, 255, 0.31)')
      // navbarFilter = useColorModeValue(
      //   'none',
      //   'drop-shadow(0px 7px 23px rgba(0, 0, 0, 0.05))'
      // )
    }
  if (props.secondary) {
    // navbarBackdrop = 'none'
    navbarPosition = 'absolute'
    mainText = 'white'
    secondaryText = 'white'
    secondaryMargin = '22px'
    // paddingX = '30px'
  }

  const newData = { ...subProduct }
  const subProdData = {
    name: subProduct?.name,
    version: subProduct?.version,
    projectId: subProduct?.projectId,
    sbomId: subProduct?.sbomId
  }

  const removeChildOne = () => {
    localStorage.setItem('subProduct', JSON.stringify({ ...subProdData }))
    navigate(
      `/vendor/products/${currentProduct?.name}?id=${subProduct?.projectId}&sbom=${subProduct?.sbomId}&parts=true`
    )
  }
  const removeChildTwo = () => {
    delete newData.childTwo
    localStorage.setItem('subProduct', JSON.stringify(newData))
    navigate(
      `/vendor/products/${currentProduct?.name}?id=${subProduct?.childOne?.projectId}&sbom=${subProduct?.childOne?.sbomId}&parts=true`
    )
  }
  const removeChildThree = () => {
    delete newData.childThree
    localStorage.setItem('subProduct', JSON.stringify(newData))
    navigate(
      `/vendor/products/${currentProduct?.name}?id=${subProduct?.childTwo?.projectId}&sbom=${subProduct?.childTwo?.sbomId}&parts=true`
    )
  }
  const removeChildFour = () => {
    delete newData.childFour
    localStorage.setItem('subProduct', JSON.stringify(newData))
    navigate(
      `/vendor/products/${currentProduct?.name}?id=${subProduct?.childThree?.projectId}&sbom=${subProduct?.childThree?.sbomId}&parts=true`
    )
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
      <Grid
        width={'100%'}
        templateColumns='repeat(12, 1fr)'
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <GridItem pos={'relative'} left={tabRes?.matches ? 24 : 44} colSpan={8}>
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
                  {truncatedValue(decodeURI(params.name))}
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

            {((prodID && category === 'vulnerabilities') || vulnId) && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink>{activeVuln || ''}</BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {subProduct && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink
                  onClick={
                    subProduct?.sbomId === sbomId ? null : removeChildOne
                  }
                >
                  {truncatedValue(subProduct?.name)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {subProduct && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink
                  onClick={
                    subProduct?.sbomId === sbomId ? null : removeChildOne
                  }
                >
                  {truncatedValue(subProduct?.version)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {/* -------------- CHILD ONE ------------ */}

            {subProduct?.childOne && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink
                  onClick={
                    subProduct?.childOne?.sbomId === sbomId
                      ? null
                      : removeChildTwo
                  }
                >
                  {truncatedValue(subProduct?.childOne?.name)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {subProduct?.childOne && parts && (
              <BreadcrumbItem
                color={mainText}
                onClick={
                  subProduct?.childOne?.sbomId === sbomId
                    ? null
                    : removeChildTwo
                }
              >
                <BreadcrumbLink
                  onClick={
                    subProduct?.childOne?.sbomId === sbomId
                      ? null
                      : removeChildTwo
                  }
                >
                  {truncatedValue(subProduct?.childOne?.version)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {/* -------------- CHILD TWO ------------ */}

            {subProduct?.childTwo && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink
                  onClick={
                    subProduct?.childTwo?.sbomId === sbomId
                      ? null
                      : removeChildThree
                  }
                >
                  {truncatedValue(subProduct?.childTwo?.name)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {subProduct?.childTwo && parts && (
              <BreadcrumbItem
                color={mainText}
                onClick={
                  subProduct?.childTwo?.sbomId === sbomId
                    ? null
                    : removeChildThree
                }
              >
                <BreadcrumbLink
                  onClick={
                    subProduct?.childTwo?.sbomId === sbomId
                      ? null
                      : removeChildThree
                  }
                >
                  {truncatedValue(subProduct?.childTwo?.version)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {/* -------------- CHILD THREE ------------ */}

            {subProduct?.childThree && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink
                  onClick={
                    subProduct?.childThree?.sbomId === sbomId
                      ? null
                      : removeChildFour
                  }
                >
                  {truncatedValue(subProduct?.childThree?.name)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {subProduct?.childThree && parts && (
              <BreadcrumbItem
                color={mainText}
                onClick={
                  subProduct?.childThree?.sbomId === sbomId
                    ? null
                    : removeChildFour
                }
              >
                <BreadcrumbLink
                  onClick={
                    subProduct?.childThree?.sbomId === sbomId
                      ? null
                      : removeChildFour
                  }
                >
                  {truncatedValue(subProduct?.childThree?.version)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {/* -------------- CHILD FOUR ------------ */}

            {subProduct?.childFour && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink color={mainText}>
                  {truncatedValue(subProduct?.childFour?.name)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {subProduct?.childFour && parts && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink color={mainText}>
                  {truncatedValue(subProduct?.childFour?.version)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Breadcrumb>
        </GridItem>
        <GridItem colSpan={4} ml={'auto'}>
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={props.secondary}
            fixed={props.fixed}
          />
        </GridItem>
      </Grid>
    </Flex>
  )
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  secondary: PropTypes.bool
}

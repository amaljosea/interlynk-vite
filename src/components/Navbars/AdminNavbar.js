// Chakra Imports
import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { parseJSONSafely, permissionList } from 'utils'
import { getProductVersionDetailPageUrl } from 'utils/url'
import { getProductDetailPageUrl } from 'utils/url'

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
import { usePartsContext } from 'hooks/usePartsContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useSbom } from 'hooks/useSbom'

import { GetUserPermissions } from 'graphQL/Queries'

import AdminNavbarLinks from './AdminNavbarLinks'

export default function AdminNavbar(props) {
  const partsContext = usePartsContext()
  const navigate = useNavigate()
  const { setActiveSbomTab, setActiveCsSbomTab, setUserPermissions } =
    useGlobalState()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  useQuery(GetUserPermissions, {
    skip: signedUrlParams ? true : false,
    onCompleted: (data) => {
      const permissions = permissionList(
        data?.organization?.currentUser?.role?.permissionsMap || []
      )
      setUserPermissions(permissions)
    }
  })

  const [scrolled] = useState(false)
  const { tabRes } = props
  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const prodID = params.productid
  const parts = queryParams.get('parts')
  const sbomId = params.sbomid
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const activeVuln = localStorage.getItem('activeVuln')

  const urlParts = location.pathname.split('/')
  const category = urlParts[2]

  const sbomHookData = useSbom({
    projectId: params?.productid,
    sbomId: params?.sbomid
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
      // navbarBg = useColorModeValue(
      //   'linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)',
      //   'linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)'
      // )
      // navbarBorder = useColorModeValue('#FFFFFF', 'rgba(255, 255, 255, 0.31)')
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

  const { name: projectGroupName, projects } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

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

            {partsContext.parts.map((part, index) => {
              return (
                <BreadcrumbItem key={part.url} color={mainText}>
                  <BreadcrumbLink
                    onClick={() => {
                      partsContext.goTo(index)
                      navigate(part.url)
                    }}
                  >
                    {part.projectGroupName} ({part.versionName})
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )
            })}
            {projectGroupName && (
              <BreadcrumbItem
                color={mainText}
                isCurrentPage={sbomId && sbomHookData?.version ? false : true}
              >
                <Link
                  to={getProductDetailPageUrl({
                    productgroupid: params.productgroupid,
                    productid: params.productid
                  })}
                  onClick={() => {
                    localStorage.removeItem('currentSBOM')
                  }}
                >
                  {projectGroupName}
                </Link>
              </BreadcrumbItem>
            )}
            {sbomId && sbomHookData.versionName && (
              <BreadcrumbItem
                color={mainText}
                isCurrentPage={parts ? false : true}
              >
                <BreadcrumbLink
                  href={
                    parts
                      ? getProductVersionDetailPageUrl({
                          productgroupid: params.productgroupid,
                          productid: params.productid,
                          sbomid: params.sbomid
                        })
                      : ''
                  }
                  onClick={() => setActiveSbomTab(0)}
                >
                  {sbomHookData.versionName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            {((prodID && category === 'vulnerabilities') || vulnId) && (
              <BreadcrumbItem color={mainText}>
                <BreadcrumbLink>{activeVuln || ''}</BreadcrumbLink>
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
            projects={projects}
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

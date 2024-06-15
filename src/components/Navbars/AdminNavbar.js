import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { permissionList } from 'utils'

import { ChevronRightIcon } from '@chakra-ui/icons'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Grid,
  GridItem,
  useColorModeValue
} from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'

import { GetUserPermissions } from 'graphQL/Queries'

import AdminNavbarLinks from './AdminNavbarLinks'

export default function AdminNavbar(props) {
  const partsContext = usePartsContext()
  const navigate = useNavigate()
  const { setUserPermissions } = useGlobalState()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()

  useQuery(GetUserPermissions, {
    skip: signedUrlParams !== '' ? true : false,
    onCompleted: (data) => {
      if (data) {
        const result =
          data?.organization?.currentUser?.role?.permissionsMap || []
        const permissions = permissionList(result)
        setUserPermissions(permissions)
      }
    }
  })

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

  const { sbomHookData } = useGlobalQueryContext()

  // Here are all the props that may change depending on navbar's type or state.(secondary, variant, scrolled)
  let mainText = useColorModeValue('gray.700', 'gray.200')
  let secondaryText = useColorModeValue('gray.400', 'gray.200')

  const {
    name: projectGroupName,
    projects,
    loading
  } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  const filterText = (item) => {
    return item?.length > 10 ? `${item?.substring(0, 10)}...` : item
  }

  return (
    <Grid
      px={10}
      py={4}
      width={'100%'}
      templateColumns='repeat(12, 1fr)'
      alignItems={'center'}
      justifyContent={'space-between'}
    >
      <GridItem colSpan={8}>
        <Breadcrumb
          separator={<ChevronRightIcon color='gray.500' />}
          fontSize={'sm'}
        >
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
          {!loading &&
            partsContext.isParts &&
            [
              ...partsContext.parts,
              {
                projectGroupName: projectGroupName,
                versionName: sbomHookData.versionName,
                url: null
              }
            ].map((part, index) => {
              return (
                <BreadcrumbItem
                  isCurrentPage={!!part.url}
                  key={part.url}
                  color={mainText}
                >
                  <BreadcrumbLink
                    onClick={() => {
                      if (part.url) {
                        partsContext.goTo(index)
                        navigate(part.url)
                      }
                    }}
                  >
                    {filterText(part.projectGroupName)} (
                    {filterText(part.versionName)})
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )
            })}
          {!partsContext.isParts && projectGroupName && (
            <BreadcrumbItem
              color={mainText}
              isCurrentPage={sbomId && sbomHookData?.version ? false : true}
            >
              <Link to={generateProductDetailPageUrlFromCurrentUrl()}>
                {filterText(projectGroupName)}
              </Link>
            </BreadcrumbItem>
          )}
          {!partsContext.isParts && sbomId && sbomHookData.versionName && (
            <BreadcrumbItem
              color={mainText}
              isCurrentPage={parts ? false : true}
            >
              <BreadcrumbLink
                href={
                  parts
                    ? generateProductVersionDetailPageUrlFromCurrentUrl()
                    : ''
                }
              >
                {filterText(sbomHookData.versionName)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {!partsContext.isParts &&
            ((prodID && category === 'vulnerabilities') || vulnId) && (
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
  )
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  secondary: PropTypes.bool
}

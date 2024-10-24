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
  GridItem
} from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetUserPermissions } from 'graphQL/Queries'

import AdminNavbarLinks from './AdminNavbarLinks'
import ProjectGroupBreadcrumb from './ProjectGroupBreadcrumb'
import VersionBreadcrumb from './VersionBreadcrumb'

export default function AdminNavbar(props) {
  const navigate = useNavigate()
  const partsContext = usePartsContext()
  const { setUserPermissions } = useGlobalState()
  const { sbomHookData, orgView } = useGlobalQueryContext()

  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const prodID = params.productid
  const sbomId = params.sbomid
  const parts = queryParams.get('parts')
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const { style } = useSelect('breadcrumb')

  useQuery(GetUserPermissions, {
    skip: path === 'customer' || !orgView,
    onCompleted: (data) => {
      if (data) {
        const result =
          data?.organization?.currentUser?.role?.permissionsMap || []
        const permissions = permissionList(result)
        setUserPermissions(permissions)
      }
    }
  })

  const activeVuln = localStorage.getItem('activeVuln')

  const urlParts = location.pathname.split('/')
  const category = urlParts[2]
  const { inverseSecondaryBgColor, sameSecondaryText, mainContrastBgColor } =
    useThemeColor([
      'inverseSecondaryBgColor',
      'sameSecondaryText',
      'mainContrastBgColor'
    ])

  // Here are all the props that may change depending on navbar's type or state.(secondary, variant, scrolled)
  let mainText = inverseSecondaryBgColor

  const {
    id,
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
      bg={mainContrastBgColor}
      px={6}
      py={4}
      width={'100%'}
      height={70}
      templateColumns='repeat(12, 1fr)'
      alignItems={'center'}
      justifyContent={'space-between'}
    >
      <GridItem colSpan={7}>
        <Breadcrumb
          separator={<ChevronRightIcon color={sameSecondaryText} />}
          fontSize={'sm'}
        >
          <BreadcrumbItem color={mainText}>
            <Link
              to={
                !location.pathname.startsWith('/customer')
                  ? '/vendor/dashboard'
                  : '/customer/products'
              }
              color={'secondaryText'}
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
          {projectGroupName && prodID && !partsContext.isParts && (
            <BreadcrumbItem
              color={mainText}
              isCurrentPage={sbomId && sbomHookData?.version ? false : true}
            >
              <ProjectGroupBreadcrumb
                projectGroupName={projectGroupName}
                selectStyles={style}
                defaultFirstOption={{
                  id,
                  name: projectGroupName
                }}
              />
            </BreadcrumbItem>
          )}
          {!partsContext.isParts && sbomId && sbomHookData.versionName && (
            <BreadcrumbItem color={mainText} isCurrentPage={!parts}>
              <VersionBreadcrumb selectStyles={style} />
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
      <GridItem colSpan={5} ml={'auto'}>
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

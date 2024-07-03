import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { permissionList } from 'utils'

import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Grid,
  GridItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'

import {
  GetProjectGroupDetails,
  GetProjectVersionAndId,
  GetUserPermissions
} from 'graphQL/Queries'

import AdminNavbarLinks from './AdminNavbarLinks'

export default function AdminNavbar(props) {
  const partsContext = usePartsContext()
  const navigate = useNavigate()
  const { setUserPermissions, userPermissions } = useGlobalState()
  const { sbomHookData, orgView } = useGlobalQueryContext()
  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()

  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const prodID = params.productid
  const parts = queryParams.get('parts')
  const sbomId = params.sbomid
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const environment = localStorage.getItem('environment')

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

  // Here are all the props that may change depending on navbar's type or state.(secondary, variant, scrolled)
  let mainText = useColorModeValue('gray.700', 'gray.200')
  let secondaryText = useColorModeValue('gray.400', 'gray.200')

  const viewProds = userPermissions?.find(
    (item) => item.key === 'view_product_group'
  )

  const {
    name: projectGroupName,
    projects,
    loading
  } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  const { data: versionData, loading: loadingVersions } = useQuery(
    GetProjectVersionAndId,
    {
      variables: { id: prodID },
      skip: !prodID || !orgView
    }
  )

  const { data: productsData } = useQuery(GetProjectGroupDetails, {
    skip: !orgView || viewProds?.value === false,
    variables: {
      field: 'PROJECT_GROUPS_UPDATED_AT',
      direction: 'DESC',
      enabled: true
    }
  })

  const products = productsData?.organization?.projectGroups?.nodes

  const filterText = (item) => {
    return item?.length > 10 ? `${item?.substring(0, 10)}...` : item
  }

  const handleVersionClick = (version) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      sbomid: version.id,
      paramsObj: {
        tab: 'general'
      }
    })
    navigate(link)
  }

  const handleProductClick = (product) => {
    const env = products?.find((item) => item.name === environment)
    const link = generateProductDetailPageUrlFromCurrentUrl({
      productgroupid: product?.id,
      productid: env?.id || product?.defaultProject?.id
    })
    navigate(link)
  }

  const renderVersionBreadcrumb = () => {
    if (
      loadingVersions ||
      partsContext.isParts ||
      !sbomId ||
      !sbomHookData.versionName ||
      !versionData?.project?.sbomVersions?.nodes
    ) {
      return null
    }

    const versions = versionData.project.sbomVersions.nodes

    if (versions.length > 1) {
      return (
        <BreadcrumbItem color={mainText} isCurrentPage={!parts}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              fontSize={14}
              fontWeight={400}
            >
              {filterText(sbomHookData.versionName)}
            </MenuButton>
            <MenuList>
              {versions.map((version) => (
                <MenuItem
                  key={version.id}
                  onClick={() => handleVersionClick(version)}
                >
                  <Text color={'blue.500'} fontSize={14}>
                    {version.projectVersion}
                  </Text>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </BreadcrumbItem>
      )
    } else if (versions.length === 1) {
      return (
        <BreadcrumbItem color={mainText} isCurrentPage={!parts}>
          <BreadcrumbLink
            href={
              parts ? generateProductVersionDetailPageUrlFromCurrentUrl() : ''
            }
          >
            {filterText(sbomHookData.versionName)}
          </BreadcrumbLink>
        </BreadcrumbItem>
      )
    }

    return null
  }

  const renderProjectGroupBreadcrumb = () => {
    if (!projectGroupName || !products || loadingVersions || !prodID) {
      return null
    }

    if (products.length > 1) {
      return (
        <BreadcrumbItem
          color={mainText}
          isCurrentPage={!sbomId && !partsContext.isParts}
        >
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              fontSize={14}
              fontWeight={400}
            >
              {filterText(projectGroupName)}
            </MenuButton>
            <MenuList>
              {products.map((product) => (
                <MenuItem
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                >
                  <Text color={'blue.500'} fontSize={14}>
                    {product.name}
                  </Text>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </BreadcrumbItem>
      )
    } else if (products.length === 1) {
      return (
        <BreadcrumbItem
          color={mainText}
          isCurrentPage={sbomId && sbomHookData?.version ? false : true}
        >
          <Link to={generateProductDetailPageUrlFromCurrentUrl()}>
            {filterText(projectGroupName)}
          </Link>
        </BreadcrumbItem>
      )
    }

    return null
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
      <GridItem colSpan={7}>
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
          {renderProjectGroupBreadcrumb()}
          {renderVersionBreadcrumb()}
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

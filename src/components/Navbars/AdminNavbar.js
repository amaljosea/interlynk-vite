import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
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

import { useDebounce } from 'hooks/useDebounce'
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
  const { setUserPermissions } = useGlobalState()
  const { sbomHookData, orgView } = useGlobalQueryContext()
  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()
  const [searchInput, setSearchInput] = useState('')
  const [versionSearchInput, setVersionSearchInput] = useState('')
  const [versions, setVersions] = useState([])
  const [totalCount, setTotalCount] = useState(null)

  const debouncedSearchInput = useDebounce(searchInput, 300)
  const debouncedVersionSearchInput = useDebounce(versionSearchInput, 300)

  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const prodID = params.productid
  const parts = queryParams.get('parts')
  const sbomId = params.sbomid
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const environment = localStorage.getItem('environment')

  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')
  const optionColor = useColorModeValue('#718096', '#A0AEC0')
  const textHoverColor = useColorModeValue('#EDF2F7', '#4A5568')
  const borderColor = useColorModeValue('#CBD5E0', '#4A5568')

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      color: textColor,
      border: 'none',
      height: '30px',
      padding: 0,
      width: 'fit-content',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      fontSize: '14px',
      '&:hover': {
        borderColor: borderColor,
        backgroundColor: 'transparent'
      },
      boxShadow: state.isFocused ? 'none' : provided.boxShadow,
      borderColor: state.isFocused ? 'transparent' : provided.borderColor
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: bgColor,
      width: '150px'
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: bgColor,
      '&:hover': {
        backgroundColor: 'transparent'
      }
    }),
    input: (provided) => ({
      ...provided,
      color: textColor,
      backgroundColor: 'transparent'
    }),
    option: (provided) => ({
      ...provided,
      color: optionColor,
      backgroundColor: bgColor,
      '&:hover': {
        backgroundColor: textHoverColor
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: textColor,
      '&:hover': {
        color: textColor
      }
    })
  }

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

  const {
    name: projectGroupName,
    projects,
    loading
  } = useProjectGroup({
    projectGroupId: params.productgroupid
  })

  const { data: versionData, refetch: refetchVersions } = useQuery(
    GetProjectVersionAndId,
    {
      variables: {
        id: prodID,
        search: debouncedVersionSearchInput,
        first: 10,
        field: 'SBOMS_CREATED_AT',
        direction: 'DESC'
      },
      skip: !prodID || !orgView
    }
  )

  const { data: productsData, refetch } = useQuery(GetProjectGroupDetails, {
    skip: !orgView || path === 'customer',
    variables: {
      field: 'PROJECT_GROUPS_UPDATED_AT',
      direction: 'DESC',
      enabled: true,
      first: 10,
      search: ''
    }
  })

  const products = productsData?.organization?.projectGroups?.nodes
  useEffect(() => {
    if (versionData) {
      setVersions(versionData.project.sbomVersions.nodes)
      setTotalCount(versionData.project.allSbomVersions.totalCount)
    }
  }, [versionData])

  useEffect(() => {
    if (
      path === 'vendor' &&
      (debouncedSearchInput !== '' || searchInput === '')
    ) {
      refetch({
        search: debouncedSearchInput,
        enabled: true,
        first: 10,
        field: 'PROJECT_GROUPS_UPDATED_AT',
        direction: 'DESC'
      })
    }
  }, [debouncedSearchInput, searchInput, refetch, path])

  useEffect(() => {
    if (debouncedVersionSearchInput !== '') {
      refetchVersions({
        variables: {
          id: prodID,
          search: debouncedVersionSearchInput
        }
      })
    }
  }, [debouncedVersionSearchInput, refetchVersions, prodID])

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

  const handleProductClick = useCallback(
    (product) => {
      const envProject = product?.projects?.find(
        (proj) => proj.name === environment
      )
      const link = generateProductDetailPageUrlFromCurrentUrl({
        productgroupid: product?.id,
        productid: envProject?.id || product?.defaultProject?.id
      })
      navigate(link)
    },
    [generateProductDetailPageUrlFromCurrentUrl, navigate, environment]
  )

  const renderVersionBreadcrumb = () => {
    if (partsContext.isParts || !sbomId || !sbomHookData.versionName) {
      return null
    }
    if (totalCount > 1) {
      return (
        <BreadcrumbItem color={mainText} isCurrentPage={!parts}>
          <Select
            styles={selectStyles}
            inputValue={versionSearchInput}
            onInputChange={setVersionSearchInput}
            options={versions}
            getOptionLabel={(version) => version.projectVersion}
            getOptionValue={(version) => version.id}
            onChange={(version) => handleVersionClick(version)}
            defaultValue={
              versions.find(
                (version) => version.projectVersion === sbomHookData.versionName
              ) || null
            }
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            hideSelectedOptions
          />
        </BreadcrumbItem>
      )
    } else if (totalCount === 1) {
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
    const totalCount = productsData?.organization?.allProjectGroups?.totalCount

    if (!projectGroupName || !products || !prodID || partsContext.isParts) {
      return null
    }

    if (totalCount > 1) {
      return (
        <BreadcrumbItem
          color={mainText}
          isCurrentPage={!sbomId && !partsContext.isParts}
        >
          <Select
            options={products}
            styles={selectStyles}
            inputValue={searchInput}
            onInputChange={setSearchInput}
            getOptionLabel={(product) => product.name}
            getOptionValue={(product) => product.id}
            onChange={(product) => handleProductClick(product)}
            defaultValue={
              products.find((product) => product.name === projectGroupName) ||
              null
            }
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            hideSelectedOptions
          />
        </BreadcrumbItem>
      )
    } else if (totalCount === 1) {
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

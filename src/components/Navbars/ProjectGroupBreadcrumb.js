import { useQuery } from '@apollo/client'
import { useCallback, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Select, { components } from 'react-select'

import { Divider, Spinner, useColorModeValue } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetProjectGroupDetails, GetProjectName } from 'graphQL/Queries'

import { customFilter } from './customFilter'

const ProjectGroupBreadcrumb = ({ projectGroupName, selectStyles }) => {
  const navigate = useNavigate()
  const params = useParams()

  const productGroupId = params.productgroupid
  const location = useLocation()

  const { orgView } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const environment = localStorage.getItem('environment')

  const loaderColor = useColorModeValue('#e2e8f0', '#4A5568')

  const viewProds = useHasPermission({
    parentKey: 'view_product_group'
  })

  const { data: productsData, loading } = useQuery(GetProjectGroupDetails, {
    skip: !orgView || viewProds === false,
    variables: {
      field: 'PROJECT_GROUPS_NAME',
      direction: 'ASC'
    }
  })

  const { data: projectNameData } = useQuery(GetProjectName, {
    skip: !productGroupId || path === 'customer',
    variables: {
      id: productGroupId
    }
  })

  const products = productsData?.organization?.projectGroups?.nodes
  const totalCount = productsData?.organization?.allProjectGroups?.totalCount
  const selectedProduct = products?.find(
    (product) => product.id === productGroupId
  )

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

  const filterText = (item) => {
    return item?.length > 10 ? `${item?.substring(0, 10)}...` : item
  }

  const options = selectedProduct
    ? [selectedProduct, ...products.filter((p) => p.id !== selectedProduct.id)]
    : products

  const selectRef = useRef()

  const CustomMenuList = (props) => {
    return (
      <components.MenuList {...props}>
        {props.children.map((child, index) => (
          <>
            {index === 1 && <Divider />}
            {child}
          </>
        ))}
      </components.MenuList>
    )
  }

  if (path === 'customer' && projectGroupName) {
    return (
      <Link to={generateProductDetailPageUrlFromCurrentUrl()}>
        {filterText(projectGroupName)}
      </Link>
    )
  } else if (products && totalCount > 1) {
    return (
      <div
        onMouseOver={() => {
          if (selectRef.current) {
            selectRef.current.focus()
          }
        }}
      >
        <Select
          ref={selectRef}
          options={options}
          styles={selectStyles}
          isSearchable
          getOptionLabel={(product) => product.name}
          getOptionValue={(product) => product.id}
          onChange={(product) => handleProductClick(product)}
          defaultValue={projectNameData?.projectGroup}
          components={{
            IndicatorSeparator: () => null,
            MenuList: CustomMenuList
          }}
          filterOption={customFilter}
          isLoading={loading}
          openMenuOnFocus
          blurInputOnSelect
        />
      </div>
    )
  } else if (products && totalCount === 1) {
    return (
      <Link to={generateProductDetailPageUrlFromCurrentUrl()}>
        {filterText(projectGroupName)}
      </Link>
    )
  }

  return <Spinner size='xs' color={loaderColor} />
}

export default ProjectGroupBreadcrumb

import { useQuery } from '@apollo/client'
import React, { useCallback, useEffect, useRef } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Select, { components } from 'react-select'

import { Divider, Spinner, useColorModeValue } from '@chakra-ui/react'

import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetProjectGroupDetails } from 'graphQL/Queries'

import { customFilter } from './customFilter'

const ProjectGroupBreadcrumb = ({ projectGroupName, selectStyles }) => {
  const navigate = useNavigate()
  const params = useParams()
  const [value, setValue] = useState(null)

  const productGroupId = params.productgroupid
  const location = useLocation()
  const { envName } = useGlobalState()

  const { orgView } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const environment = envName

  const loaderColor = useColorModeValue('#e2e8f0', '#4A5568')

  const viewProds = useHasPermission({
    parentKey: 'view_product_group'
  })

  const { data: productsData, loading } = useQuery(GetProjectGroupDetails, {
    skip: !orgView || viewProds === false,
    variables: {
      field: 'PROJECT_GROUPS_NAME',
      direction: 'ASC',
      first: 999999999
    }
  })

  useEffect(() => {
    const product = productsData?.organization?.projectGroups?.nodes?.find(
      (i) => i.id === productGroupId
    )
    setValue(product)
  }, [productGroupId, setValue, productsData])

  const products = productsData?.organization?.projectGroups?.nodes
  const totalCount = productsData?.organization?.allProjectGroups?.totalCount
  const selectedProduct = products?.find(
    (product) => product.id === productGroupId
  )

  const handleProductClick = useCallback(
    (product) => {
      setValue(product)
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
    const childrenArray = React.Children.toArray(props.children)

    return (
      <components.MenuList {...props}>
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            {index === 1 && <Divider />}
            {child}
          </React.Fragment>
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
        onMouseEnter={() => {
          if (selectRef.current) {
            // selectRef.current.focus()
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
          value={value}
          components={{
            MenuList: CustomMenuList,
            IndicatorSeparator: () => null,
            DropdownIndicator: CustomDropdownIndicator
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

import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'

import { useDebounce } from 'hooks/useDebounce'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetProjectGroupDetails } from 'graphQL/Queries'

const ProjectGroupBreadcrumb = ({ projectGroupName, selectStyles }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const { orgView } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const [searchInput, setSearchInput] = useState('')
  const [products, setProducts] = useState([])
  const [totalCount, setTotalCount] = useState(null)

  const debouncedSearchInput = useDebounce(searchInput, 300)
  const environment = localStorage.getItem('environment')

  const viewProds = useHasPermission({
    parentKey: 'view_product_group'
  })

  const { data: productsData, loading } = useQuery(GetProjectGroupDetails, {
    skip: !orgView || viewProds === false,
    variables: {
      field: 'PROJECT_GROUPS_UPDATED_AT',
      direction: 'DESC',
      enabled: true,
      first: 10,
      search: debouncedSearchInput
    }
  })

  useEffect(() => {
    if (productsData) {
      setProducts(productsData?.organization?.projectGroups?.nodes)
      setTotalCount(productsData?.organization?.allProjectGroups?.totalCount)
    }
  }, [productsData])

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

  if (path === 'customer' && projectGroupName) {
    return (
      <Link to={generateProductDetailPageUrlFromCurrentUrl()}>
        {filterText(projectGroupName)}
      </Link>
    )
  } else if (products && totalCount > 1) {
    return (
      <Select
        options={products}
        styles={selectStyles}
        inputValue={searchInput}
        onInputChange={setSearchInput}
        getOptionLabel={(product) => product.name}
        getOptionValue={(product) => product.id}
        onChange={(product) => handleProductClick(product)}
        defaultValue={products.find(
          (product) => product.name === projectGroupName
        )}
        components={{
          IndicatorSeparator: () => null
        }}
        hideSelectedOptions
        isLoading={loading}
      />
    )
  } else if (products && totalCount === 1) {
    return (
      <Link to={generateProductDetailPageUrlFromCurrentUrl()}>
        {filterText(projectGroupName)}
      </Link>
    )
  }

  return null
}

export default ProjectGroupBreadcrumb

import React, { useCallback } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import { truncatedValue } from 'utils'

import { Spinner } from '@chakra-ui/react'

import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useLazyDropDown } from 'hooks/useLazyDropDown'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectGroupLazyDropdownQuery } from 'graphQL/Queries'

const ProjectGroupBreadcrumb = ({ projectGroupName, defaultFirstOption }) => {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()
  const { envName } = useGlobalState()

  const { orgView } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const environment = envName

  const { primaryTextColor, secondaryTextColor, grayBorderColor } =
    useThemeColor(['primaryTextColor', 'secondaryTextColor', 'grayBorderColor'])

  const { style } = useSelect('breadcrumb', 'product')

  const viewProds = useHasPermission({
    parentKey: 'view_product_group'
  })

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

  const { lazyDropDownProps } = useLazyDropDown(
    GetProjectGroupLazyDropdownQuery,
    {
      skip: !orgView || viewProds === false,
      selector: 'organization.projectGroups',
      variables: {
        field: 'PROJECT_GROUPS_NAME',
        direction: 'ASC',
        first: 5,
        enabled: true
      },
      selectorForActualCount: 'organization.allProjectGroups',
      selectedItem: projectGroupName,
      styles: style,
      onChange: handleProductClick,
      components: {
        IndicatorSeparator: () => null,
        DropdownIndicator: CustomDropdownIndicator
      },
      defaultFirstOption,
      isBreadcrumb: true
    }
  )

  const { nodes, totalCountActual } = lazyDropDownProps

  if (path === 'customer' && projectGroupName) {
    return (
      <Link
        to={generateProductDetailPageUrlFromCurrentUrl()}
        style={{
          color: params?.sbomid ? secondaryTextColor : primaryTextColor
        }}
      >
        {truncatedValue(projectGroupName)}
      </Link>
    )
  } else if (nodes && totalCountActual > 1) {
    return <AsyncSelect {...lazyDropDownProps} />
  } else if (nodes && totalCountActual === 1) {
    return (
      <Link to={generateProductDetailPageUrlFromCurrentUrl()}>
        {truncatedValue(projectGroupName)}
      </Link>
    )
  }

  return <Spinner size='xs' color={grayBorderColor} />
}

export default ProjectGroupBreadcrumb

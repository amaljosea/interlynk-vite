import { useQuery } from '@apollo/client'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import { truncatedValue } from 'utils'

import { Spinner } from '@chakra-ui/react'

import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useLazyDropDown } from 'hooks/useLazyDropDown'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  GetProjectVersionLazyDropdownQuery,
  GetVersionName
} from 'graphQL/Queries'
import { GetArchivedVersions } from 'graphQL/Queries'

const VersionBreadcrumb = () => {
  const navigate = useNavigate()
  const { isCustomerView } = useRouteFlags()
  const { sbomHookData, orgView } = useGlobalQueryContext()
  const params = useParams()
  const location = useLocation()

  const { style } = useSelect('breadcrumb', 'version')

  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { grayBorderColor } = useThemeColor(['grayBorderColor'])
  const prodID = params.productid
  const sbomId = params.sbomid

  const { data: archiveData } = useQuery(GetArchivedVersions, {
    skip: isCustomerView,
    variables: { id: prodID }
  })
  const { sbomArchived } = archiveData?.project || ''
  const archivedVersion = sbomArchived?.find((item) => item?.id === sbomId)

  const { data: versionName, loading } = useQuery(GetVersionName, {
    skip: isCustomerView,
    variables: {
      projectId: prodID,
      sbomId: sbomId
    }
  })

  const selectedVersionName = versionName?.sbom?.projectVersion

  const handleVersionClick = (version) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      sbomid: version.id,
      paramsObj: {
        tab: 'general'
      }
    })
    navigate(link)
  }

  const { lazyDropDownProps } = useLazyDropDown(
    GetProjectVersionLazyDropdownQuery,
    {
      skip: !prodID || !orgView,
      selector: 'project.sbomVersions',
      variables: {
        id: prodID,
        field: 'SBOMS_CREATED_AT',
        direction: 'DESC',
        first: 5
      },
      selectorForActualCount: 'project.allSbomVersions',
      selectedItem: truncatedValue(selectedVersionName),
      styles: style,
      onChange: handleVersionClick,
      components: {
        IndicatorSeparator: () => null,
        DropdownIndicator: CustomDropdownIndicator
      },
      optionLabel: 'projectVersion',
      isBreadcrumb: true
    }
  )

  const { nodes, totalCountActual } = lazyDropDownProps

  if (archivedVersion?.id)
    return <Link to={'#'}>{archivedVersion?.projectVersion}</Link>

  if (path === 'customer' && sbomHookData.versionName) {
    return (
      <Link to={generateProductVersionDetailPageUrlFromCurrentUrl()}>
        {truncatedValue(sbomHookData.versionName)}
      </Link>
    )
  }
  if (nodes && totalCountActual > 1 && !loading) {
    return <AsyncSelect {...lazyDropDownProps} />
  } else if (nodes && totalCountActual === 1) {
    return (
      <Link to={generateProductVersionDetailPageUrlFromCurrentUrl()}>
        {truncatedValue(sbomHookData.versionName)}
      </Link>
    )
  }

  return <Spinner size='xs' color={grayBorderColor} />
}

export default VersionBreadcrumb

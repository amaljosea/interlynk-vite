import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'

import { useDebounce } from 'hooks/useDebounce'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetProjectVersionAndId } from 'graphQL/Queries'

const VersionBreadcrumb = ({ selectStyles }) => {
  const navigate = useNavigate()
  const { sbomHookData, orgView } = useGlobalQueryContext()
  const params = useParams()
  const location = useLocation()

  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const [versionSearchInput, setVersionSearchInput] = useState('')
  const [versions, setVersions] = useState([])
  const [totalCount, setTotalCount] = useState(null)

  const debouncedVersionSearchInput = useDebounce(versionSearchInput, 300)

  const prodID = params.productid

  const { data: versionData, loading } = useQuery(GetProjectVersionAndId, {
    variables: {
      id: prodID,
      search: debouncedVersionSearchInput,
      first: 10,
      field: 'SBOMS_CREATED_AT',
      direction: 'DESC'
    },
    skip: !prodID || !orgView
  })

  useEffect(() => {
    if (versionData) {
      setVersions(versionData.project.sbomVersions.nodes)
      setTotalCount(versionData.project.allSbomVersions.totalCount)
    }
  }, [versionData])

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
  if (path === 'customer' && sbomHookData.versionName) {
    return (
      <Link to={generateProductVersionDetailPageUrlFromCurrentUrl()}>
        {filterText(sbomHookData.versionName)}
      </Link>
    )
  }
  if (versions && totalCount > 1) {
    return (
      <Select
        styles={selectStyles}
        inputValue={versionSearchInput}
        onInputChange={setVersionSearchInput}
        options={versions}
        getOptionLabel={(version) => version.projectVersion}
        getOptionValue={(version) => version.id}
        onChange={(version) => handleVersionClick(version)}
        defaultValue={versions.find(
          (version) => version.projectVersion === sbomHookData.versionName
        )}
        components={{
          IndicatorSeparator: () => null
        }}
        hideSelectedOptions
        isLoading={loading}
      />
    )
  } else if (versions && totalCount === 1) {
    return (
      <Link to={generateProductVersionDetailPageUrlFromCurrentUrl()}>
        {filterText(sbomHookData.versionName)}
      </Link>
    )
  }

  return null
}

export default VersionBreadcrumb

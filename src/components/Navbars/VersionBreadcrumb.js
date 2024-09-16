import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'

import { Spinner, Text, useColorModeValue } from '@chakra-ui/react'

import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { GetProjectVersionAndId } from 'graphQL/Queries'
import { GetArchivedVersions } from 'graphQL/Queries'

import { customFilter } from './customFilter'

const VersionBreadcrumb = ({ selectStyles }) => {
  const navigate = useNavigate()
  const { sbomHookData, orgView } = useGlobalQueryContext()
  const params = useParams()
  const location = useLocation()
  const [value, setValue] = useState(null)

  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const loaderColor = useColorModeValue('#e2e8f0', '#4A5568')

  const prodID = params.productid
  const sbomId = params.sbomid

  const { data: archiveData } = useQuery(GetArchivedVersions, {
    variables: { id: prodID }
  })
  const { sbomArchived } = archiveData?.project || ''
  const archivedVersion = sbomArchived?.find((item) => item?.id === sbomId)

  const { data: versionData, loading } = useQuery(GetProjectVersionAndId, {
    variables: {
      id: prodID,
      field: 'SBOMS_PROJECT_VERSION',
      direction: 'ASC'
    },
    skip: !prodID || !orgView
  })

  useEffect(() => {
    const sbom = versionData?.project?.sbomVersions?.nodes?.find(
      (i) => i.id === sbomId
    )
    setValue(sbom)
  }, [sbomId, setValue, versionData])

  const versions = versionData?.project?.sbomVersions?.nodes
  const totalCount = versionData?.project?.allSbomVersions?.totalCount

  const filterText = (item) => {
    return item?.length > 10 ? `${item?.substring(0, 10)}...` : item
  }

  const handleVersionClick = (version) => {
    setValue(version)
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      sbomid: version.id,
      paramsObj: {
        tab: 'general'
      }
    })
    navigate(link)
  }

  if (archivedVersion?.id)
    return <Link to={'#'}>{archivedVersion?.projectVersion}</Link>

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
        isSearchable
        value={value}
        options={versions}
        getOptionLabel={(version) => version.projectVersion}
        getOptionValue={(version) => version.id}
        onChange={(version) => handleVersionClick(version)}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: CustomDropdownIndicator
        }}
        hideSelectedOptions
        isLoading={loading}
        filterOption={customFilter}
      />
    )
  } else if (versions && totalCount === 1) {
    return (
      <Link to={generateProductVersionDetailPageUrlFromCurrentUrl()}>
        {filterText(sbomHookData.versionName)}
      </Link>
    )
  }

  return <Spinner size='xs' color={loaderColor} />
}

export default VersionBreadcrumb
